import { motion } from "framer-motion";
import { Heart, TrendingUp, Calendar, Smile, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { WellbeingTrendChart } from "@/components/charts/WellbeingTrendChart";
import { WellbeingScale } from "@/components/ui/WellbeingScale";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentWellbeing } from "@/hooks/useStudentWellbeing";
import { ProgressCard } from "@/components/gamification/ProgressCard";
import { PersonalizationCard } from "@/components/gamification/PersonalizationCard";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

export function StudentDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { stats, loading } = useStudentWellbeing();
  
  const firstName = profile?.full_name?.split(" ")[0] || "Estudiante";

  const formatRecordDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split("T")[0]) return "Hoy";
    if (dateStr === yesterday.toISOString().split("T")[0]) return "Ayer";
    return format(date, "d 'de' MMMM", { locale: es });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Message */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-xl">
          <div className="absolute inset-0 bg-white/40 dark:bg-black/20" />
          <CardContent className="relative p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-lg">
                <Smile className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                  ¡Hola, {firstName}!
                  <Sparkles className="w-5 h-5 text-warning" />
                </h2>
                <p className="text-muted-foreground">
                  Recuerda registrar cómo te sientes hoy. Tu bienestar es importante.
                </p>
              </div>
              <Button 
                onClick={() => navigate("/wellbeing")}
                className="bg-gradient-hero hover:opacity-90 shadow-lg rounded-xl"
              >
                Registrar mi bienestar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Personal Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Mi Bienestar Promedio"
          value={loading ? "..." : stats.averageWellbeing.toString()}
          subtitle="Esta semana"
          icon={Heart}
          trend={stats.averageWellbeing >= 3 ? { value: 5, isPositive: true } : undefined}
          variant="primary"
        />
        <StatCard
          title="Días Registrados"
          value={loading ? "..." : stats.daysRegistered.toString()}
          subtitle="Este mes"
          icon={Calendar}
          variant="secondary"
        />
        <StatCard
          title="Racha Actual"
          value={loading ? "..." : stats.currentStreak.toString()}
          subtitle="Días consecutivos"
          icon={TrendingUp}
          variant="default"
        />
      </motion.div>

      {/* Gamification - Progress Card */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressCard />
        <PersonalizationCard />
      </motion.div>

      {/* Wellbeing Chart */}
      <motion.div variants={itemVariants}>
        <WellbeingTrendChart studentName="mi bienestar" />
      </motion.div>

      {/* Recent Records */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-display">Mis registros recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando registros...
              </div>
            ) : stats.recentRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aún no tienes registros de bienestar.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/wellbeing")}
                >
                  Crear mi primer registro
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentRecords.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 backdrop-blur-sm border border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-muted-foreground w-28">
                        {formatRecordDate(record.recorded_at)}
                      </div>
                      <WellbeingScale value={record.wellbeing_level} readonly size="sm" />
                    </div>
                    <div className="flex gap-2 flex-wrap max-w-[200px]">
                      {record.emotions?.slice(0, 3).map((emotion) => (
                        <span
                          key={emotion}
                          className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary truncate max-w-[80px]"
                        >
                          {emotion}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Supportive Message */}
      <motion.div variants={itemVariants}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              💚 Recuerda que siempre puedes hablar con tu profesor/a o con el equipo
              de apoyo si necesitas ayuda. ¡Estamos aquí para ti!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
