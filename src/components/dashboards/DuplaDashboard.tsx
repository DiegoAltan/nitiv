import { motion } from "framer-motion";
import { 
  Users, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  ArrowRight,
  Shield,
  Eye,
  Search,
  FolderOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { StudentFileCard } from "@/components/students/StudentFileCard";
import { useStudentData } from "@/hooks/useStudentData";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export function DuplaDashboard() {
  const navigate = useNavigate();
  const { students, alerts, fileStatusCounts, stats, loading, refetch } = useStudentData();
  const [searchQuery, setSearchQuery] = useState("");

  const activeAlerts = alerts.filter((a) => a.status !== "resuelta").slice(0, 5);
  
  // Find discrepancy cases from alerts
  const discrepancyCases = alerts
    .filter((a) => a.alert_type === "discrepancia" && a.status !== "resuelta")
    .slice(0, 4);

  // Filter students with restricted/confidential status
  const restrictedStudents = students
    .filter((s) => s.fileStatus === "restringida" || s.fileStatus === "confidencial")
    .filter((s) => s.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 6);

  const getAlertType = (type: string): "low-wellbeing" | "sustained-low" | "discrepancy" => {
    switch (type) {
      case "bienestar_bajo": return "low-wellbeing";
      case "sostenido_bajo": return "sustained-low";
      case "discrepancia": return "discrepancy";
      default: return "low-wellbeing";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

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
          value={String(stats.totalStudents)}
          subtitle="En seguimiento"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Alertas Activas"
          value={String(stats.activeAlerts)}
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
          value={String(stats.averageWellbeing || "N/A")}
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
          <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-lg h-full">
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
              {activeAlerts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay alertas activas
                </p>
              ) : (
                <div className="space-y-3">
                  {activeAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 rounded-xl bg-muted/30 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all cursor-pointer"
                      onClick={() => navigate(`/students/${alert.student_id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{alert.student_name}</p>
                          <span className="text-xs text-muted-foreground">{alert.course}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <AlertBadge type={getAlertType(alert.alert_type)} />
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Discrepancy Cases */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-lg h-full">
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
              {discrepancyCases.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay discrepancias activas
                </p>
              ) : (
                <div className="space-y-3">
                  {discrepancyCases.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 rounded-xl bg-warning/10 backdrop-blur-sm border border-warning/30 cursor-pointer hover:border-warning/50 transition-all"
                      onClick={() => navigate(`/students/${item.student_id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{item.student_name}</p>
                        <span className="text-xs text-muted-foreground">{item.course}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* File Status Overview */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Estado de Fichas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-success/10 backdrop-blur-sm border border-success/20">
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
              <div className="p-4 rounded-xl bg-warning/10 backdrop-blur-sm border border-warning/20">
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
              <div className="p-4 rounded-xl bg-alert/10 backdrop-blur-sm border border-alert/20">
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

      {/* Restricted/Confidential Students Management */}
      {(fileStatusCounts.restringida + fileStatusCounts.confidencial) > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Shield className="w-5 h-5 text-warning" />
                Fichas con Acceso Limitado
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar estudiante..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restrictedStudents.map((student, index) => (
                  <StudentFileCard
                    key={student.id}
                    student={student}
                    onStatusChanged={refetch}
                    index={index}
                  />
                ))}
              </div>
              {restrictedStudents.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No se encontraron estudiantes
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Student Case Files Section */}
      <motion.div variants={itemVariants}>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              Fichas de Estudiantes
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/students")}>
              Ver todos <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Accede a las fichas de seguimiento de cada estudiante. Puedes agregar registros de conducta, atenciones, citas y más.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {students.slice(0, 6).map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 cursor-pointer transition-all"
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center text-white text-sm font-bold">
                      {student.full_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{student.course || "Sin curso"}</p>
                    </div>
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
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
