import { useMemo } from "react";
import { motion } from "framer-motion";
import { Cloud, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useClassroomClimate } from "@/hooks/useClassroomClimate";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const climateEmojis: Record<string, string> = {
  positivo: "☀️",
  neutro: "⛅",
  tenso: "🌧️",
  conflictivo: "⛈️",
};

const climateLabels: Record<string, string> = {
  positivo: "Positivo",
  neutro: "Neutro",
  tenso: "Tenso",
  conflictivo: "Conflictivo",
};

const climateStyles: Record<string, string> = {
  positivo: "text-success bg-success/10",
  neutro: "text-warning bg-warning/10",
  tenso: "text-alert bg-alert/10",
  conflictivo: "text-destructive bg-destructive/10",
};

export function ClimateSummaryWidget() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { records, loading } = useClassroomClimate();

  const summary = useMemo(() => {
    if (!profile?.id || !records.length) return null;

    const myRecords = records.filter((r) => r.teacher_id === profile.id);
    if (!myRecords.length) return null;

    // Last record
    const last = myRecords[0];

    // Weekly distribution (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekRecords = myRecords.filter((r) => new Date(r.recorded_at) >= weekAgo);

    const weekDist: Record<string, number> = { positivo: 0, neutro: 0, tenso: 0, conflictivo: 0 };
    weekRecords.forEach((r) => {
      weekDist[r.climate_level] = (weekDist[r.climate_level] || 0) + 1;
    });

    const total = weekRecords.length;

    return { last, weekDist, total };
  }, [records, profile?.id]);

  if (loading || !summary) return null;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Cloud className="w-4 h-4 text-primary" />
            Clima de Aula
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => navigate("/classroom-climate")}
          >
            Ver más <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex items-center gap-4">
          {/* Last record */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{climateEmojis[summary.last.climate_level] || "❓"}</span>
            <div>
              <p className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded inline-block",
                climateStyles[summary.last.climate_level] || ""
              )}>
                {climateLabels[summary.last.climate_level] || summary.last.climate_level}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Último registro</p>
            </div>
          </div>

          {/* Mini weekly bars */}
          <div className="flex-1 flex items-end gap-1 h-8">
            {Object.entries(summary.weekDist).map(([key, count]) => {
              const pct = summary.total > 0 ? (count / summary.total) * 100 : 0;
              if (pct === 0) return null;
              const colors: Record<string, string> = {
                positivo: "bg-success",
                neutro: "bg-warning",
                tenso: "bg-alert",
                conflictivo: "bg-destructive",
              };
              return (
                <motion.div
                  key={key}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, 15)}%` }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className={cn("flex-1 rounded-t", colors[key])}
                  title={`${climateLabels[key]}: ${count}`}
                />
              );
            })}
          </div>

          <div className="text-right">
            <p className="text-lg font-bold font-display">{summary.total}</p>
            <p className="text-[10px] text-muted-foreground">esta semana</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
