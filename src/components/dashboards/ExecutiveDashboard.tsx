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
import { AIAnalysisCard } from "@/components/ai/AIAnalysisCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
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
      <div className="flex items-center justify-center h-48">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const wellbeingDistribution = [
    { name: "Muy Bajo", value: stats.wellbeingDistribution.level1, color: "#ef4444" },
    { name: "Bajo", value: stats.wellbeingDistribution.level2, color: "#f97316" },
    { name: "Medio", value: stats.wellbeingDistribution.level3, color: "#facc15" },
    { name: "Alto", value: stats.wellbeingDistribution.level4, color: "#22c55e" },
    { name: "Muy Alto", value: stats.wellbeingDistribution.level5, color: "#10b981" },
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
      className="space-y-4"
    >
      {/* Executive Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-2.5 py-0.5 text-xs">
          <Award className="w-3 h-3 mr-1" />
          Dashboard Ejecutivo
        </Badge>
        <span className="text-muted-foreground text-xs">
          Resumen institucional
        </span>
      </motion.div>

      {/* Key Performance Indicators - Compact */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Card className="p-3 border-border/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Bienestar</p>
                <p className="text-xl font-bold font-display">{stats.averageWellbeing.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground">Promedio</p>
              </div>
              <Activity className="w-6 h-6 text-primary/40" />
            </div>
          </Card>
          <Card className="p-3 border-border/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Participación</p>
                <p className="text-xl font-bold font-display">{stats.participationRate}%</p>
                <p className="text-[10px] text-muted-foreground">{stats.activeStudents} activos</p>
              </div>
              <Users className="w-6 h-6 text-success/40" />
            </div>
          </Card>
          <Card className="p-3 border-border/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Alertas</p>
                <p className="text-xl font-bold font-display">{stats.activeAlerts}</p>
                <p className="text-[10px] text-muted-foreground">{stats.criticalAlerts} críticas</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-warning/40" />
            </div>
          </Card>
          <Card className="p-3 border-border/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Discrepancia</p>
                <p className="text-xl font-bold font-display">{stats.discrepancyLabel}</p>
                <p className="text-[10px] text-muted-foreground">Doc vs Est</p>
              </div>
              <BarChart3 className="w-6 h-6 text-muted-foreground/40" />
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Secondary KPIs - Compact */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Estudiantes</p>
                <p className="text-2xl font-bold font-display text-blue-700 dark:text-blue-300">{stats.totalStudents}</p>
              </div>
              <Users className="w-7 h-7 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/50 dark:border-purple-800/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Cursos</p>
                <p className="text-2xl font-bold font-display text-purple-700 dark:text-purple-300">{stats.totalCourses}</p>
              </div>
              <Building className="w-7 h-7 text-purple-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200/50 dark:border-emerald-800/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Hoy</p>
                <p className="text-2xl font-bold font-display text-emerald-700 dark:text-emerald-300">{stats.todayRecords}</p>
              </div>
              <Calendar className="w-7 h-7 text-emerald-500/30" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Wellbeing Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-primary" />
                Distribución de Bienestar
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wellbeingDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {wellbeingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}`, 'Estudiantes']}
                      contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '10px' }}
                      layout="horizontal"
                      verticalAlign="bottom"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Trend */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Tendencia Semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="h-[180px]">
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
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis domain={[1, 5]} fontSize={10} tickLine={false} axisLine={false} width={25} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                    <Area
                      type="monotone"
                      dataKey="estudiante"
                      name="Estudiante"
                      stroke="#8b5cf6"
                      fill="url(#colorStudent)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="docente"
                      name="Docente"
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

      {/* Emotion & Course Performance - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Emotion Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Emociones Predominantes
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emotionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" width={60} fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, 'Frecuencia']}
                      contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
                    />
                    <Bar dataKey="value" radius={[0, 3, 3, 0]}>
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

        {/* Course Performance */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Rendimiento por Curso
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.coursePerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 5]} fontSize={10} tickLine={false} axisLine={false} width={25} />
                    <Tooltip
                      formatter={(value: number) => [value.toFixed(1), 'Bienestar']}
                      contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
                    />
                    <Bar dataKey="wellbeing" radius={[3, 3, 0, 0]}>
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

      {/* AI Analysis Section */}
      <motion.div variants={itemVariants}>
        <AIAnalysisCard
          title="Análisis Ejecutivo IA"
          analysisType="executive"
          dashboardData={{
            overallWellbeing: stats.averageWellbeing,
            participation: stats.participationRate,
            activeAlerts: stats.activeAlerts,
            totalStudents: stats.totalStudents,
            totalRecords: stats.todayRecords,
            trend: stats.weeklyTrend.length > 1 
              ? (stats.weeklyTrend[stats.weeklyTrend.length - 1].estudiante > stats.weeklyTrend[0].estudiante ? "Ascendente" : "Descendente")
              : "Estable",
            avgDiscrepancy: stats.discrepancyLabel,
          }}
        />
      </motion.div>

      {/* Quick Insights - Compact */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/15">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Insights Clave
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-background/60 rounded-lg">
                <h4 className="font-medium text-xs text-muted-foreground mb-0.5">Mejor Rendimiento</h4>
                <p className="text-sm font-semibold">{stats.topCourse || "N/A"}</p>
                <p className="text-[10px] text-success">Mayor bienestar</p>
              </div>
              <div className="p-2.5 bg-background/60 rounded-lg">
                <h4 className="font-medium text-xs text-muted-foreground mb-0.5">Requiere Atención</h4>
                <p className="text-sm font-semibold">{stats.bottomCourse || "N/A"}</p>
                <p className="text-[10px] text-warning">Menor bienestar</p>
              </div>
              <div className="p-2.5 bg-background/60 rounded-lg">
                <h4 className="font-medium text-xs text-muted-foreground mb-0.5">Emoción Dominante</h4>
                <p className="text-sm font-semibold capitalize">{stats.dominantEmotion || "N/A"}</p>
                <p className="text-[10px] text-primary">Esta semana</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
