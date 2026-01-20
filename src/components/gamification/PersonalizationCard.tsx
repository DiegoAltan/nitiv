import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, Sparkles, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStudentProgress } from "@/hooks/useStudentProgress";
import { toast } from "sonner";

const COLOR_PREVIEWS: Record<string, string> = {
  default: "from-primary to-secondary",
  ocean: "from-blue-400 to-cyan-300",
  forest: "from-green-500 to-emerald-300",
  sunset: "from-orange-400 to-rose-300",
  lavender: "from-purple-400 to-violet-300",
  coral: "from-red-400 to-pink-300",
};

export function PersonalizationCard() {
  const {
    progress,
    loading,
    THEME_COLORS,
    THEME_ICONS,
    getUnlockedColors,
    getUnlockedIcons,
    updateThemePreference,
  } = useStudentProgress();

  const [selectedColor, setSelectedColor] = useState(progress?.theme_color || "default");
  const [selectedIcon, setSelectedIcon] = useState(progress?.theme_icon || "default");

  if (loading) return null;

  const unlockedColors = getUnlockedColors();
  const unlockedIcons = getUnlockedIcons();

  const handleColorSelect = async (colorId: string) => {
    const isUnlocked = unlockedColors.some((c) => c.id === colorId);
    if (!isUnlocked) {
      const color = THEME_COLORS.find((c) => c.id === colorId);
      toast.info(`Desbloquea este color con ${color?.unlockedAt} registros`);
      return;
    }
    setSelectedColor(colorId);
    await updateThemePreference("color", colorId);
    toast.success("Tema actualizado");
  };

  const handleIconSelect = async (iconId: string) => {
    const isUnlocked = unlockedIcons.some((i) => i.id === iconId);
    if (!isUnlocked) {
      const icon = THEME_ICONS.find((i) => i.id === iconId);
      toast.info(`Desbloquea este ícono con ${icon?.unlockedAt} registros`);
      return;
    }
    setSelectedIcon(iconId);
    await updateThemePreference("icon", iconId);
    toast.success("Ícono actualizado");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Palette className="w-5 h-5 text-secondary" />
            Personalización
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Themes */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Tema de color</p>
            <div className="grid grid-cols-3 gap-2">
              {THEME_COLORS.map((color) => {
                const isUnlocked = unlockedColors.some((c) => c.id === color.id);
                const isSelected = selectedColor === color.id;
                return (
                  <button
                    key={color.id}
                    onClick={() => handleColorSelect(color.id)}
                    className={cn(
                      "relative p-3 rounded-xl border-2 transition-all",
                      isSelected ? "border-primary" : "border-transparent",
                      isUnlocked ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-60"
                    )}
                  >
                    <div
                      className={cn(
                        "h-8 rounded-lg bg-gradient-to-r",
                        COLOR_PREVIEWS[color.id] || "from-gray-400 to-gray-300"
                      )}
                    />
                    <p className="text-xs mt-1 text-center">{color.name}</p>
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Info */}
          <div className="p-3 rounded-xl bg-muted/30 text-center">
            <p className="text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 inline-block mr-1" />
              Desbloquea más opciones con tu constancia
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {progress?.total_records || 0} registros totales
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
