import { cn } from "@/lib/utils";
import { useStudentProgress } from "@/hooks/useStudentProgress";

interface LevelBadgeProps {
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

export function LevelBadge({ size = "md", showName = true, className }: LevelBadgeProps) {
  const { getCurrentLevel, loading } = useStudentProgress();
  
  if (loading) return null;
  
  const level = getCurrentLevel();
  
  const sizeClasses = {
    sm: "w-8 h-8 text-lg",
    md: "w-12 h-12 text-2xl",
    lg: "w-16 h-16 text-3xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-xl bg-gradient-hero flex items-center justify-center shadow-lg",
          sizeClasses[size]
        )}
      >
        {level.icon}
      </div>
      {showName && (
        <div>
          <p className="font-medium text-sm">{level.name}</p>
          <p className="text-xs text-muted-foreground">Nivel {level.level}</p>
        </div>
      )}
    </div>
  );
}
