import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "secondary" | "accent" | "alert";
  className?: string;
  compact?: boolean;
}

const variantStyles = {
  default: "bg-card border-border/60",
  primary: "bg-primary/5 border-primary/15",
  secondary: "bg-secondary border-secondary/30",
  accent: "bg-accent border-accent/30",
  alert: "bg-alert-light border-alert/20",
};

const iconVariants = {
  default: "bg-muted/60 text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  secondary: "bg-success/10 text-success",
  accent: "bg-accent text-accent-foreground",
  alert: "bg-alert/10 text-alert",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
  compact = false,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      className={cn(
        "rounded-xl border transition-all duration-200",
        compact ? "p-3" : "p-4",
        variantStyles[variant],
        "shadow-sm hover:shadow-card",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium text-muted-foreground truncate",
            compact ? "text-xs" : "text-sm"
          )}>
            {title}
          </p>
          <p className={cn(
            "font-bold font-display tracking-tight mt-0.5",
            compact ? "text-xl" : "text-2xl"
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              "text-muted-foreground mt-0.5 truncate",
              compact ? "text-xs" : "text-xs"
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 mt-1",
                compact ? "text-xs" : "text-xs",
                trend.isPositive ? "text-success" : "text-alert"
              )}
            >
              <span className="font-medium">{trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs. anterior</span>
            </div>
          )}
        </div>
        <div className={cn(
          "rounded-lg flex-shrink-0",
          compact ? "p-1.5" : "p-2",
          iconVariants[variant]
        )}>
          <Icon className={compact ? "w-4 h-4" : "w-5 h-5"} />
        </div>
      </div>
    </motion.div>
  );
}
