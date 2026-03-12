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
  const { profile, activeRole, isStudent, isTeacher, isDupla, isInspector, isAdmin, isOrientador } = useAuth();
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
    const today = new Date().toISOString().split("T")[0];
    const dayOfWeek = new Date().getDay(); // 0=Sunday, 1=Monday...

    // ═══════════════════════════════════════════
    // STUDENT TRIGGERS
    // ═══════════════════════════════════════════
    if (isStudent) {
      // 1. Check-in pendiente
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
        // 2. Bienestar bajo
        const { data: lastRecord } = await supabase
          .from("wellbeing_records")
          .select("wellbeing_level, emotions")
          .eq("student_id", profile.id)
          .order("recorded_at", { ascending: false })
          .limit(1);

        if (lastRecord && lastRecord.length > 0) {
          const last = lastRecord[0];
          if (last.wellbeing_level <= 2) {
            newMessages.push({
              id: "low-wellbeing-rec",
              text: tone(character,
                "Tu último registro muestra niveles bajos. Considera revisar los recursos de apoyo disponibles.",
                "Vi que no te sentías tan bien últimamente 🤗 Recuerda que está bien no estar bien. ¿Quieres explorar alguna actividad que te ayude?"),
              emotion: "alert",
              priority: 9,
            });
          }

          // 3. Co-regulación: sugerencia si emociones incluyen ansiedad/estrés
          const emotions = last.emotions || [];
          const stressEmotions = ["ansiedad", "estrés", "angustia", "miedo", "nervios"];
          const hasStress = emotions.some((e: string) => stressEmotions.includes(e.toLowerCase()));
          if (hasStress) {
            newMessages.push({
              id: "coregulation-suggestion",
              text: tone(character,
                "Detectamos indicadores de estrés. Técnica recomendada: respiración 4-7-8. Inhala 4s, retén 7s, exhala 8s.",
                "Parece que el estrés te ha acompañado 🌊 ¿Probamos juntos una respiración? Inhala 4 segundos, retén 7, exhala 8. ¡Vamos! 🫁"),
              emotion: "thinking",
              priority: 8,
            });
          }
        }
      }

      // 4. Racha y progreso
      const { data: progressData } = await supabase
        .from("student_progress")
        .select("current_streak_weeks, total_records, current_level")
        .eq("student_id", profile.id)
        .maybeSingle();

      if (progressData) {
        if (progressData.current_streak_weeks && progressData.current_streak_weeks >= 3) {
          newMessages.push({
            id: "streak-celebration",
            text: tone(character,
              `Racha activa: ${progressData.current_streak_weeks} semanas. Mantén la consistencia.`,
              `¡Llevas ${progressData.current_streak_weeks} semanas seguidas registrando! 🔥 ¡Eso es increíble, sigue así!`),
            emotion: "happy",
            priority: 6,
          });
        }
        if (progressData.total_records && progressData.total_records % 10 === 0 && progressData.total_records > 0) {
          newMessages.push({
            id: "milestone-records",
            text: tone(character,
              `Hito alcanzado: ${progressData.total_records} registros totales.`,
              `🎉 ¡Wow, ${progressData.total_records} registros! Cada uno cuenta tu historia. ¡Estoy orgulloso de ti!`),
            emotion: "happy",
            priority: 7,
          });
        }
      }

      // 5. Actividades próximas
      const { data: upcoming } = await supabase
        .from("school_activities")
        .select("title, activity_date")
        .eq("is_upcoming", true)
        .order("activity_date", { ascending: true })
        .limit(2);

      if (upcoming && upcoming.length > 0) {
        const nextActivity = upcoming[0];
        const actDate = new Date(nextActivity.activity_date);
        const daysUntil = Math.ceil((actDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 3 && daysUntil >= 0) {
          newMessages.push({
            id: "upcoming-soon",
            text: tone(character,
              `Actividad "${nextActivity.title}" en ${daysUntil === 0 ? "hoy" : daysUntil + " día(s)"}. Prepárate.`,
              `¡"${nextActivity.title}" es ${daysUntil === 0 ? "hoy" : "en " + daysUntil + " día(s)"}! 🎉 ¡No te lo pierdas!`),
            emotion: "happy",
            priority: 7,
          });
        } else if (upcoming.length > 0) {
          newMessages.push({
            id: "upcoming-activity",
            text: tone(character,
              `Actividad programada: "${nextActivity.title}". Revisa los detalles.`,
              `¡Hay algo divertido pronto! 🎉 "${nextActivity.title}" está por realizarse. ¡No te lo pierdas!`),
            emotion: "happy",
            priority: 4,
          });
        }
      }

      // 6. Misiones pendientes
      const { count: missionCount } = await supabase
        .from("student_missions")
        .select("id", { count: "exact" })
        .eq("student_id", profile.id)
        .eq("is_completed", false)
        .limit(1);

      if (missionCount && missionCount > 0) {
        newMessages.push({
          id: "pending-missions",
          text: tone(character,
            `Tienes ${missionCount} misión(es) de reflexión pendiente(s).`,
            `Tienes ${missionCount} misión(es) esperándote 🗺️ ¡Son pequeños pasos para conocerte mejor!`),
          emotion: "thinking",
          priority: 3,
        });
      }

      // 7. Saludo genérico
      newMessages.push({
        id: "daily-greeting",
        text: tone(character,
          "Bienvenido. Cada registro suma a tu progreso personal.",
          "¡Qué bueno verte por aquí! 🌟 Cada día que registras cómo te sientes, te conoces un poquito más."),
        emotion: "happy",
        priority: 1,
      });
    }

    // ═══════════════════════════════════════════
    // TEACHER TRIGGERS
    // ═══════════════════════════════════════════
    if (isTeacher) {
      const { count: alertCount } = await supabase
        .from("alerts")
        .select("id", { count: "exact", head: true })
        .eq("status", "nueva");

      if (alertCount && alertCount > 0) {
        newMessages.push({
          id: "teacher-alerts",
          text: tone(character,
            `Hay ${alertCount} alerta(s) activa(s). Revisa el panel de alertas.`,
            `Oye, hay ${alertCount} estudiante(s) que podrían necesitar tu atención 💙 Revisa las alertas cuando puedas.`),
          emotion: "alert",
          priority: 10,
        });
      }

      // Evaluaciones recientes
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: evalCount } = await supabase
        .from("teacher_evaluations")
        .select("id", { count: "exact", head: true })
        .eq("teacher_id", profile.id)
        .gte("created_at", weekAgo);

      if (!evalCount || evalCount === 0) {
        newMessages.push({
          id: "teacher-no-evals",
          text: tone(character,
            "No se registran evaluaciones esta semana. Considera realizar una observación de aula.",
            "Esta semana aún no has registrado observaciones 📝 ¿Qué tal si evaluamos cómo van tus estudiantes?"),
          emotion: "thinking",
          priority: 6,
        });
      }

      if (dayOfWeek === 1) { // Monday
        newMessages.push({
          id: "teacher-monday",
          text: tone(character,
            "Inicio de semana. Buen momento para revisar indicadores de tus cursos.",
            "¡Feliz lunes! 🌅 Es un buen día para revisar cómo están tus cursos y planificar la semana."),
          emotion: "neutral",
          priority: 3,
        });
      }

      newMessages.push({
        id: "teacher-weekly",
        text: tone(character,
          "Recuerda revisar las evaluaciones semanales de tus cursos.",
          "¡Un buen momento para ver cómo va tu curso esta semana! 📊 Los datos te ayudan a acompañar mejor."),
        emotion: "thinking",
        priority: 2,
      });
    }

    // ═══════════════════════════════════════════
    // DUPLA / INSPECTOR TRIGGERS
    // ═══════════════════════════════════════════
    if (isDupla || isInspector) {
      // 1. Alertas críticas
      const { count: criticalCount } = await supabase
        .from("alerts")
        .select("id", { count: "exact", head: true })
        .eq("status", "nueva");

      if (criticalCount && criticalCount > 0) {
        newMessages.push({
          id: "dupla-critical",
          text: tone(character,
            `⚠️ ${criticalCount} alerta(s) sin revisar. Requiere atención inmediata.`,
            `Hay ${criticalCount} alerta(s) que necesitan tu mirada profesional 🔍 Tu intervención puede hacer la diferencia.`),
          emotion: "alert",
          priority: 10,
        });
      }

      // 2. Fichas/registros recientes
      const { count: recentRecords } = await supabase
        .from("student_case_records")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { count: totalStudents } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      if (recentRecords !== null && totalStudents !== null) {
        newMessages.push({
          id: "dupla-ficha-stats",
          text: tone(character,
            `Resumen semanal: ${recentRecords} registro(s) de caso en los últimos 7 días. ${totalStudents} perfiles activos.`,
            `Esta semana se han registrado ${recentRecords} intervención(es) 📋 Tienes ${totalStudents} estudiantes en el sistema.`),
          emotion: "thinking",
          priority: 5,
        });
      }

      // 3. Fichas con severidad alta/crítica pendientes
      const { count: highCount } = await supabase
        .from("student_case_records")
        .select("id, title, severity_level", { count: "exact" })
        .in("severity_level", ["alta", "critica"])
        .order("created_at", { ascending: false })
        .limit(3);

      if (highCount && highCount > 0) {
        newMessages.push({
          id: "dupla-high-severity",
          text: tone(character,
            `⚠️ ${highCount} caso(s) con severidad alta/crítica registrado(s). Prioriza seguimiento.`,
            `Hay ${highCount} caso(s) marcados como alta o crítica severidad 🚨 Requieren seguimiento prioritario.`),
          emotion: "alert",
          priority: 9,
        });
      }

      // 4. Accesos compartidos por vencer
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: expiringAccess } = await supabase
        .from("shared_case_access")
        .select("id", { count: "exact", head: true })
        .not("expires_at", "is", null)
        .lte("expires_at", nextWeek)
        .gte("expires_at", new Date().toISOString());

      if (expiringAccess && expiringAccess > 0) {
        newMessages.push({
          id: "dupla-expiring-access",
          text: tone(character,
            `${expiringAccess} acceso(s) compartido(s) vencen esta semana. Revisa en la sección de estudiantes.`,
            `Hay ${expiringAccess} acceso(s) compartido(s) que vencen pronto ⏰ ¿Los revisamos?`),
          emotion: "thinking",
          priority: 6,
        });
      }

      // 5. Reportes semanales
      if (dayOfWeek === 1 || dayOfWeek === 5) {
        newMessages.push({
          id: "dupla-reports",
          text: tone(character,
            dayOfWeek === 1
              ? "Inicio de semana. Revisa el reporte de impacto y planifica intervenciones."
              : "Cierre de semana. Momento ideal para consolidar el reporte semanal.",
            dayOfWeek === 1
              ? "¡Nuevo inicio de semana! 📈 Es un buen momento para revisar los reportes y planificar."
              : "¡Viernes! 🎉 ¿Cerramos la semana revisando cómo fue el impacto de las intervenciones?"),
          emotion: "thinking",
          priority: 4,
        });
      } else {
        newMessages.push({
          id: "dupla-reports",
          text: tone(character,
            "Es momento de revisar el reporte de impacto semanal.",
            "¿Revisamos juntos cómo van los indicadores esta semana? 📈 Los reportes están listos."),
          emotion: "thinking",
          priority: 3,
        });
      }
    }

    // ═══════════════════════════════════════════
    // ORIENTADOR TRIGGERS
    // ═══════════════════════════════════════════
    if (isOrientador) {
      const { count: sharedCount } = await supabase
        .from("shared_case_access")
        .select("id", { count: "exact", head: true })
        .eq("granted_to", profile.id);

      if (sharedCount && sharedCount > 0) {
        newMessages.push({
          id: "orientador-shared",
          text: tone(character,
            `Tienes acceso a ${sharedCount} ficha(s) compartida(s). Revisa las actualizaciones.`,
            `Te han compartido ${sharedCount} ficha(s) de estudiantes 📂 ¿Revisamos si hay novedades?`),
          emotion: "thinking",
          priority: 5,
        });
      }

      newMessages.push({
        id: "orientador-greeting",
        text: tone(character,
          "Revisa las alertas y fichas compartidas para tu seguimiento.",
          "¡Hola! 👋 Recuerda revisar las fichas y alertas que te han compartido."),
        emotion: "neutral",
        priority: 2,
      });
    }

    // ═══════════════════════════════════════════
    // ADMIN TRIGGERS
    // ═══════════════════════════════════════════
    if (isAdmin) {
      const { count: totalAlerts } = await supabase
        .from("alerts")
        .select("id", { count: "exact", head: true })
        .eq("status", "nueva");

      if (totalAlerts && totalAlerts > 0) {
        newMessages.push({
          id: "admin-alerts",
          text: tone(character,
            `${totalAlerts} alerta(s) institucional(es) activa(s). Revisa el panel ejecutivo.`,
            `Hay ${totalAlerts} alerta(s) activas en la institución 🏫 Veamos el panorama general.`),
          emotion: "alert",
          priority: 8,
        });
      }

      const { count: activityCount } = await supabase
        .from("school_activities")
        .select("id", { count: "exact", head: true })
        .eq("is_upcoming", true);

      if (activityCount && activityCount > 0) {
        newMessages.push({
          id: "admin-activities",
          text: tone(character,
            `${activityCount} actividad(es) programada(s). Monitorea la participación.`,
            `Hay ${activityCount} actividad(es) próximas 📅 ¡Buen momento para ver cómo va la participación!`),
          emotion: "neutral",
          priority: 4,
        });
      }

      newMessages.push({
        id: "admin-overview",
        text: tone(character,
          "Panel ejecutivo actualizado. Revisa los KPIs institucionales.",
          "¡Los datos institucionales están frescos! 🏫 Veamos cómo va todo."),
        emotion: "neutral",
        priority: 2,
      });
    }

    // Filter dismissed and sort by priority
    const filtered = newMessages
      .filter(m => !dismissed.includes(m.id))
      .sort((a, b) => b.priority - a.priority);

    setMessages(filtered);
    setLoading(false);
  }, [enabled, profile?.id, isStudent, isTeacher, isDupla, isInspector, isAdmin, isOrientador, character, activeRole]);

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
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  return { currentMessage, messages, dismiss, loading };
}
