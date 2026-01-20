import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Award,
  Building,
  Calendar,
} from "lucide-react";
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
  Area,
  AreaChart,
} from "recharts";
import { useExecutiveData } from "@/hooks/useExecutiveData";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
const EMOTION_COLORS = {
  alegría: "#facc15",
  calma: "#22c55e",
  tristeza: "#3b82f6",
  ansiedad: "#f97316",
  enojo: "#ef4444",
  miedo: "#8b5cf6",
};

export function ExecutiveDashboard() {
  const { stats, loading } = useExecutiveData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const wellbeingDistribution = [
    { name: "Muy Bajo (1)", value: stats.wellbeingDistribution.level1, color: "#ef4444" },
    { name: "Bajo (2)", value: stats.wellbeingDistribution.level2, color: "#f97316" },
    { name: "Medio (3)", value: stats.wellbeingDistribution.level3, color: "#facc15" },
    { name: "Alto (4)", value: stats.wellbeingDistribution.level4, color: "#22c55e" },
    { name: "Muy Alto (5)", value: stats.wellbeingDistribution.level5, color: "#10b981" },
  ];

  const emotionData = Object.entries(stats.emotionDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: EMOTION_COLORS[name as keyof typeof EMOTION_COLORS] || "#6b7280",
  }));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Executive Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-2">
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-3 py-1">
          <Award className="w-4 h-4 mr-1" />
          Dashboard Ejecutivo
        </Badge>
        <span className="text-muted-foreground text-sm">
          Resumen institucional actualizado
        </span>
      </motion.div>

      {/* Key Performance Indicators */}
      <motion.div variants={itemVariants}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          KPIs Principales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bienestar Institucional</p>
                <p className="text-2xl font-bold">{stats.averageWellbeing.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Promedio general</p>
              </div>
              <Activity className="w-8 h-8 text-primary/50" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Participación Diaria</p>
                <p className="text-2xl font-bold">{stats.participationRate}%</p>
                <p className="text-xs text-muted-foreground">{stats.activeStudents} estudiantes activos</p>
              </div>
              <Users className="w-8 h-8 text-green-500/50" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Activas</p>
                <p className="text-2xl font-bold">{stats.activeAlerts}</p>
                <p className="text-xs text-muted-foreground">{stats.criticalAlerts} críticas</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500/50" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Discrepancia Media</p>
                <p className="text-2xl font-bold">{stats.discrepancyLabel}</p>
                <p className="text-xs text-muted-foreground">Docente vs Estudiante</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Secondary KPIs */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Estudiantes</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.totalStudents}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Cursos Activos</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{stats.totalCourses}</p>
              </div>
              <Building className="w-10 h-10 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Registros Hoy</p>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{stats.todayRecords}</p>
              </div>
              <Calendar className="w-10 h-10 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wellbeing Distribution */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary" />
                Distribución de Bienestar
              </CardTitle>
              <CardDescription>
                Porcentaje de estudiantes por nivel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wellbeingDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => 
                        percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                      }
                    >
                      {wellbeingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value} estudiantes`, 'Cantidad']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Trend */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Tendencia Semanal
              </CardTitle>
              <CardDescription>
                Evolución del bienestar vs evaluación docente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.weeklyTrend}>
                    <defs>
                      <linearGradient id="colorStudent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTeacher" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis domain={[1, 5]} className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="estudiante"
                      name="Autoevaluación"
                      stroke="#8b5cf6"
                      fill="url(#colorStudent)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="docente"
                      name="Eval. Docente"
                      stroke="#22c55e"
                      fill="url(#colorTeacher)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Emotion Distribution & Course Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Distribution */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Emociones Predominantes
              </CardTitle>
              <CardDescription>
                Distribución emocional institucional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emotionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" width={80} className="text-xs" />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, 'Frecuencia']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {emotionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top/Bottom Courses */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Rendimiento por Curso
              </CardTitle>
              <CardDescription>
                Comparativa de bienestar promedio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.coursePerformance}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis domain={[0, 5]} className="text-xs" />
                    <Tooltip
                      formatter={(value: number) => [value.toFixed(1), 'Bienestar']}
                    />
                    <Bar dataKey="wellbeing" name="Bienestar" radius={[4, 4, 0, 0]}>
                      {stats.coursePerformance.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.wellbeing >= 3.5 ? "#22c55e" : entry.wellbeing >= 2.5 ? "#f59e0b" : "#ef4444"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Insights */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Insights Clave
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-background/60 rounded-lg">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Mejor Rendimiento</h4>
                <p className="text-lg font-semibold">{stats.topCourse || "N/A"}</p>
                <p className="text-sm text-green-600">Mayor bienestar promedio</p>
              </div>
              <div className="p-4 bg-background/60 rounded-lg">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Requiere Atención</h4>
                <p className="text-lg font-semibold">{stats.bottomCourse || "N/A"}</p>
                <p className="text-sm text-amber-600">Menor bienestar promedio</p>
              </div>
              <div className="p-4 bg-background/60 rounded-lg">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Emoción Dominante</h4>
                <p className="text-lg font-semibold capitalize">{stats.dominantEmotion || "N/A"}</p>
                <p className="text-sm text-blue-600">Más frecuente esta semana</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
