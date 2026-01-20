import { motion } from "framer-motion";
import { Users, TrendingUp, AlertTriangle, ClipboardCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
const courseOverview = [
  { id: 1, name: "8°A", students: 32, avgWellbeing: 3.8, needsAttention: 2 },
  { id: 2, name: "8°B", students: 30, avgWellbeing: 4.1, needsAttention: 1 },
  { id: 3, name: "7°A", students: 28, avgWellbeing: 3.5, needsAttention: 3 },
];

const getWellbeingColor = (level: number) => {
  if (level >= 4) return "text-success bg-success/10";
  if (level >= 3) return "text-warning bg-warning/10";
  return "text-alert bg-alert/10";
};

const getWellbeingLabel = (level: number) => {
  if (level >= 4) return "Bueno";
  if (level >= 3) return "Regular";
  return "Bajo";
};

export function TeacherDashboard() {
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
          title="Mis Estudiantes"
          value="90"
          subtitle="En 3 cursos"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Evaluaciones Hoy"
          value="12"
          subtitle="De 90 estudiantes"
          icon={ClipboardCheck}
          variant="secondary"
        />
        <StatCard
          title="Bienestar Promedio"
          value="3.8"
          subtitle="Mis cursos"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
          variant="default"
        />
        <StatCard
          title="Requieren Atención"
          value="6"
          subtitle="Semáforo bajo"
          icon={AlertTriangle}
          variant="alert"
        />
      </motion.div>

      {/* Course Overview */}
      <motion.div variants={itemVariants}>
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display">Resumen por Curso</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/students")}>
              Ver estudiantes <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {courseOverview.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => navigate("/students")}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold text-lg">{course.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      {course.students} estudiantes
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Bienestar:</span>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          getWellbeingColor(course.avgWellbeing)
                        )}
                      >
                        {getWellbeingLabel(course.avgWellbeing)} ({course.avgWellbeing.toFixed(1)})
                      </span>
                    </div>
                    {course.needsAttention > 0 && (
                      <span className="flex items-center gap-1 text-xs text-alert">
                        <AlertTriangle className="w-3 h-3" />
                        {course.needsAttention}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="card-elevated bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">Evaluación Docente</h3>
                  <p className="text-sm text-muted-foreground">
                    Registra tu percepción del bienestar de tus estudiantes
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/teacher-assessment")}
                className="bg-gradient-hero hover:opacity-90"
              >
                Realizar evaluación
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy Notice */}
      <motion.div variants={itemVariants}>
        <Card className="card-elevated border-muted">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              🔒 Como docente, puedes ver indicadores generales de bienestar de tus estudiantes.
              Para información sensible o fichas completas, contacta al equipo psicosocial.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
