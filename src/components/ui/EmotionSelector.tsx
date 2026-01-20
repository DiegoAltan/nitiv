import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type Emotion = "joy" | "calm" | "anxiety" | "sadness" | "anger" | "tiredness";

interface EmotionSelectorProps {
  selected: Emotion[];
  onChange?: (emotions: Emotion[]) => void;
  readonly?: boolean;
  maxSelection?: number;
}

const emotions: { id: Emotion; label: string; emoji: string }[] = [
  { id: "joy", label: "Alegría", emoji: "😄" },
  { id: "calm", label: "Calma", emoji: "😌" },
  { id: "anxiety", label: "Ansiedad", emoji: "😰" },
  { id: "sadness", label: "Tristeza", emoji: "😢" },
  { id: "anger", label: "Enojo", emoji: "😠" },
  { id: "tiredness", label: "Cansancio", emoji: "😴" },
];

const emotionColors: Record<Emotion, string> = {
  joy: "bg-emotion-joy/20 border-emotion-joy text-emotion-joy hover:bg-emotion-joy/30",
  calm: "bg-emotion-calm/20 border-emotion-calm text-emotion-calm hover:bg-emotion-calm/30",
  anxiety: "bg-emotion-anxiety/20 border-emotion-anxiety text-emotion-anxiety hover:bg-emotion-anxiety/30",
  sadness: "bg-emotion-sadness/20 border-emotion-sadness text-emotion-sadness hover:bg-emotion-sadness/30",
  anger: "bg-emotion-anger/20 border-emotion-anger text-emotion-anger hover:bg-emotion-anger/30",
  tiredness: "bg-emotion-tiredness/20 border-emotion-tiredness text-emotion-tiredness hover:bg-emotion-tiredness/30",
};

const emotionColorsSelected: Record<Emotion, string> = {
  joy: "bg-emotion-joy text-white border-emotion-joy",
  calm: "bg-emotion-calm text-white border-emotion-calm",
  anxiety: "bg-emotion-anxiety text-white border-emotion-anxiety",
  sadness: "bg-emotion-sadness text-white border-emotion-sadness",
  anger: "bg-emotion-anger text-white border-emotion-anger",
  tiredness: "bg-emotion-tiredness text-white border-emotion-tiredness",
};

export function EmotionSelector({
  selected,
  onChange,
  readonly = false,
  maxSelection = 3,
}: EmotionSelectorProps) {
  const handleToggle = (emotion: Emotion) => {
    if (readonly || !onChange) return;

    if (selected.includes(emotion)) {
      onChange(selected.filter((e) => e !== emotion));
    } else if (selected.length < maxSelection) {
      onChange([...selected, emotion]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
        {emotions.map((emotion, index) => {
          const isSelected = selected.includes(emotion.id);
          return (
            <motion.button
              key={emotion.id}
              type="button"
              disabled={readonly}
              onClick={() => handleToggle(emotion.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={!readonly ? { scale: 1.02 } : {}}
              whileTap={!readonly ? { scale: 0.98 } : {}}
              className={cn(
                "px-3 py-1.5 rounded-full border-2 font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-1.5 shrink-0 whitespace-nowrap",
                isSelected
                  ? emotionColorsSelected[emotion.id]
                  : emotionColors[emotion.id],
                !readonly && "cursor-pointer",
                readonly && "cursor-default opacity-80"
              )}
            >
              <span className="text-sm">{emotion.emoji}</span>
              <span className="truncate max-w-[60px] sm:max-w-none">{emotion.label}</span>
            </motion.button>
          );
        })}
      </div>
      {!readonly && (
        <p className="text-xs text-muted-foreground">
          Selecciona hasta {maxSelection} emociones
        </p>
      )}
    </div>
  );
}
