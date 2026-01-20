import { motion } from "framer-motion";
import { 
  Users, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  ArrowRight,
  Shield,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { WellbeingScale } from "@/components/ui/WellbeingScale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

// Sample data - will be replaced with real data
const recentAlerts = [
  { id: 1, student: "Estudiante A", studentId: "1", type: "sustained-low" as const, course: "8°A", date: "Hace 2h" },
  { id: 2, student: "Estudiante B", studentId: "2", type: "discrepancy" as const, course: "7°B", date: "Hace 5h" },
  { id: 3, student: "Estudiante C", studentId: "3", type: "low-wellbeing" as const, course: "6°A", date: "Hoy" },
];

const discrepancyCases = [
  { id: 1, student: "Estudiante D", studentId: "4", studentLevel: 4, teacherLevel: "bajo", course: "8°A" },
  { id: 2, student: "Estudiante E", studentId: "5", studentLevel: 2, teacherLevel: "alto", course: "7°B" },
];

const fileStatusCounts = {
  abierta: 820,
  restringida: 18,
  confidencial: 9,
};

export function DuplaDashboard() {
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
          title="Total Estudiantes"
          value="847"
          subtitle="En seguimiento"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Alertas Activas"
          value="7"
          subtitle="Requieren atención"
          icon={AlertTriangle}
          variant="alert"
        />
        <StatCard
          title="Fichas Restringidas"
          value={String(fileStatusCounts.restringida + fileStatusCounts.confidencial)}
          subtitle="Con acceso limitado"
          icon={Shield}
          variant="secondary"
        />
        <StatCard
          title="Bienestar Promedio"
          value="3.8"
          subtitle="Institucional"
          icon={TrendingUp}
          trend={{ value: 2, isPositive: true }}
          variant="default"
        />
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <motion.div variants={itemVariants}>
          <Card className="card-elevated h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-alert" />
                Alertas Activas
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/alerts")}>
                Ver todas <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/students/${alert.studentId}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{alert.student}</p>
                        <span className="text-xs text-muted-foreground">{alert.course}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{alert.date}</span>
                    </div>
                    <AlertBadge type={alert.type} />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Discrepancy Cases */}
        <motion.div variants={itemVariants}>
          <Card className="card-elevated h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Eye className="w-5 h-5 text-warning" />
                Casos de Discrepancia
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/reports")}>
                Ver reportes <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {discrepancyCases.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg border border-warning/30 bg-warning/5 cursor-pointer hover:border-warning/50"
                    onClick={() => navigate(`/students/${item.studentId}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{item.student}</p>
                      <span className="text-xs text-muted-foreground">{item.course}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Estudiante:</span>
                        <WellbeingScale value={item.studentLevel} readonly size="sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Docente:</span>
                        <Badge 
                          variant="outline"
                          className={cn(
                            item.teacherLevel === "bajo" && "border-alert text-alert",
                            item.teacherLevel === "alto" && "border-success text-success"
                          )}
                        >
                          {item.teacherLevel}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* File Status Overview */}
      <motion.div variants={itemVariants}>
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Estado de Fichas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-success">Abiertas</span>
                  <Badge variant="outline" className="border-success text-success">
                    {fileStatusCounts.abierta}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Acceso normal para docentes de curso
                </p>
              </div>
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-warning">Restringidas</span>
                  <Badge variant="outline" className="border-warning text-warning">
                    {fileStatusCounts.restringida}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Requieren autorización para acceso docente
                </p>
              </div>
              <div className="p-4 rounded-xl bg-alert/10 border border-alert/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-alert">Confidenciales</span>
                  <Badge variant="outline" className="border-alert text-alert">
                    {fileStatusCounts.confidencial}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Solo acceso dupla psicosocial
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Access */}
      <motion.div variants={itemVariants}>
        <Card className="card-elevated bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-semibold text-lg">Acceso Completo</h3>
                <p className="text-sm text-muted-foreground">
                  Como parte del equipo psicosocial, tienes acceso a fichas completas y gestión de alertas
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate("/students")}>
                  Ver estudiantes
                </Button>
                <Button 
                  className="bg-gradient-hero hover:opacity-90"
                  onClick={() => navigate("/alerts")}
                >
                  Gestionar alertas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
