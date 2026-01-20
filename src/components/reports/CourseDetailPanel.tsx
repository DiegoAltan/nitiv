import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Activity, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StudentReportCard } from "./StudentReportCard";
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
} from "recharts";
import { cn } from "@/lib/utils";

interface CourseDetailPanelProps {
  course: {
    id: string;
    name: string;
    level: string;
    studentCount: number;
    avgWellbeing: number;
    avgTeacherEval: number;
    discrepancy: number;
    participation: number;
    alertCount: number;
    topEmotions: { name: string; count: number }[];
    students: Array<{
      id: string;
      name: string;
      course: string;
      avgWellbeing: number;
      recordCount: number;
      lastRecord: string | null;
      topEmotions: string[];
      hasAlert: boolean;
      trend: "up" | "down" | "stable";
    }>;
  };
  onClose: () => void;
  onStudentClick?: (studentId: string) => void;
}

const emotionColors: Record<string, string> = {
  "Alegría": "hsl(45 85% 70%)",
  "Calma": "hsl(195 65% 65%)",
  "Ansiedad": "hsl(280 55% 70%)",
  "Tristeza": "hsl(215 55% 65%)",
  "Enojo": "hsl(355 65% 65%)",
  "Cansancio": "hsl(215 25% 60%)",
  "Gratitud": "hsl(160 55% 48%)",
  "Motivación": "hsl(145 50% 55%)",
  "Frustración": "hsl(25 75% 65%)",
  "Preocupación": "hsl(280 55% 70%)",
};

export function CourseDetailPanel({ course, onClose, onStudentClick }: CourseDetailPanelProps) {
  const wellbeingDistribution = [
    { name: "Muy Alto (5)", value: course.students.filter(s => s.avgWellbeing >= 4.5).length, fill: "hsl(var(--wellbeing-5))" },
    { name: "Alto (4)", value: course.students.filter(s => s.avgWellbeing >= 3.5 && s.avgWellbeing < 4.5).length, fill: "hsl(var(--wellbeing-4))" },
    { name: "Medio (3)", value: course.students.filter(s => s.avgWellbeing >= 2.5 && s.avgWellbeing < 3.5).length, fill: "hsl(var(--wellbeing-3))" },
    { name: "Bajo (2)", value: course.students.filter(s => s.avgWellbeing >= 1.5 && s.avgWellbeing < 2.5).length, fill: "hsl(var(--wellbeing-2))" },
    { name: "Muy Bajo (1)", value: course.students.filter(s => s.avgWellbeing > 0 && s.avgWellbeing < 1.5).length, fill: "hsl(var(--wellbeing-1))" },
  ].filter(d => d.value > 0);

  const emotionChartData = course.topEmotions.slice(0, 6).map(e => ({
    name: e.name,
    value: e.count,
    fill: emotionColors[e.name] || "hsl(var(--primary))",
  }));

  const sortedStudents = [...course.students].sort((a, b) => {
    // Prioritize alerts, then low wellbeing
    if (a.hasAlert && !b.hasAlert) return -1;
    if (!a.hasAlert && b.hasAlert) return 1;
    return a.avgWellbeing - b.avgWellbeing;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="h-full flex flex-col"
    >
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-display">{course.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Reporte detallado del curso
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1">
          <CardContent className="p-4 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-center">
                <p className="text-2xl font-bold text-primary">{course.avgWellbeing}</p>
                <p className="text-xs text-muted-foreground">Bienestar Prom.</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary text-center">
                <p className="text-2xl font-bold text-secondary-foreground">{course.studentCount}</p>
                <p className="text-xs text-muted-foreground">Estudiantes</p>
              </div>
              <div className="p-3 rounded-xl bg-success/10 text-center">
                <p className="text-2xl font-bold text-success">{course.participation}%</p>
                <p className="text-xs text-muted-foreground">Participación</p>
              </div>
              <div className="p-3 rounded-xl bg-alert/10 text-center">
                <p className="text-2xl font-bold text-alert">{course.alertCount}</p>
                <p className="text-xs text-muted-foreground">Alertas</p>
              </div>
            </div>

            {/* Comparison Chart */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Comparación de Evaluaciones
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Autoevaluación</span>
                    <span className="font-medium">{course.avgWellbeing}/5</span>
                  </div>
                  <Progress value={(course.avgWellbeing / 5) * 100} className="h-3" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Evaluación Docente</span>
                    <span className="font-medium">{course.avgTeacherEval}/5</span>
                  </div>
                  <Progress value={(course.avgTeacherEval / 5) * 100} className="h-3" />
                </div>
              </div>
              {course.discrepancy > 0.3 && (
                <Badge variant="outline" className="text-warning border-warning">
                  Discrepancia significativa: {course.discrepancy}
                </Badge>
              )}
            </div>

            {/* Wellbeing Distribution */}
            {wellbeingDistribution.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Distribución de Bienestar</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={wellbeingDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {wellbeingDistribution.map((entry, index) => (
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
                <div className="flex flex-wrap gap-2 justify-center">
                  {wellbeingDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: item.fill }} />
                      <span>{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emotion Chart */}
            {emotionChartData.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Emociones Frecuentes</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={emotionChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" fontSize={10} />
                    <YAxis type="category" dataKey="name" fontSize={10} width={70} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {emotionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Student List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Estudiantes del Curso
                </h4>
                <Badge variant="outline">{course.students.length} total</Badge>
              </div>
              <div className="space-y-1 bg-muted/30 rounded-xl p-2">
                {sortedStudents.map((student) => (
                  <StudentReportCard
                    key={student.id}
                    student={student}
                    compact
                    onClick={() => onStudentClick?.(student.id)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </ScrollArea>
      </Card>
    </motion.div>
  );
}
