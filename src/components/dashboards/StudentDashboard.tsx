import { motion } from "framer-motion";
import { Heart, TrendingUp, Calendar, Smile, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { WellbeingTrendChart } from "@/components/charts/WellbeingTrendChart";
import { WellbeingScale } from "@/components/ui/WellbeingScale";
import { WellbeingForm } from "@/components/forms/WellbeingForm";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentWellbeing } from "@/hooks/useStudentWellbeing";
import { useStudentEmotions } from "@/hooks/useStudentEmotions";
import { ProgressCard } from "@/components/gamification/ProgressCard";
import { PersonalizationCard } from "@/components/gamification/PersonalizationCard";
import { NarrativeTimeline } from "@/components/gamification/NarrativeTimeline";
import { EmotionMap } from "@/components/gamification/EmotionMap";
import { MissionsCard } from "@/components/gamification/MissionsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

export function StudentDashboard() {
  const { profile } = useAuth();
  const { stats, loading } = useStudentWellbeing();
  const { timeline, emotionMap, totalRecords, loading: emotionsLoading } = useStudentEmotions();
  
  const firstName = profile?.full_name?.split(" ")[0] || "Estudiante";

  const formatRecordDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split("T")[0]) return "Hoy";
    if (dateStr === yesterday.toISOString().split("T")[0]) return "Ayer";
    return format(date, "d MMM", { locale: es });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Welcome Message - Compact */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md">
                <Smile className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-display font-semibold flex items-center gap-1.5">
                  ¡Hola, {firstName}!
                  <Sparkles className="w-4 h-4 text-warning" />
                </h2>
                <p className="text-xs text-muted-foreground">
                  Tu espacio personal de bienestar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="register" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-9 mb-4">
          <TabsTrigger value="register" className="text-xs">Registrar</TabsTrigger>
          <TabsTrigger value="progress" className="text-xs">Progreso</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">Historia</TabsTrigger>
          <TabsTrigger value="personalize" className="text-xs">Personalizar</TabsTrigger>
        </TabsList>

        {/* Register Tab */}
        <TabsContent value="register" className="space-y-4 mt-0">
          <motion.div variants={itemVariants}>
            <WellbeingForm />
          </motion.div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4 mt-0">
          {/* Personal Stats - Compact */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2">
            <StatCard
              title="Promedio"
              value={loading ? "..." : stats.averageWellbeing.toString()}
              subtitle="Esta semana"
              icon={Heart}
              variant="primary"
              compact
            />
            <StatCard
              title="Días"
              value={loading ? "..." : stats.daysRegistered.toString()}
              subtitle="Este mes"
              icon={Calendar}
              variant="secondary"
              compact
            />
            <StatCard
              title="Racha"
              value={loading ? "..." : stats.currentStreak.toString()}
              subtitle="Días seguidos"
              icon={TrendingUp}
              compact
            />
          </motion.div>

          {/* Gamification Cards - Compact */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <ProgressCard />
            <MissionsCard />
          </motion.div>

          {/* Wellbeing Chart */}
          <motion.div variants={itemVariants}>
            <WellbeingTrendChart studentName="mi bienestar" />
          </motion.div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4 mt-0">
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <NarrativeTimeline entries={timeline} loading={emotionsLoading} />
            <EmotionMap emotions={emotionMap} totalRecords={totalRecords} loading={emotionsLoading} />
          </motion.div>

          {/* Recent Records - Compact */}
          <motion.div variants={itemVariants}>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-semibold">Registros recientes</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Cargando...
                  </div>
                ) : stats.recentRecords.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Aún no tienes registros
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats.recentRecords.slice(0, 5).map((record, index) => (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-muted-foreground w-12">
                            {formatRecordDate(record.recorded_at)}
                          </span>
                          <WellbeingScale value={record.wellbeing_level} readonly size="sm" />
                        </div>
                        <div className="flex gap-1 flex-wrap max-w-[140px] justify-end">
                          {record.emotions?.slice(0, 2).map((emotion) => (
                            <span
                              key={emotion}
                              className="px-1.5 py-0.5 text-[10px] rounded bg-primary/10 text-primary truncate max-w-[60px]"
                            >
                              {emotion}
                            </span>
                          ))}
                          {(record.emotions?.length || 0) > 2 && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground">
                              +{(record.emotions?.length || 0) - 2}
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
        </TabsContent>

        {/* Personalize Tab */}
        <TabsContent value="personalize" className="space-y-4 mt-0">
          <motion.div variants={itemVariants}>
            <PersonalizationCard />
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Supportive Message - Compact */}
      <motion.div variants={itemVariants}>
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
          <p className="text-xs text-muted-foreground text-center">
            💚 Siempre puedes hablar con tu profesor/a o equipo de apoyo. ¡Estamos aquí para ti!
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
