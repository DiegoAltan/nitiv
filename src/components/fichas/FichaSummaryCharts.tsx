import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseRecord } from "@/hooks/useCaseRecords";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { format, startOfMonth, subMonths, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface FichaSummaryChartsProps {
  records: CaseRecord[];
}

const recordTypeLabels: Record<string, string> = {
  conducta: "Conducta",
  atencion: "Atención",
  cita: "Cita",
  observacion: "Observación",
  seguimiento: "Seguimiento",
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--warning))", "hsl(var(--success))", "hsl(var(--accent))", "hsl(var(--secondary))"];

export function FichaSummaryCharts({ records }: FichaSummaryChartsProps) {
  // Distribution by record type
  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach((record) => {
      counts[record.record_type] = (counts[record.record_type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      name: recordTypeLabels[type] || type,
      value: count,
    }));
  }, [records]);

  // Monthly trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const months: { month: string; start: Date; end: Date }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = i === 0 ? now : startOfMonth(subMonths(now, i - 1));
      months.push({
        month: format(monthStart, "MMM yy", { locale: es }),
        start: monthStart,
        end: monthEnd,
      });
    }

    return months.map(({ month, start, end }) => {
      const count = records.filter((record) => {
        try {
          const recordDate = parseISO(record.date_recorded);
          return isWithinInterval(recordDate, { start, end: new Date(end.getTime() - 1) });
        } catch {
          return false;
        }
      }).length;
      return { month, registros: count };
    });
  }, [records]);

  if (records.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Type Distribution Pie Chart */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display">Distribución por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {typeDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {typeDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trend Bar Chart */}
      <Card className="card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display">Tendencia Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar 
                  dataKey="registros" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  name="Registros"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}