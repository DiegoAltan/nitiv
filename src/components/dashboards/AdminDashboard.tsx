import { motion } from "framer-motion";
import { Users, School, BarChart3, Activity, Sparkles, Building2, Settings, ArrowRight } from "lucide-react";
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
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
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
    { role: "Estudiantes", count: stats.totalStudents },
    { role: "Docentes", count: stats.totalTeachers },
    { role: "Dupla Psicosocial", count: stats.totalDupla },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Usuarios"
          value={loading ? "..." : stats.totalUsers.toString()}
          subtitle="Registrados"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Estudiantes"
          value={loading ? "..." : stats.totalStudents.toString()}
          subtitle="Activos"
          icon={School}
          variant="secondary"
        />
        <StatCard
          title="Bienestar Promedio"
          value={loading ? "..." : (stats.avgWellbeing || 0).toString()}
          subtitle="Institucional"
          icon={Activity}
          trend={stats.avgWellbeing >= 3 ? { value: 2, isPositive: true } : undefined}
          variant="default"
        />
        <StatCard
          title="Registros Hoy"
          value={loading ? "..." : stats.activeToday.toString()}
          subtitle={`${stats.participationRate}% participación`}
          icon={BarChart3}
          variant="default"
        />
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wellbeing by Level */}
        <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              Bienestar por Nivel
              <Sparkles className="w-4 h-4 text-warning" />
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/reports")}>
              Ver reportes <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.wellbeingByLevel}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="level" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  domain={[0, 5]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar 
                  dataKey="average" 
                  fill="hsl(265, 65%, 65%)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Participation Pie Chart */}
        <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-display">Participación del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={participationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {participationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? "hsl(160, 50%, 55%)" : "hsl(var(--muted))"} 
                    />
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
            <div className="text-center -mt-4">
              <span className="text-2xl font-bold">{stats.participationRate}%</span>
              <span className="text-muted-foreground ml-2">participación</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users by Role */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Usuarios por Rol
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
              Gestionar <Settings className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {usersByRole.map((item, index) => (
                <motion.div
                  key={item.role}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-muted/30 backdrop-blur-sm border border-border/50 text-center"
                >
                  <div className="text-3xl font-bold text-primary">{item.count}</div>
                  <div className="text-sm text-muted-foreground mt-1">{item.role}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Admin Notice */}
      <motion.div variants={itemVariants}>
        <Card className="border-muted/50 bg-muted/30 backdrop-blur-xl">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              📊 Como administrador, accedes a estadísticas agregadas institucionales.
              Para proteger la privacidad, no tienes acceso a fichas individuales de estudiantes.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
