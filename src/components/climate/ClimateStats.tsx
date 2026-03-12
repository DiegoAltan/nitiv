import { useMemo } from "react";
import { motion } from "framer-motion";
import { Cloud, Zap, Users, AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClassroomClimate } from "@/hooks/useClassroomClimate";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const climateColors: Record<string, string> = {
  positivo: "hsl(152, 55%, 45%)",
  neutro: "hsl(38, 92%, 52%)",
  tenso: "hsl(0, 72%, 58%)",
  conflictivo: "hsl(280, 65%, 60%)",
};

const climateLabels: Record<string, string> = {
  positivo: "Positivo",
  neutro: "Neutro",
  tenso: "Tenso",
  conflictivo: "Conflictivo",
};

const climateEmojis: Record<string, string> = {
  positivo: "☀️",
  neutro: "⛅",
  tenso: "🌧️",
  conflictivo: "⛈️",
};

export function ClimateStats() {
  const { records, loading } = useClassroomClimate();

  const stats = useMemo(() => {
    if (!records.length) return null;

    // Last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = records.filter(
      (r) => new Date(r.recorded_at) >= thirtyDaysAgo
    );

    // Climate distribution
    const climateCounts: Record<string, number> = { positivo: 0, neutro: 0, tenso: 0, conflictivo: 0 };
    recent.forEach((r) => {
      climateCounts[r.climate_level] = (climateCounts[r.climate_level] || 0) + 1;
    });

    const pieData = Object.entries(climateCounts)
      .filter(([_, v]) => v > 0)
      .map(([key, value]) => ({
        name: climateLabels[key] || key,
        value,
        color: climateColors[key],
      }));

    // Conflicts count
    const conflicts = recent.filter((r) => r.conflict_present).length;

    // Weekly trend (last 4 weeks)
    const weeklyData: { week: string; positivo: number; neutro: number; tenso: number; conflictivo: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      const weekLabel = `Sem ${4 - i}`;

      const weekRecords = recent.filter((r) => {
        const d = new Date(r.recorded_at);
        return d >= weekStart && d < weekEnd;
      });

      weeklyData.push({
        week: weekLabel,
        positivo: weekRecords.filter((r) => r.climate_level === "positivo").length,
        neutro: weekRecords.filter((r) => r.climate_level === "neutro").length,
        tenso: weekRecords.filter((r) => r.climate_level === "tenso").length,
        conflictivo: weekRecords.filter((r) => r.climate_level === "conflictivo").length,
      });
    }

    // Dominant climate
    const dominant = Object.entries(climateCounts).sort((a, b) => b[1] - a[1])[0];

    // Energy distribution
    const energyCounts: Record<string, number> = { alta: 0, moderada: 0, baja: 0 };
    recent.forEach((r) => {
      energyCounts[r.energy_level] = (energyCounts[r.energy_level] || 0) + 1;
    });

    // Participation distribution
    const partCounts: Record<string, number> = { activa: 0, parcial: 0, pasiva: 0 };
    recent.forEach((r) => {
      partCounts[r.participation_level] = (partCounts[r.participation_level] || 0) + 1;
    });

    return {
      total: recent.length,
      conflicts,
      dominant: dominant ? { key: dominant[0], count: dominant[1] } : null,
      pieData,
      weeklyData,
      energyCounts,
      partCounts,
    };
  }, [records]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-32 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-8 text-center">
          <Cloud className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            Aún no hay registros de clima de aula.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border/60 p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Registros</span>
          </div>
          <p className="text-2xl font-bold font-display">{stats.total}</p>
          <p className="text-xs text-muted-foreground">últimos 30 días</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-xl border border-border/60 p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Predominante</span>
          </div>
          <p className="text-xl font-bold font-display flex items-center gap-1.5">
            {stats.dominant && climateEmojis[stats.dominant.key]}
            <span className="text-base">{stats.dominant && climateLabels[stats.dominant.key]}</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border/60 p-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Energía alta</span>
          </div>
          <p className="text-2xl font-bold font-display">
            {stats.total > 0
              ? Math.round((stats.energyCounts.alta / stats.total) * 100)
              : 0}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={cn(
            "bg-card rounded-xl border p-3",
            stats.conflicts > 0 ? "border-alert/30 bg-alert/5" : "border-border/60"
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={cn("w-4 h-4", stats.conflicts > 0 ? "text-alert" : "text-muted-foreground")} />
            <span className="text-xs text-muted-foreground">Conflictos</span>
          </div>
          <p className="text-2xl font-bold font-display">{stats.conflicts}</p>
          <p className="text-xs text-muted-foreground">reportados</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pie chart */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribución de Clima</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  formatter={(value) => <span className="text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly trend */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tendencia Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="positivo" fill={climateColors.positivo} stackId="a" name="Positivo" radius={[0, 0, 0, 0]} />
                <Bar dataKey="neutro" fill={climateColors.neutro} stackId="a" name="Neutro" />
                <Bar dataKey="tenso" fill={climateColors.tenso} stackId="a" name="Tenso" />
                <Bar dataKey="conflictivo" fill={climateColors.conflictivo} stackId="a" name="Conflictivo" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Participation breakdown */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Participación y Energía
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Participación</p>
              {Object.entries(stats.partCounts).map(([key, count]) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                const labels: Record<string, string> = { activa: "Activa 🙋", parcial: "Parcial ✋", pasiva: "Pasiva 😶" };
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{labels[key]}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Energía</p>
              {Object.entries(stats.energyCounts).map(([key, count]) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                const labels: Record<string, string> = { alta: "Alta ⚡", moderada: "Moderada 🔋", baja: "Baja 🪫" };
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{labels[key]}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="h-full bg-warning rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
