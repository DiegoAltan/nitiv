import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Calendar, ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ComparisonData {
  current: {
    wellbeing: number;
    participation: number;
    alerts: number;
    records: number;
  };
  previous: {
    wellbeing: number;
    participation: number;
    alerts: number;
    records: number;
  };
  periodLabel: string;
}

interface HistoricalComparisonProps {
  comparisonPeriod: string;
  onPeriodChange: (period: string) => void;
  data: ComparisonData;
}

function getChangeIndicator(current: number, previous: number, inverse = false) {
  if (previous === 0) return { icon: Minus, color: "text-muted-foreground", label: "Sin datos previos" };
  
  const change = ((current - previous) / previous) * 100;
  const isPositive = inverse ? change < 0 : change > 0;
  
  if (Math.abs(change) < 3) {
    return { icon: Minus, color: "text-muted-foreground", label: "Estable", change: 0 };
  }
  
  return {
    icon: isPositive ? TrendingUp : TrendingDown,
    color: isPositive ? "text-success" : "text-alert",
    label: isPositive ? "Mejora" : "Deterioro",
    change: Math.round(change),
  };
}

function formatChange(change: number | undefined): string {
  if (change === undefined || change === 0) return "~0%";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change}%`;
}

export function HistoricalComparison({ comparisonPeriod, onPeriodChange, data }: HistoricalComparisonProps) {
  const wellbeingIndicator = getChangeIndicator(data.current.wellbeing, data.previous.wellbeing);
  const participationIndicator = getChangeIndicator(data.current.participation, data.previous.participation);
  const alertsIndicator = getChangeIndicator(data.current.alerts, data.previous.alerts, true);
  const recordsIndicator = getChangeIndicator(data.current.records, data.previous.records);

  const metrics = [
    {
      label: "Bienestar Promedio",
      current: data.current.wellbeing.toFixed(1),
      previous: data.previous.wellbeing.toFixed(1),
      indicator: wellbeingIndicator,
      unit: "/5",
    },
    {
      label: "Participación",
      current: `${Math.round(data.current.participation)}`,
      previous: `${Math.round(data.previous.participation)}`,
      indicator: participationIndicator,
      unit: "%",
    },
    {
      label: "Alertas Activas",
      current: data.current.alerts.toString(),
      previous: data.previous.alerts.toString(),
      indicator: alertsIndicator,
      unit: "",
    },
    {
      label: "Registros",
      current: data.current.records.toString(),
      previous: data.previous.records.toString(),
      indicator: recordsIndicator,
      unit: "",
    },
  ];

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            Comparación Histórica
          </CardTitle>
          <Select value={comparisonPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-48">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="previous-week">vs Semana Anterior</SelectItem>
              <SelectItem value="previous-month">vs Mes Anterior</SelectItem>
              <SelectItem value="previous-quarter">vs Trimestre Anterior</SelectItem>
              <SelectItem value="same-month-last-year">vs Mismo Mes (Año Anterior)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">{data.periodLabel}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.indicator.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-muted/50 space-y-2"
              >
                <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
                
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">{metric.current}</span>
                  <span className="text-sm text-muted-foreground mb-0.5">{metric.unit}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Anterior: {metric.previous}{metric.unit}
                  </span>
                  <div className={cn("flex items-center gap-1", metric.indicator.color)}>
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">
                      {formatChange(metric.indicator.change)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-2">
            {wellbeingIndicator.change !== undefined && wellbeingIndicator.change > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-success" />
                <p className="text-sm">
                  <span className="font-medium text-success">Tendencia positiva: </span>
                  <span className="text-muted-foreground">
                    El bienestar ha mejorado {formatChange(wellbeingIndicator.change)} respecto al período anterior.
                  </span>
                </p>
              </>
            ) : wellbeingIndicator.change !== undefined && wellbeingIndicator.change < 0 ? (
              <>
                <TrendingDown className="w-4 h-4 text-alert" />
                <p className="text-sm">
                  <span className="font-medium text-alert">Atención: </span>
                  <span className="text-muted-foreground">
                    El bienestar ha disminuido {formatChange(Math.abs(wellbeingIndicator.change))} respecto al período anterior.
                  </span>
                </p>
              </>
            ) : (
              <>
                <Minus className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  El bienestar se mantiene estable respecto al período anterior.
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
