import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface WellbeingData {
  date: string;
  level: number;
}

interface WellbeingTrendChartProps {
  studentName?: string;
  weeklyData?: WellbeingData[];
  monthlyData?: WellbeingData[];
  className?: string;
}

// Sample data
const defaultWeeklyData: WellbeingData[] = [
  { date: "Lun", level: 4 },
  { date: "Mar", level: 3 },
  { date: "Mie", level: 4 },
  { date: "Jue", level: 5 },
  { date: "Vie", level: 4 },
];

const defaultMonthlyData: WellbeingData[] = [
  { date: "Sem 1", level: 3.5 },
  { date: "Sem 2", level: 3.8 },
  { date: "Sem 3", level: 3.6 },
  { date: "Sem 4", level: 4.0 },
];

export function WellbeingTrendChart({
  studentName,
  weeklyData = defaultWeeklyData,
  monthlyData = defaultMonthlyData,
  className,
}: WellbeingTrendChartProps) {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const data = period === "weekly" ? weeklyData : monthlyData;

  return (
    <Card className={cn("card-elevated", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {studentName ? `Evolución de ${studentName}` : "Evolución del bienestar"}
          </CardTitle>
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPeriod("weekly")}
              className={cn(
                "h-7 px-3 text-xs",
                period === "weekly" && "bg-background shadow-sm"
              )}
            >
              Semanal
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPeriod("monthly")}
              className={cn(
                "h-7 px-3 text-xs",
                period === "monthly" && "bg-background shadow-sm"
              )}
            >
              Mensual
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="wellbeingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[1, 5]}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              ticks={[1, 2, 3, 4, 5]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-md)",
              }}
              formatter={(value: number) => [value.toFixed(1), "Bienestar"]}
            />
            <Area
              type="monotone"
              dataKey="level"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#wellbeingGradient)"
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
