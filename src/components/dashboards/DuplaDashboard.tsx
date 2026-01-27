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
import { AIAnalysisCard } from "@/components/ai/AIAnalysisCard";
import { useState } from "react";

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

export function DuplaDashboard() {
  const navigate = useNavigate();
  const { students, alerts, fileStatusCounts, stats, loading, refetch } = useStudentData();
  const [searchQuery, setSearchQuery] = useState("");

  const activeAlerts = alerts.filter((a) => a.status !== "resuelta").slice(0, 4);
  
  const discrepancyCases = alerts
    .filter((a) => a.alert_type === "discrepancia" && a.status !== "resuelta")
    .slice(0, 3);

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
      <div className="flex items-center justify-center py-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Stats Grid - Compact */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard
          title="Total Estudiantes"
          value={String(stats.totalStudents)}
          subtitle="En seguimiento"
          icon={Users}
          variant="primary"
          compact
        />
        <StatCard
          title="Alertas Activas"
          value={String(stats.activeAlerts)}
          subtitle="Requieren atención"
          icon={AlertTriangle}
          variant="alert"
          compact
        />
        <StatCard
          title="Fichas Limitadas"
          value={String(fileStatusCounts.restringida + fileStatusCounts.confidencial)}
          subtitle="Acceso restringido"
          icon={Shield}
          variant="secondary"
          compact
        />
        <StatCard
          title="Bienestar"
          value={String(stats.averageWellbeing || "N/A")}
          subtitle="Promedio"
          icon={TrendingUp}
          trend={{ value: 2, isPositive: true }}
          compact
        />
      </motion.div>

      {/* Main Grid - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Active Alerts */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 shadow-sm h-full">
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-alert" />
                  Alertas Activas
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate("/alerts")}>
                  Ver todas <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {activeAlerts.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 text-sm">
                  No hay alertas activas
                </p>
              ) : (
                <div className="space-y-2">
                  {activeAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-2.5 rounded-lg bg-muted/30 border border-border/40 hover:border-primary/30 transition-all cursor-pointer"
                      onClick={() => navigate(`/students/${alert.student_id}`)}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{alert.student_name}</p>
                          <span className="text-xs text-muted-foreground">{alert.course}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
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
          <Card className="border-border/50 shadow-sm h-full">
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-warning" />
                  Casos de Discrepancia
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate("/reports")}>
                  Reportes <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {discrepancyCases.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 text-sm">
                  Sin discrepancias activas
                </p>
              ) : (
                <div className="space-y-2">
                  {discrepancyCases.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-2.5 rounded-lg bg-warning/5 border border-warning/20 cursor-pointer hover:border-warning/40 transition-all"
                      onClick={() => navigate(`/students/${item.student_id}`)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{item.student_name}</p>
                        <span className="text-xs text-muted-foreground">{item.course}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* File Status Overview - Compact */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Estado de Fichas
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-success">Abiertas</span>
                  <Badge variant="outline" className="border-success text-success h-5 text-xs">
                    {fileStatusCounts.abierta}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Acceso normal
                </p>
              </div>
              <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-warning">Restringidas</span>
                  <Badge variant="outline" className="border-warning text-warning h-5 text-xs">
                    {fileStatusCounts.restringida}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Requieren autorización
                </p>
              </div>
              <div className="p-3 rounded-lg bg-alert/5 border border-alert/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-alert">Confidenciales</span>
                  <Badge variant="outline" className="border-alert text-alert h-5 text-xs">
                    {fileStatusCounts.confidencial}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Solo dupla
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Restricted Students - Compact */}
      {(fileStatusCounts.restringida + fileStatusCounts.confidencial) > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-warning" />
                  Fichas con Acceso Limitado
                </CardTitle>
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
                <p className="text-center text-muted-foreground py-6 text-sm">
                  No se encontraron estudiantes
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Student Case Files - Compact */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                Fichas de Estudiantes
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate("/students")}>
                Ver todos <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {students.slice(0, 6).map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-2.5 rounded-lg bg-muted/30 border border-border/40 hover:border-primary/30 cursor-pointer transition-all text-center"
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-hero flex items-center justify-center text-white text-xs font-bold mb-1.5">
                    {student.full_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <p className="font-medium text-xs truncate">{student.full_name.split(" ")[0]}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{student.course || "Sin curso"}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Analysis - Compact */}
      <motion.div variants={itemVariants}>
        <AIAnalysisCard
          title="Análisis Psicosocial IA"
          analysisType="dupla"
          dashboardData={{
            activeAlerts: stats.activeAlerts,
            casesCount: fileStatusCounts.restringida + fileStatusCounts.confidencial,
            riskCount: students.filter(s => (s.lastWellbeing || 0) <= 2).length,
            highDiscrepancyCount: discrepancyCases.length,
            avgWellbeing: stats.averageWellbeing,
            topEmotions: [],
          }}
          compact
        />
      </motion.div>

      {/* Quick Access - Compact */}
      <motion.div variants={itemVariants}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-sm">Acceso Completo</h3>
                <p className="text-xs text-muted-foreground">
                  Tienes acceso a fichas completas y gestión de alertas
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate("/students")}>
                  Estudiantes
                </Button>
                <Button 
                  className="bg-gradient-hero hover:opacity-90 h-8 text-xs"
                  size="sm"
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
