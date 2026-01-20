import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScaleSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
  colorVariant?: "anxiety" | "stress" | "default";
}

export function ScaleSlider({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  lowLabel = "Bajo",
  highLabel = "Alto",
  colorVariant = "default",
}: ScaleSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const getColor = () => {
    const normalizedValue = (value - min) / (max - min);
    
    if (colorVariant === "anxiety") {
      if (normalizedValue <= 0.3) return "bg-success";
      if (normalizedValue <= 0.6) return "bg-warning";
      return "bg-[hsl(280,60%,60%)]"; // Purple for anxiety
    }
    
    if (colorVariant === "stress") {
      if (normalizedValue <= 0.3) return "bg-success";
      if (normalizedValue <= 0.6) return "bg-warning";
      return "bg-alert"; // Red for stress
    }
    
    if (normalizedValue <= 0.3) return "bg-success";
    if (normalizedValue <= 0.6) return "bg-warning";
    return "bg-alert";
  };

  const getTrackGradient = () => {
    if (colorVariant === "anxiety") {
      return "from-success via-warning to-[hsl(280,60%,60%)]";
    }
    if (colorVariant === "stress") {
      return "from-success via-warning to-alert";
    }
    return "from-success via-warning to-alert";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <motion.span
          key={value}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={cn(
            "px-3 py-1 rounded-full text-sm font-semibold text-white",
            getColor()
          )}
        >
          {value}
        </motion.span>
      </div>
      
      <div className="relative">
        {/* Track background */}
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full bg-gradient-to-r transition-all", getTrackGradient())}
            style={{ width: `${((value - min) / (max - min)) * 100}%` }}
          />
        </div>
        
        {/* Number markers */}
        <div className="flex justify-between mt-1 px-1">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
            <button
              key={num}
              onClick={() => onChange(num)}
              className={cn(
                "w-6 h-6 text-xs rounded-full transition-all duration-200 flex items-center justify-center",
                value === num
                  ? cn("text-white font-bold", getColor())
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {num}
            </button>
          ))}
        </div>
        
        {/* Labels */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      </div>
    </div>
  );
}
