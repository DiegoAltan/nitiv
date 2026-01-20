import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface StudentProgress {
  id: string;
  student_id: string;
  total_records: number;
  current_level: number;
  current_streak_weeks: number;
  longest_streak_weeks: number;
  last_record_week: string | null;
  streak_frozen: boolean;
  theme_color: string;
  theme_icon: string;
  dashboard_style: string;
}

export interface Mission {
  id: string;
  mission_type: string;
  mission_description: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

const LEVELS = [
  { level: 1, name: "Exploración", description: "Comenzando el viaje de autoconocimiento", minRecords: 0, icon: "🌱" },
  { level: 2, name: "Observación", description: "Desarrollando consciencia de tus emociones", minRecords: 10, icon: "👁️" },
  { level: 3, name: "Comprensión", description: "Entendiendo tus patrones emocionales", minRecords: 25, icon: "💡" },
  { level: 4, name: "Autocuidado", description: "Aplicando lo aprendido en tu bienestar", minRecords: 50, icon: "🌿" },
  { level: 5, name: "Conciencia", description: "Maestría en el conocimiento de ti mismo", minRecords: 100, icon: "✨" },
];

const THEME_COLORS = [
  { id: "default", name: "Predeterminado", unlockedAt: 0 },
  { id: "ocean", name: "Océano", unlockedAt: 5 },
  { id: "forest", name: "Bosque", unlockedAt: 10 },
  { id: "sunset", name: "Atardecer", unlockedAt: 15 },
  { id: "lavender", name: "Lavanda", unlockedAt: 25 },
  { id: "coral", name: "Coral", unlockedAt: 35 },
];

const THEME_ICONS = [
  { id: "default", name: "Predeterminado", unlockedAt: 0 },
  { id: "star", name: "Estrella", unlockedAt: 8 },
  { id: "heart", name: "Corazón", unlockedAt: 12 },
  { id: "leaf", name: "Hoja", unlockedAt: 20 },
  { id: "moon", name: "Luna", unlockedAt: 30 },
];

const VALIDATING_MESSAGES = {
  returning: [
    "Qué bueno verte de nuevo. Tu proceso continúa.",
    "Volviste a tomarte este momento. Eso es valioso.",
    "Cada registro es un paso en tu camino.",
  ],
  consistent: [
    "Tu constancia es admirable. Sigue así.",
    "Gracias por tomarte este momento.",
    "Registrar cómo te sientes es un acto de cuidado personal.",
  ],
  streak: [
    "Llevas {weeks} semanas registrando tu bienestar. Impresionante.",
    "Tu compromiso contigo mismo es notable.",
    "La constancia construye consciencia.",
  ],
  general: [
    "Registrar también cuando no te sientes bien es importante.",
    "Gracias por tomarte este momento.",
    "Cada emoción es válida y merece ser reconocida.",
    "Tu bienestar importa.",
  ],
};

export function useStudentProgress() {
  const { profile } = useAuth();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    if (!profile?.id) return;

    try {
      const { data: progressData } = await supabase
        .from("student_progress")
        .select("*")
        .eq("student_id", profile.id)
        .single();

      if (progressData) {
        setProgress(progressData as StudentProgress);
      }

      const { data: missionsData } = await supabase
        .from("student_missions")
        .select("*")
        .eq("student_id", profile.id)
        .order("created_at", { ascending: false });

      if (missionsData) {
        setMissions(missionsData as Mission[]);
      }
    } catch (error) {
      // No progress yet, that's okay
    } finally {
      setLoading(false);
    }
  };

  const updateThemePreference = async (type: "color" | "icon" | "style", value: string) => {
    if (!profile?.id) return;

    const updateField = type === "color" ? "theme_color" : type === "icon" ? "theme_icon" : "dashboard_style";

    const { error } = await supabase
      .from("student_progress")
      .update({ [updateField]: value })
      .eq("student_id", profile.id);

    if (!error) {
      setProgress((prev) => prev ? { ...prev, [updateField]: value } : null);
    }
  };

  const completeMission = async (missionId: string) => {
    const { error } = await supabase
      .from("student_missions")
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq("id", missionId);

    if (!error) {
      setMissions((prev) =>
        prev.map((m) =>
          m.id === missionId ? { ...m, is_completed: true, completed_at: new Date().toISOString() } : m
        )
      );
    }
  };

  const getValidatingMessage = (): string => {
    if (!progress) {
      return VALIDATING_MESSAGES.general[Math.floor(Math.random() * VALIDATING_MESSAGES.general.length)];
    }

    if (progress.streak_frozen) {
      return VALIDATING_MESSAGES.returning[Math.floor(Math.random() * VALIDATING_MESSAGES.returning.length)];
    }

    if (progress.current_streak_weeks >= 3) {
      const msg = VALIDATING_MESSAGES.streak[Math.floor(Math.random() * VALIDATING_MESSAGES.streak.length)];
      return msg.replace("{weeks}", String(progress.current_streak_weeks));
    }

    if (progress.total_records >= 5) {
      return VALIDATING_MESSAGES.consistent[Math.floor(Math.random() * VALIDATING_MESSAGES.consistent.length)];
    }

    return VALIDATING_MESSAGES.general[Math.floor(Math.random() * VALIDATING_MESSAGES.general.length)];
  };

  const getCurrentLevel = () => {
    const level = progress?.current_level || 1;
    return LEVELS.find((l) => l.level === level) || LEVELS[0];
  };

  const getNextLevel = () => {
    const currentLevel = progress?.current_level || 1;
    return LEVELS.find((l) => l.level === currentLevel + 1);
  };

  const getProgressToNextLevel = () => {
    const current = getCurrentLevel();
    const next = getNextLevel();
    if (!next) return 100;

    const currentRecords = progress?.total_records || 0;
    const progressPercent = ((currentRecords - current.minRecords) / (next.minRecords - current.minRecords)) * 100;
    return Math.min(Math.max(progressPercent, 0), 100);
  };

  const getUnlockedColors = () => {
    const records = progress?.total_records || 0;
    return THEME_COLORS.filter((c) => c.unlockedAt <= records);
  };

  const getUnlockedIcons = () => {
    const records = progress?.total_records || 0;
    return THEME_ICONS.filter((i) => i.unlockedAt <= records);
  };

  const getWeeklyProgress = () => {
    // Calculate progress for current week (days registered)
    // This would require additional data from wellbeing_records
    return { days: 0, total: 5 }; // Placeholder
  };

  useEffect(() => {
    fetchProgress();
  }, [profile?.id]);

  return {
    progress,
    missions,
    loading,
    LEVELS,
    THEME_COLORS,
    THEME_ICONS,
    fetchProgress,
    updateThemePreference,
    completeMission,
    getValidatingMessage,
    getCurrentLevel,
    getNextLevel,
    getProgressToNextLevel,
    getUnlockedColors,
    getUnlockedIcons,
    getWeeklyProgress,
  };
}
