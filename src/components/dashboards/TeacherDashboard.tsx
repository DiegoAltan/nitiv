import { motion } from "framer-motion";
import { Users, TrendingUp, AlertTriangle, ClipboardCheck, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTeacherData } from "@/hooks/useTeacherData";
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
  const { stats, loading } = useTeacherData();

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
          value={loading ? "..." : stats.totalStudents.toString()}
          subtitle={`En ${stats.courses.length} cursos`}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Evaluaciones Hoy"
          value={loading ? "..." : stats.evaluationsToday.toString()}
          subtitle={`De ${stats.totalStudents} estudiantes`}
          icon={ClipboardCheck}
          variant="secondary"
        />
        <StatCard
          title="Bienestar Promedio"
          value={loading ? "..." : stats.avgWellbeing.toString()}
          subtitle="Mis cursos"
          icon={TrendingUp}
          trend={stats.avgWellbeing >= 3 ? { value: 3, isPositive: true } : undefined}
          variant="default"
        />
        <StatCard
          title="Requieren Atención"
          value={loading ? "..." : stats.needsAttention.toString()}
          subtitle="Semáforo bajo"
          icon={AlertTriangle}
          variant="alert"
        />
      </motion.div>

      {/* Course Overview */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              Resumen por Curso
              <Sparkles className="w-4 h-4 text-warning" />
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/students")}>
              Ver estudiantes <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando cursos...
              </div>
            ) : stats.courses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tienes cursos asignados aún.</p>
                <p className="text-sm mt-2">Contacta al administrador para asignarte cursos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.courses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-muted/30 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all cursor-pointer hover:shadow-md"
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
                            "px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
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
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center shadow-lg">
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
                className="bg-gradient-hero hover:opacity-90 shadow-lg rounded-xl"
              >
                Realizar evaluación
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy Notice */}
      <motion.div variants={itemVariants}>
        <Card className="border-muted/50 bg-muted/30 backdrop-blur-xl">
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
