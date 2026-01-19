import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertType = "low-wellbeing" | "discrepancy" | "sustained-low";

interface AlertBadgeProps {
  type: AlertType;
  className?: string;
}

const alertConfig: Record<AlertType, { 
  label: string; 
  icon: typeof AlertTriangle;
  className: string;
}> = {
  "low-wellbeing": {
    label: "Bienestar bajo",
    icon: TrendingDown,
    className: "bg-alert-light text-alert border-alert/30",
  },
  "discrepancy": {
    label: "Discrepancia",
    icon: ArrowLeftRight,
    className: "bg-warning-light text-warning border-warning/30",
  },
  "sustained-low": {
    label: "Sostenido bajo",
    icon: AlertTriangle,
    className: "bg-alert text-alert-foreground border-alert",
  },
};

export function AlertBadge({ type, className }: AlertBadgeProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </motion.div>
  );
}
