import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WellbeingScaleProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const scaleLabels = [
  { value: 1, label: "Muy bajo", emoji: "😔" },
  { value: 2, label: "Bajo", emoji: "😕" },
  { value: 3, label: "Regular", emoji: "😐" },
  { value: 4, label: "Bien", emoji: "🙂" },
  { value: 5, label: "Muy bien", emoji: "😊" },
];

const sizeClasses = {
  sm: "w-10 h-10 text-lg",
  md: "w-14 h-14 text-2xl",
  lg: "w-18 h-18 text-3xl",
};

export function WellbeingScale({ 
  value, 
  onChange, 
  readonly = false,
  size = "md" 
}: WellbeingScaleProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        {scaleLabels.map((item) => (
          <motion.button
            key={item.value}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(item.value)}
            whileHover={!readonly ? { scale: 1.1 } : {}}
            whileTap={!readonly ? { scale: 0.95 } : {}}
            className={cn(
              "rounded-full flex items-center justify-center transition-all duration-300",
              sizeClasses[size],
              value === item.value
                ? `wellbeing-${item.value} ring-4 ring-offset-2 ring-offset-background`
                : "bg-muted hover:bg-muted/80",
              value === item.value && item.value === 1 && "ring-wellbeing-1",
              value === item.value && item.value === 2 && "ring-wellbeing-2",
              value === item.value && item.value === 3 && "ring-wellbeing-3",
              value === item.value && item.value === 4 && "ring-wellbeing-4",
              value === item.value && item.value === 5 && "ring-wellbeing-5",
              !readonly && "cursor-pointer",
              readonly && "cursor-default"
            )}
          >
            <span className={value === item.value ? "" : "grayscale opacity-50"}>
              {item.emoji}
            </span>
          </motion.button>
        ))}
      </div>
      {value > 0 && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-muted-foreground"
        >
          {scaleLabels.find((s) => s.value === value)?.label}
        </motion.p>
      )}
    </div>
  );
}
