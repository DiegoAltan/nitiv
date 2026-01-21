import { motion } from "framer-motion";
import { Users, TrendingUp, AlertTriangle, ClipboardCheck, ArrowRight } from "lucide-react";
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
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const getWellbeingStyles = (level: number) => {
  if (level >= 4) return { text: "text-success", bg: "bg-success/10", label: "Bueno" };
  if (level >= 3) return { text: "text-warning", bg: "bg-warning/10", label: "Regular" };
  return { text: "text-alert", bg: "bg-alert/10", label: "Bajo" };
};

export function TeacherDashboard() {
  const navigate = useNavigate();
  const { stats, loading } = useTeacherData();

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
          title="Mis Estudiantes"
          value={loading ? "..." : stats.totalStudents.toString()}
          subtitle={`En ${stats.courses.length} cursos`}
          icon={Users}
          variant="primary"
          compact
        />
        <StatCard
          title="Evaluaciones Hoy"
          value={loading ? "..." : stats.evaluationsToday.toString()}
          subtitle={`De ${stats.totalStudents} estudiantes`}
          icon={ClipboardCheck}
          variant="secondary"
          compact
        />
        <StatCard
          title="Bienestar Promedio"
          value={loading ? "..." : stats.avgWellbeing.toFixed(1)}
          subtitle="Mis cursos"
          icon={TrendingUp}
          trend={stats.avgWellbeing >= 3 ? { value: 3, isPositive: true } : undefined}
          compact
        />
        <StatCard
          title="Requieren Atención"
          value={loading ? "..." : stats.needsAttention.toString()}
          subtitle="Semáforo bajo"
          icon={AlertTriangle}
          variant="alert"
          compact
        />
      </motion.div>

      {/* Course Overview - Compact */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Resumen por Curso
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate("/students")}>
                Ver estudiantes <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {loading ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Cargando cursos...
              </div>
            ) : stats.courses.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No tienes cursos asignados</p>
                <p className="text-xs mt-1">Contacta al administrador</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {stats.courses.map((course, index) => {
                  const wellbeingStyle = getWellbeingStyles(course.avgWellbeing);
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 rounded-lg bg-muted/30 border border-border/40 hover:border-primary/30 transition-all cursor-pointer hover:shadow-sm"
                      onClick={() => navigate("/students")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">{course.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {course.students} est.
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            wellbeingStyle.bg,
                            wellbeingStyle.text
                          )}
                        >
                          {wellbeingStyle.label} ({course.avgWellbeing.toFixed(1)})
                        </span>
                        {course.needsAttention > 0 && (
                          <span className="flex items-center gap-1 text-xs text-alert">
                            <AlertTriangle className="w-3 h-3" />
                            {course.needsAttention}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions - Compact */}
      <motion.div variants={itemVariants}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-hero flex items-center justify-center shadow-md">
                  <ClipboardCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Evaluación Docente</h3>
                  <p className="text-xs text-muted-foreground">
                    Registra tu percepción del bienestar
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/teacher-assessment")}
                className="bg-gradient-hero hover:opacity-90 shadow-sm h-8 text-xs"
                size="sm"
              >
                Realizar evaluación
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy Notice - Compact */}
      <motion.div variants={itemVariants}>
        <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
          <p className="text-xs text-muted-foreground text-center">
            🔒 Puedes ver indicadores generales. Para información sensible, contacta al equipo psicosocial.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
