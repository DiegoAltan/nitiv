import { motion } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  ClipboardCheck,
  ArrowRight,
  Heart
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/StatCard";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WellbeingScale } from "@/components/ui/WellbeingScale";

// Sample data
const recentAlerts = [
  { id: 1, student: "Estudiante A", type: "sustained-low" as const, course: "8°A" },
  { id: 2, student: "Estudiante B", type: "discrepancy" as const, course: "7°B" },
  { id: 3, student: "Estudiante C", type: "low-wellbeing" as const, course: "6°A" },
];

const recentRecords = [
  { id: 1, student: "Estudiante D", course: "8°A", level: 4, time: "Hace 5 min" },
  { id: 2, student: "Estudiante E", course: "7°B", level: 3, time: "Hace 10 min" },
  { id: 3, student: "Estudiante F", course: "6°A", level: 5, time: "Hace 15 min" },
  { id: 4, student: "Estudiante G", course: "8°B", level: 2, time: "Hace 20 min" },
];

const Dashboard = () => {
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

  return (
    <AppLayout title="Dashboard" subtitle="Resumen del bienestar escolar">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Estudiantes"
            value="847"
            subtitle="Activos este mes"
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Registros Hoy"
            value="234"
            subtitle="28% del total"
            icon={ClipboardCheck}
            trend={{ value: 12, isPositive: true }}
            variant="secondary"
          />
          <StatCard
            title="Bienestar Promedio"
            value="3.8"
            subtitle="Escala 1-5"
            icon={Heart}
            trend={{ value: 5, isPositive: true }}
            variant="default"
          />
          <StatCard
            title="Alertas Activas"
            value="7"
            subtitle="Requieren atención"
            icon={AlertTriangle}
            variant="alert"
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Records */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="card-elevated h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display">Registros Recientes</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">
                  Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRecords.map((record, index) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {record.student.charAt(record.student.length - 1)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{record.student}</p>
                          <p className="text-sm text-muted-foreground">{record.course}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <WellbeingScale value={record.level} readonly size="sm" />
                        <span className="text-xs text-muted-foreground">{record.time}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Alerts */}
          <motion.div variants={itemVariants}>
            <Card className="card-elevated h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-alert" />
                  Alertas
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">
                  Ver todas
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium">{alert.student}</p>
                        <span className="text-xs text-muted-foreground">{alert.course}</span>
                      </div>
                      <AlertBadge type={alert.type} />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="card-elevated bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg">Hora de Orientación</h3>
                    <p className="text-sm text-muted-foreground">
                      Recuerda invitar a tus estudiantes a completar su registro semanal
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">Ver guía</Button>
                  <Button className="bg-gradient-hero hover:opacity-90">
                    Iniciar sesión grupal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default Dashboard;
