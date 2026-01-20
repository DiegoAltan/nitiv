import { motion } from "framer-motion";
import { Calendar, Heart, Sun, Cloud, CloudRain, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TimelineEntry {
  id: string;
  date: string;
  wellbeing_level: number;
  emotions: string[];
  description: string;
}

interface NarrativeTimelineProps {
  entries: TimelineEntry[];
  loading?: boolean;
}

const getWellbeingIcon = (level: number) => {
  if (level >= 4) return Sun;
  if (level >= 3) return Cloud;
  return CloudRain;
};

const getWellbeingDescription = (level: number, emotions: string[]) => {
  const emotionText = emotions.length > 0 ? emotions.slice(0, 2).join(" y ") : "";
  
  if (level >= 4) {
    return emotionText 
      ? `Un día donde experimentaste ${emotionText.toLowerCase()}.` 
      : "Un día de bienestar positivo.";
  }
  if (level >= 3) {
    return emotionText 
      ? `Registraste sentirte ${emotionText.toLowerCase()}.` 
      : "Un día equilibrado.";
  }
  return emotionText 
    ? `Experimentaste ${emotionText.toLowerCase()}.` 
    : "Tomaste un momento para registrar cómo te sentías.";
};

export function NarrativeTimeline({ entries, loading }: NarrativeTimelineProps) {
  if (loading) {
    return (
      <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Mi Línea de Tiempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Mi Línea de Tiempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Tu historia de bienestar comenzará con tu primer registro.</p>
            <p className="text-sm mt-2">Cada momento que compartes se convierte en parte de tu proceso.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Mi Línea de Tiempo
          <span className="text-sm font-normal text-muted-foreground ml-2">
            (Solo visible para ti)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/50 via-secondary/50 to-accent/50" />

          <div className="space-y-6">
            {entries.map((entry, index) => {
              const Icon = getWellbeingIcon(entry.wellbeing_level);
              const description = getWellbeingDescription(entry.wellbeing_level, entry.emotions);

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex gap-4 pl-2"
                >
                  {/* Timeline dot */}
                  <div className="relative z-10 w-8 h-8 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center shadow-sm">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="p-4 rounded-xl bg-muted/30 backdrop-blur-sm border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {format(new Date(entry.date), "EEEE d 'de' MMMM", { locale: es })}
                        </span>
                        {index === 0 && (
                          <span className="flex items-center gap-1 text-xs text-primary">
                            <Sparkles className="w-3 h-3" />
                            Más reciente
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">{description}</p>
                      {entry.emotions.length > 0 && (
                        <div className="flex gap-1.5 mt-3 flex-wrap">
                          {entry.emotions.map((emotion) => (
                            <span
                              key={emotion}
                              className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                            >
                              {emotion}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
