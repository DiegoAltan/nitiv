import { motion } from "framer-motion";
import { Map, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EmotionData {
  emotion: string;
  count: number;
  percentage: number;
}

interface EmotionMapProps {
  emotions: EmotionData[];
  totalRecords: number;
  loading?: boolean;
}

const emotionColors: Record<string, string> = {
  Alegría: "bg-yellow-400/80",
  Calma: "bg-sky-400/80",
  Gratitud: "bg-emerald-400/80",
  Esperanza: "bg-violet-400/80",
  Amor: "bg-pink-400/80",
  Tristeza: "bg-blue-400/80",
  Ansiedad: "bg-orange-400/80",
  Frustración: "bg-red-400/80",
  Miedo: "bg-purple-400/80",
  Enojo: "bg-rose-500/80",
  Confusión: "bg-amber-400/80",
  Soledad: "bg-indigo-400/80",
};

const getEmotionColor = (emotion: string) => {
  return emotionColors[emotion] || "bg-gray-400/80";
};

export function EmotionMap({ emotions, totalRecords, loading }: EmotionMapProps) {
  if (loading) {
    return (
      <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            Mi Mapa de Emociones
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

  if (emotions.length === 0) {
    return (
      <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            Mi Mapa de Emociones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Map className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Tu mapa emocional se irá construyendo con cada registro.</p>
            <p className="text-sm mt-2">Todas las emociones son válidas y parte de ti.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by count descending
  const sortedEmotions = [...emotions].sort((a, b) => b.count - a.count);
  const maxCount = sortedEmotions[0]?.count || 1;

  return (
    <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            Mi Mapa de Emociones
            <span className="text-sm font-normal text-muted-foreground">
              (Privado)
            </span>
          </CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Este mapa muestra las emociones que has registrado. El tamaño de cada círculo refleja la frecuencia. Todas las emociones son válidas.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        {/* Visual emotion bubbles */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {sortedEmotions.slice(0, 8).map((emotion, index) => {
            const size = Math.max(40, (emotion.count / maxCount) * 80 + 40);
            return (
              <Tooltip key={emotion.emotion}>
                <TooltipTrigger>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1, type: "spring" }}
                    className={`rounded-full flex items-center justify-center ${getEmotionColor(emotion.emotion)} shadow-lg cursor-pointer hover:scale-110 transition-transform`}
                    style={{ width: size, height: size }}
                  >
                    <span className="text-white text-xs font-medium text-center px-1 drop-shadow">
                      {emotion.emotion.slice(0, 6)}
                    </span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{emotion.emotion}</p>
                  <p className="text-sm text-muted-foreground">
                    Registrada {emotion.count} {emotion.count === 1 ? "vez" : "veces"} ({emotion.percentage}%)
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Bar chart representation */}
        <div className="space-y-3 mt-6">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Basado en {totalRecords} {totalRecords === 1 ? "registro" : "registros"}
          </p>
          {sortedEmotions.slice(0, 6).map((emotion, index) => (
            <motion.div
              key={emotion.emotion}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="text-sm w-24 truncate text-muted-foreground">
                {emotion.emotion}
              </span>
              <div className="flex-1 h-6 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${emotion.percentage}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  className={`h-full ${getEmotionColor(emotion.emotion)} rounded-full`}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground w-12 text-right">
                {emotion.percentage}%
              </span>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6 italic">
          Cada emoción que registras es válida y forma parte de tu proceso de autoconocimiento.
        </p>
      </CardContent>
    </Card>
  );
}
