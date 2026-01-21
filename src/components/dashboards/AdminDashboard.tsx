import { motion } from "framer-motion";
import { Users, School, BarChart3, Activity, Building2, Settings, ArrowRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAdminData } from "@/hooks/useAdminData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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

export function AdminDashboard() {
  const navigate = useNavigate();
  const { stats, loading } = useAdminData();

  const participationData = [
    { name: "Participaron", value: stats.participationRate },
    { name: "Pendientes", value: 100 - stats.participationRate },
  ];

  const usersByRole = [
    { role: "Estudiantes", count: stats.totalStudents, color: "hsl(195, 85%, 55%)" },
    { role: "Docentes", count: stats.totalTeachers, color: "hsl(152, 55%, 45%)" },
    { role: "Dupla Psicosocial", count: stats.totalDupla, color: "hsl(280, 60%, 60%)" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Stats Grid - Compact */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Usuarios"
          value={loading ? "..." : stats.totalUsers.toString()}
          subtitle="Registrados"
          icon={Users}
          variant="primary"
          compact
        />
        <StatCard
          title="Estudiantes"
          value={loading ? "..." : stats.totalStudents.toString()}
          subtitle="Activos"
          icon={School}
          variant="secondary"
          compact
        />
        <StatCard
          title="Bienestar Promedio"
          value={loading ? "..." : (stats.avgWellbeing || 0).toFixed(1)}
          subtitle="Institucional"
          icon={Activity}
          trend={stats.avgWellbeing >= 3 ? { value: 2, isPositive: true } : undefined}
          compact
        />
        <StatCard
          title="Registros Hoy"
          value={loading ? "..." : stats.activeToday.toString()}
          subtitle={`${stats.participationRate}% participación`}
          icon={BarChart3}
          compact
        />
      </motion.div>

      {/* Charts Row - Compact */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Wellbeing by Level */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Bienestar por Nivel
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate("/reports")}>
                Ver más <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.wellbeingByLevel}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="level" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={[0, 5]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar 
                  dataKey="average" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Participation Pie Chart */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Participación del Día</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie
                    data={participationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    fill="#8884d8"
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {participationData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? "hsl(var(--success))" : "hsl(var(--muted))"} 
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                <div className="text-center">
                  <span className="text-3xl font-bold font-display">{stats.participationRate}%</span>
                  <p className="text-xs text-muted-foreground mt-1">Participación</p>
                </div>
                <div className="flex justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-muted-foreground">Activos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-muted" />
                    <span className="text-muted-foreground">Pendientes</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users by Role - Compact */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Usuarios por Rol
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate("/settings")}>
                Gestionar <Settings className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-3 gap-3">
              {usersByRole.map((item, index) => (
                <motion.div
                  key={item.role}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-lg bg-muted/40 border border-border/40 text-center"
                >
                  <div 
                    className="text-2xl font-bold font-display"
                    style={{ color: item.color }}
                  >
                    {item.count}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{item.role}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Admin Notice - Compact */}
      <motion.div variants={itemVariants}>
        <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
          <p className="text-xs text-muted-foreground text-center">
            📊 Como administrador, accedes a estadísticas agregadas. Para proteger la privacidad, no tienes acceso a fichas individuales.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
