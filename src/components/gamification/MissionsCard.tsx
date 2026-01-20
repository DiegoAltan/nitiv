import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStudentProgress, Mission } from "@/hooks/useStudentProgress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AVAILABLE_MISSIONS = [
  {
    type: "reflection_week",
    description: "Reflexionar sobre qué factores influyeron en tu bienestar esta semana",
    icon: "🌱",
  },
  {
    type: "before_after",
    description: "Registrar cómo te sientes antes y después de una actividad importante",
    icon: "🔄",
  },
  {
    type: "gratitude",
    description: "Identificar algo por lo que te sientes agradecido/a hoy",
    icon: "💚",
  },
  {
    type: "emotions_deep",
    description: "Explorar una emoción que hayas sentido con más detalle",
    icon: "🔍",
  },
  {
    type: "self_care",
    description: "Realizar una actividad de autocuidado y registrar cómo te sientes después",
    icon: "✨",
  },
];

export function MissionsCard() {
  const { profile } = useAuth();
  const { missions, completeMission, fetchProgress } = useStudentProgress();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [creatingMission, setCreatingMission] = useState(false);

  const activeMissions = missions.filter((m) => !m.is_completed);
  const completedMissions = missions.filter((m) => m.is_completed);

  const handleAcceptMission = async (missionType: string, description: string) => {
    if (!profile?.id) return;
    
    setCreatingMission(true);
    try {
      const { error } = await supabase.from("student_missions").insert({
        student_id: profile.id,
        mission_type: missionType,
        mission_description: description,
      });

      if (error) throw error;

      toast({
        title: "Misión aceptada",
        description: "Tómate tu tiempo para completarla. No hay presión.",
      });

      fetchProgress();
    } catch (error: any) {
      console.error("Error creating mission:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la misión",
        variant: "destructive",
      });
    } finally {
      setCreatingMission(false);
    }
  };

  const handleCompleteMission = async (missionId: string) => {
    await completeMission(missionId);
    toast({
      title: "¡Bien hecho!",
      description: "Has completado esta misión de autorreflexión.",
    });
  };

  // Get missions not yet active
  const availableToAccept = AVAILABLE_MISSIONS.filter(
    (m) => !missions.some((active) => active.mission_type === m.type && !active.is_completed)
  );

  return (
    <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Misiones de Autorreflexión
            <span className="text-sm font-normal text-muted-foreground">
              (Opcionales)
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Active missions */}
        {activeMissions.length > 0 && (
          <div className="space-y-3 mb-4">
            <p className="text-sm text-muted-foreground">Misiones activas:</p>
            {activeMissions.map((mission) => {
              const missionInfo = AVAILABLE_MISSIONS.find(
                (m) => m.type === mission.mission_type
              );
              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-primary/5 border border-primary/20"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{missionInfo?.icon || "🎯"}</span>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        {mission.mission_description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sin fecha límite • Tómate tu tiempo
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompleteMission(mission.id)}
                      className="shrink-0"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Completar
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {activeMissions.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm">No tienes misiones activas.</p>
            <p className="text-xs mt-1">
              Las misiones son opcionales y te ayudan a reflexionar.
            </p>
          </div>
        )}

        {/* Expandable section with available missions */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-border/50 mt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Elige una misión (opcional):
                </p>
                <div className="space-y-2">
                  {availableToAccept.slice(0, 3).map((mission) => (
                    <div
                      key={mission.type}
                      className="p-3 rounded-lg bg-muted/30 border border-border/50 flex items-center gap-3"
                    >
                      <span className="text-xl">{mission.icon}</span>
                      <p className="text-sm flex-1 text-muted-foreground">
                        {mission.description}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={creatingMission}
                        onClick={() =>
                          handleAcceptMission(mission.type, mission.description)
                        }
                      >
                        Aceptar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completed missions */}
              {completedMissions.length > 0 && (
                <div className="pt-4 border-t border-border/50 mt-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Completadas ({completedMissions.length}):
                  </p>
                  <div className="space-y-2">
                    {completedMissions.slice(0, 3).map((mission) => {
                      const missionInfo = AVAILABLE_MISSIONS.find(
                        (m) => m.type === mission.mission_type
                      );
                      return (
                        <div
                          key={mission.id}
                          className="p-2 rounded-lg bg-success/10 border border-success/20 flex items-center gap-2"
                        >
                          <Check className="w-4 h-4 text-success" />
                          <span className="text-sm text-muted-foreground line-through">
                            {missionInfo?.description || mission.mission_description}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
