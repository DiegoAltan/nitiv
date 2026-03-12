import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Cloud, Zap, Users, AlertTriangle, MessageSquare, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useClassroomClimate, ClimateFormData } from "@/hooks/useClassroomClimate";
import { useTeacherData } from "@/hooks/useTeacherData";

const climateOptions = [
  { value: "positivo", label: "Positivo", emoji: "☀️", color: "bg-success/10 border-success text-success hover:bg-success/20" },
  { value: "neutro", label: "Neutro", emoji: "⛅", color: "bg-warning/10 border-warning text-warning hover:bg-warning/20" },
  { value: "tenso", label: "Tenso", emoji: "🌧️", color: "bg-alert/10 border-alert text-alert hover:bg-alert/20" },
  { value: "conflictivo", label: "Conflictivo", emoji: "⛈️", color: "bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20" },
];

const energyOptions = [
  { value: "alta", label: "Alta", emoji: "⚡" },
  { value: "moderada", label: "Moderada", emoji: "🔋" },
  { value: "baja", label: "Baja", emoji: "🪫" },
];

const participationOptions = [
  { value: "activa", label: "Activa", emoji: "🙋" },
  { value: "parcial", label: "Parcial", emoji: "✋" },
  { value: "pasiva", label: "Pasiva", emoji: "😶" },
];

export function ClimateQuickForm() {
  const { stats, loading: loadingCourses } = useTeacherData();
  const { submitClimate, submitting, getTodayRecord } = useClassroomClimate();
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [climate, setClimate] = useState("");
  const [energy, setEnergy] = useState("");
  const [participation, setParticipation] = useState("");
  const [conflict, setConflict] = useState(false);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto-select first course
  useEffect(() => {
    if (stats.courses.length > 0 && !selectedCourse) {
      setSelectedCourse(stats.courses[0].id);
    }
  }, [stats.courses]);

  // Check if already submitted today
  useEffect(() => {
    if (selectedCourse) {
      const existing = getTodayRecord(selectedCourse);
      if (existing) {
        setClimate(existing.climate_level);
        setEnergy(existing.energy_level);
        setParticipation(existing.participation_level);
        setConflict(existing.conflict_present);
        setNotes(existing.notes || "");
        setSubmitted(true);
      } else {
        setClimate("");
        setEnergy("");
        setParticipation("");
        setConflict(false);
        setNotes("");
        setSubmitted(false);
      }
    }
  }, [selectedCourse]);

  const handleSubmit = async () => {
    if (!selectedCourse || !climate || !energy || !participation) return;
    const data: ClimateFormData = {
      course_id: selectedCourse,
      climate_level: climate,
      energy_level: energy,
      participation_level: participation,
      conflict_present: conflict,
      notes: notes || undefined,
    };
    const success = await submitClimate(data);
    if (success) setSubmitted(true);
  };

  const isComplete = climate && energy && participation;

  if (loadingCourses) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (stats.courses.length === 0) return null;

  return (
    <Card className="border-border/60 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Cloud className="w-5 h-5 text-primary" />
          Clima de Aula
          {submitted && (
            <span className="ml-auto text-xs font-normal text-success flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Registrado hoy
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Course selector */}
        {stats.courses.length > 1 && (
          <div className="relative">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full appearance-none bg-muted/50 border border-border rounded-lg px-3 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {stats.courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        )}

        {/* Climate level */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5" /> Clima general
          </p>
          <div className="grid grid-cols-4 gap-2">
            {climateOptions.map((opt) => (
              <motion.button
                key={opt.value}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => { setClimate(opt.value); setSubmitted(false); }}
                className={cn(
                  "flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs font-medium",
                  climate === opt.value
                    ? opt.color + " border-current shadow-sm"
                    : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/60"
                )}
              >
                <span className="text-lg">{opt.emoji}</span>
                <span className="truncate">{opt.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Energy + Participation in row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Energía
            </p>
            <div className="flex gap-1.5">
              {energyOptions.map((opt) => (
                <motion.button
                  key={opt.value}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setEnergy(opt.value); setSubmitted(false); }}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-0.5 p-2 rounded-lg border-2 transition-all text-xs font-medium",
                    energy === opt.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  <span className="text-base">{opt.emoji}</span>
                  <span className="text-[10px]">{opt.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Participación
            </p>
            <div className="flex gap-1.5">
              {participationOptions.map((opt) => (
                <motion.button
                  key={opt.value}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setParticipation(opt.value); setSubmitted(false); }}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-0.5 p-2 rounded-lg border-2 transition-all text-xs font-medium",
                    participation === opt.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  <span className="text-base">{opt.emoji}</span>
                  <span className="text-[10px]">{opt.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Conflict toggle */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => { setConflict(!conflict); setSubmitted(false); }}
          className={cn(
            "w-full flex items-center gap-2.5 p-2.5 rounded-lg border-2 transition-all text-sm",
            conflict
              ? "border-alert bg-alert/10 text-alert"
              : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/60"
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">Hubo conflicto en el aula</span>
          {conflict && <Check className="w-4 h-4 ml-auto" />}
        </motion.button>

        {/* Notes toggle */}
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {showNotes ? "Ocultar nota" : "Agregar nota (opcional)"}
        </button>
        <AnimatePresence>
          {showNotes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <Textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setSubmitted(false); }}
                placeholder="Observación breve del clima..."
                className="text-sm resize-none h-16"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || submitting || submitted}
          className="w-full"
          size="sm"
        >
          {submitting ? "Guardando..." : submitted ? "✓ Registrado" : "Registrar Clima"}
        </Button>
      </CardContent>
    </Card>
  );
}
