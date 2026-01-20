import { motion } from "framer-motion";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  BarChart3,
  GraduationCap,
  ArrowRight,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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

// Sample aggregated data
const wellbeingByLevel = [
  { level: "7° Básico", average: 3.9, students: 180 },
  { level: "8° Básico", average: 3.7, students: 175 },
  { level: "1° Medio", average: 3.5, students: 165 },
  { level: "2° Medio", average: 3.8, students: 160 },
  { level: "3° Medio", average: 3.6, students: 95 },
  { level: "4° Medio", average: 4.0, students: 72 },
];

const participationData = [
  { name: "Registrado hoy", value: 234, color: "hsl(var(--primary))" },
  { name: "Sin registro hoy", value: 613, color: "hsl(var(--muted))" },
];

const usersByRole = [
  { role: "Estudiantes", count: 847 },
  { role: "Docentes", count: 42 },
  { role: "Dupla Psicosocial", count: 5 },
  { role: "Administradores", count: 3 },
];

export function AdminDashboard() {
  const navigate = useNavigate();

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
          value="897"
          subtitle="En la plataforma"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Estudiantes Activos"
          value="847"
          subtitle="Este mes"
          icon={GraduationCap}
          variant="secondary"
        />
        <StatCard
          title="Bienestar Institucional"
          value="3.7"
          subtitle="Promedio general"
          icon={TrendingUp}
          trend={{ value: 2, isPositive: true }}
          variant="default"
        />
        <StatCard
          title="Participación Hoy"
          value="28%"
          subtitle="234 de 847 estudiantes"
          icon={BarChart3}
          variant="default"
        />
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wellbeing by Level */}
        <motion.div variants={itemVariants}>
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display">Bienestar por Nivel</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/reports")}>
                Ver reportes <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={wellbeingByLevel}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value.toFixed(1), "Bienestar promedio"]}
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
        </motion.div>

        {/* Participation Chart */}
        <motion.div variants={itemVariants}>
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg font-display">Participación del Día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={participationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {participationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
                <div className="space-y-3">
                  {participationData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">
                        {item.name}: <strong>{item.value}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Users by Role */}
      <motion.div variants={itemVariants}>
        <Card className="card-elevated">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {usersByRole.map((item, index) => (
                <motion.div
                  key={item.role}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-muted/50 text-center"
                >
                  <p className="text-2xl font-display font-bold text-primary">
                    {item.count}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{item.role}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Admin Notice */}
      <motion.div variants={itemVariants}>
        <Card className="card-elevated border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              🔐 Como administrador, tienes acceso a estadísticas agregadas e institucionales.
              Las fichas individuales de estudiantes son gestionadas exclusivamente por el equipo psicosocial.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
