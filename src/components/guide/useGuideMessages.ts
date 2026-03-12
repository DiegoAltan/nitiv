import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGuide, AvatarCharacter, AvatarEmotion } from "@/contexts/GuideContext";
import { supabase } from "@/integrations/supabase/client";

export interface GuideMessage {
  id: string;
  text: string;
  emotion: AvatarEmotion;
  priority: number;
}

const DISMISSED_KEY = "nitiv_guide_dismissed";

function getDismissed(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) || "[]");
  } catch { return []; }
}

function addDismissed(id: string) {
  const list = getDismissed();
  list.push(id);
  sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(list));
}

function tone(character: AvatarCharacter, formal: string, warm: string) {
  return character === "vigo" ? formal : warm;
}

export function useGuideMessages() {
  const { profile, activeRole, isStudent, isTeacher, isDupla, isInspector, isAdmin } = useAuth();
  const { character, enabled } = useGuide();
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<GuideMessage | null>(null);
  const [loading, setLoading] = useState(true);

  const generateMessages = useCallback(async () => {
    if (!enabled || !profile?.id) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const dismissed = getDismissed();
    const newMessages: GuideMessage[] = [];

    if (isStudent) {
      // Check if student did today's check-in
      const today = new Date().toISOString().split("T")[0];
      const { data: todayRecords } = await supabase
        .from("wellbeing_records")
        .select("id")
        .eq("student_id", profile.id)
        .gte("recorded_at", today)
        .limit(1);

      if (!todayRecords || todayRecords.length === 0) {
        newMessages.push({
          id: "checkin-today",
          text: tone(character,
            "Acción pendiente: Registra tu check-in diario. Tu pulso emocional importa.",
            "¡Hola! 💛 ¿Ya hicimos nuestro check-in hoy? Tu bienestar me importa mucho."),
          emotion: "thinking",
          priority: 10,
        });
      } else {
        // Check if wellbeing was low
        const { data: lastRecord } = await supabase
          .from("wellbeing_records")
          .select("wellbeing_level")
          .eq("student_id", profile.id)
          .order("recorded_at", { ascending: false })
          .limit(1);

        if (lastRecord && lastRecord.length > 0 && lastRecord[0].wellbeing_level <= 2) {
          newMessages.push({
            id: "low-wellbeing-rec",
            text: tone(character,
              "Tu último registro muestra niveles bajos. Considera revisar los recursos de apoyo disponibles.",
              "Vi que no te sentías tan bien últimamente 🤗 Recuerda que está bien no estar bien. ¿Quieres explorar alguna actividad que te ayude?"),
            emotion: "alert",
            priority: 9,
          });
        }
      }

      // Check upcoming activities
      const { data: upcoming } = await supabase
        .from("school_activities")
        .select("title")
        .eq("is_upcoming", true)
        .limit(1);

      if (upcoming && upcoming.length > 0) {
        newMessages.push({
          id: "upcoming-activity",
          text: tone(character,
            `Actividad programada: "${upcoming[0].title}". Revisa los detalles.`,
            `¡Hay algo divertido pronto! 🎉 "${upcoming[0].title}" está por realizarse. ¡No te lo pierdas!`),
          emotion: "happy",
          priority: 5,
        });
      }

      // Streak encouragement
      newMessages.push({
        id: "daily-greeting",
        text: tone(character,
          "Bienvenido. Cada registro suma a tu progreso personal.",
          "¡Qué bueno verte por aquí! 🌟 Cada día que registras cómo te sientes, te conoces un poquito más."),
        emotion: "happy",
        priority: 1,
      });
    }

    if (isTeacher) {
      // Check for pending alerts on their students
      const { data: pendingAlerts, count } = await supabase
        .from("alerts")
        .select("id", { count: "exact" })
        .eq("status", "nueva")
        .limit(1);

      if (count && count > 0) {
        newMessages.push({
          id: "teacher-alerts",
          text: tone(character,
            `Hay ${count} alerta(s) pendiente(s) en tus estudiantes. Revisa el panel.`,
            `Oye, hay ${count} estudiante(s) que podrían necesitar tu atención 💙 Revisa las alertas cuando puedas.`),
          emotion: "alert",
          priority: 10,
        });
      }

      newMessages.push({
        id: "teacher-weekly",
        text: tone(character,
          "Recuerda revisar las evaluaciones semanales de tus cursos.",
          "¡Un buen momento para ver cómo va tu curso esta semana! 📊 Los datos te ayudan a acompañar mejor."),
        emotion: "thinking",
        priority: 3,
      });
    }

    if (isDupla || isInspector) {
      const { data: criticalAlerts, count } = await supabase
        .from("alerts")
        .select("id", { count: "exact" })
        .eq("status", "nueva")
        .limit(1);

      if (count && count > 0) {
        newMessages.push({
          id: "dupla-critical",
          text: tone(character,
            `⚠️ ${count} alerta(s) crítica(s) sin revisar. Requiere atención inmediata.`,
            `Hay ${count} alerta(s) que necesitan tu mirada profesional 🔍 Tu intervención puede hacer la diferencia.`),
          emotion: "alert",
          priority: 10,
        });
      }

      newMessages.push({
        id: "dupla-reports",
        text: tone(character,
          "Es momento de revisar el reporte de impacto semanal.",
          "¿Revisamos juntos cómo van los indicadores esta semana? 📈 Los reportes están listos."),
        emotion: "thinking",
        priority: 4,
      });
    }

    if (isAdmin) {
      newMessages.push({
        id: "admin-overview",
        text: tone(character,
          "Panel ejecutivo actualizado. Revisa los KPIs institucionales.",
          "¡Los datos institucionales están frescos! 🏫 Veamos cómo va todo."),
        emotion: "neutral",
        priority: 5,
      });
    }

    // Filter dismissed
    const filtered = newMessages
      .filter(m => !dismissed.includes(m.id))
      .sort((a, b) => b.priority - a.priority);

    setMessages(filtered);
    setLoading(false);
  }, [enabled, profile?.id, isStudent, isTeacher, isDupla, isInspector, isAdmin, character, activeRole]);

  useEffect(() => {
    generateMessages();
  }, [generateMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      setCurrentMessage(messages[0]);
    } else {
      setCurrentMessage(null);
    }
  }, [messages]);

  const dismiss = useCallback((id: string) => {
    addDismissed(id);
    setMessages(prev => {
      const next = prev.filter(m => m.id !== id);
      return next;
    });
  }, []);

  return { currentMessage, messages, dismiss, loading };
}
