import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Calendar, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useStudentProgress } from "@/hooks/useStudentProgress";

export function ProgressCard() {
  const {
    progress,
    loading,
    getCurrentLevel,
    getNextLevel,
    getProgressToNextLevel,
  } = useStudentProgress();

  if (loading) {
    return (
      <Card className="card-elevated">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressPercent = getProgressToNextLevel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="card-elevated overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
        <CardHeader className="relative">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Tu Progreso Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Level */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center text-3xl shadow-lg">
              {currentLevel.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-lg">{currentLevel.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  Nivel {currentLevel.level}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{currentLevel.description}</p>
            </div>
          </div>

          {/* Progress to Next Level */}
          {nextLevel && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progreso hacia {nextLevel.name}</span>
                <span className="font-medium">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {progress?.total_records || 0} de {nextLevel.minRecords} registros
              </p>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-muted/30">
              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold">{progress?.total_records || 0}</p>
              <p className="text-xs text-muted-foreground">Registros</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/30">
              <Calendar className="w-5 h-5 mx-auto mb-1 text-secondary" />
              <p className="text-xl font-bold">{progress?.current_streak_weeks || 0}</p>
              <p className="text-xs text-muted-foreground">Semanas</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/30">
              <Award className="w-5 h-5 mx-auto mb-1 text-accent" />
              <p className="text-xl font-bold">{progress?.longest_streak_weeks || 0}</p>
              <p className="text-xs text-muted-foreground">Mejor racha</p>
            </div>
          </div>

          {/* Streak Frozen Message */}
          {progress?.streak_frozen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-xl bg-muted/50 border border-border/50"
            >
              <p className="text-sm text-muted-foreground">
                🧊 Tu racha está pausada. Registra tu bienestar para retomarla.
                No te preocupes, no has perdido tu progreso.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
