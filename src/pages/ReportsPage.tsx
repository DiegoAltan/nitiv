import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Download, Calendar } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock data for charts
const weeklyTrend = [
  { name: "Lun", estudiante: 3.8, docente: 3.5 },
  { name: "Mar", estudiante: 3.6, docente: 3.4 },
  { name: "Mie", estudiante: 3.9, docente: 3.7 },
  { name: "Jue", estudiante: 4.1, docente: 3.8 },
  { name: "Vie", estudiante: 3.7, docente: 3.6 },
];

const monthlyTrend = [
  { name: "Sem 1", estudiante: 3.5, docente: 3.3 },
  { name: "Sem 2", estudiante: 3.7, docente: 3.5 },
  { name: "Sem 3", estudiante: 3.6, docente: 3.4 },
  { name: "Sem 4", estudiante: 3.9, docente: 3.7 },
];

const courseComparison = [
  { name: "6°A", bienestar: 4.1, evaluacion: 3.9 },
  { name: "6°B", bienestar: 3.8, evaluacion: 3.6 },
  { name: "7°A", bienestar: 3.5, evaluacion: 3.3 },
  { name: "7°B", bienestar: 3.9, evaluacion: 3.7 },
  { name: "8°A", bienestar: 3.7, evaluacion: 3.5 },
  { name: "8°B", bienestar: 4.0, evaluacion: 3.8 },
];

const levelDistribution = [
  { name: "6° Básico", value: 35, fill: "hsl(var(--primary))" },
  { name: "7° Básico", value: 40, fill: "hsl(var(--secondary))" },
  { name: "8° Básico", value: 45, fill: "hsl(var(--accent))" },
];

const emotionDistribution = [
  { name: "Alegría", value: 35, fill: "hsl(var(--emotion-joy))" },
  { name: "Calma", value: 25, fill: "hsl(var(--emotion-calm))" },
  { name: "Ansiedad", value: 15, fill: "hsl(var(--emotion-anxiety))" },
  { name: "Tristeza", value: 10, fill: "hsl(var(--emotion-sadness))" },
  { name: "Enojo", value: 8, fill: "hsl(var(--emotion-anger))" },
  { name: "Cansancio", value: 7, fill: "hsl(var(--emotion-tiredness))" },
];

const discrepancyData = [
  { name: "6°A", discrepancia: 0.2 },
  { name: "6°B", discrepancia: 0.3 },
  { name: "7°A", discrepancia: 0.4 },
  { name: "7°B", discrepancia: 0.2 },
  { name: "8°A", discrepancia: 0.5 },
  { name: "8°B", discrepancia: 0.3 },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState("week");
  const [selectedLevel, setSelectedLevel] = useState("all");

  return (
    <AppLayout title="Reportes" subtitle="Visualizaciones y análisis del bienestar escolar">
      <div className="space-y-6">
        {/* Filters Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="quarter">Este trimestre</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                <SelectItem value="6">6° Básico</SelectItem>
                <SelectItem value="7">7° Básico</SelectItem>
                <SelectItem value="8">8° Básico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar reporte
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3.8</p>
                  <p className="text-xs text-muted-foreground">Bienestar promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">847</p>
                  <p className="text-xs text-muted-foreground">Estudiantes activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">92%</p>
                  <p className="text-xs text-muted-foreground">Participación</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <span className="text-warning font-bold">0.3</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">Baja</p>
                  <p className="text-xs text-muted-foreground">Discrepancia prom.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts */}
        <Tabs defaultValue="comparison" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="comparison">Comparativa</TabsTrigger>
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
            <TabsTrigger value="distribution">Distribución</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student vs Teacher Comparison by Course */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Autoevaluación vs Evaluación Docente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={courseComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="bienestar"
                        name="Autoevaluación"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="evaluacion"
                        name="Evaluación Docente"
                        fill="hsl(var(--secondary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Discrepancy Chart */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-warning" />
                    Discrepancia por Curso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={discrepancyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis domain={[0, 1]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="discrepancia"
                        name="Discrepancia"
                        fill="hsl(var(--warning))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Una discrepancia mayor a 0.5 indica diferencia significativa entre percepciones
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Trend */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-lg font-display">Tendencia Semanal</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis domain={[1, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="estudiante"
                        name="Autoevaluación"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="docente"
                        name="Evaluación Docente"
                        stroke="hsl(var(--secondary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--secondary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Trend */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-lg font-display">Tendencia Mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis domain={[1, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="estudiante"
                        name="Autoevaluación"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary) / 0.2)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="docente"
                        name="Evaluación Docente"
                        stroke="hsl(var(--secondary))"
                        fill="hsl(var(--secondary) / 0.2)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Students by Level */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-lg font-display">Estudiantes por Nivel</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={levelDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {levelDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
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
                </CardContent>
              </Card>

              {/* Emotion Distribution */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-lg font-display">Emociones Reportadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={emotionDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" name="Frecuencia %" radius={[0, 4, 4, 0]}>
                        {emotionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
