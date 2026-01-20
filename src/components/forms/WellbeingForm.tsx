import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Calendar, Heart } from "lucide-react";
import { WellbeingScale } from "@/components/ui/WellbeingScale";
import { EmotionSelector, Emotion } from "@/components/ui/EmotionSelector";
import { ScaleSlider } from "@/components/ui/ScaleSlider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ValidatingMessage } from "@/components/gamification/ValidatingMessage";
import { LevelBadge } from "@/components/gamification/LevelBadge";

export function WellbeingForm() {
  const [wellbeingLevel, setWellbeingLevel] = useState(0);
  const [anxietyLevel, setAnxietyLevel] = useState(1);
  const [stressLevel, setStressLevel] = useState(1);
  const [selectedEmotions, setSelectedEmotions] = useState<Emotion[]>([]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { toast } = useToast();
  const { profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wellbeingLevel === 0) return;

    setIsSubmitting(true);
    
    try {
      if (!profile?.id) {
        throw new Error("No profile found");
      }

      const { error } = await supabase.from("wellbeing_records").insert({
        student_id: profile.id,
        wellbeing_level: wellbeingLevel,
        anxiety_level: anxietyLevel,
        stress_level: stressLevel,
        emotions: selectedEmotions,
        comment: comment || null,
      });

      if (error) throw error;

      toast({
        title: "¡Registro guardado!",
        description: "Tu bienestar ha sido registrado exitosamente.",
      });
      
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Error saving wellbeing:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar tu registro. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 max-w-lg mx-auto"
      >
        <Card className="card-elevated p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
            <span className="text-4xl">✨</span>
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">¡Gracias por compartir!</h2>
          <p className="text-muted-foreground mb-6">
            Tu registro de bienestar ha sido guardado. Recuerda que siempre puedes 
            hablar con tu profesor o psicólogo si necesitas apoyo.
          </p>
          
          {/* Validating Message */}
          <ValidatingMessage showAfterSubmit={true} />
          
          {/* Level Progress */}
          <div className="mt-6 flex justify-center">
            <LevelBadge size="md" />
          </div>

          <Button
            onClick={() => {
              setIsSubmitted(false);
              setWellbeingLevel(0);
              setAnxietyLevel(1);
              setStressLevel(1);
              setSelectedEmotions([]);
              setComment("");
            }}
            variant="outline"
            className="mt-6"
          >
            Registrar otro día
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="card-elevated max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
          <Calendar className="w-4 h-4" />
          <span className="capitalize">{today}</span>
        </div>
        <CardTitle className="text-2xl font-display">¿Cómo te sientes hoy?</CardTitle>
        <CardDescription>
          Tómate un momento para reflexionar sobre tu bienestar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Wellbeing Scale */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground block text-center">
              Nivel de bienestar general
            </label>
            <WellbeingScale
              value={wellbeingLevel}
              onChange={setWellbeingLevel}
              size="lg"
            />
          </div>

          {/* Anxiety Scale */}
          <div className="p-4 rounded-xl bg-muted/50 backdrop-blur-sm border border-border/50">
            <ScaleSlider
              label="Nivel de ansiedad"
              value={anxietyLevel}
              onChange={setAnxietyLevel}
              min={1}
              max={10}
              lowLabel="Tranquilo/a"
              highLabel="Muy ansioso/a"
              colorVariant="anxiety"
            />
          </div>

          {/* Stress Scale */}
          <div className="p-4 rounded-xl bg-muted/50 backdrop-blur-sm border border-border/50">
            <ScaleSlider
              label="Nivel de estrés"
              value={stressLevel}
              onChange={setStressLevel}
              min={1}
              max={10}
              lowLabel="Relajado/a"
              highLabel="Muy estresado/a"
              colorVariant="stress"
            />
          </div>

          {/* Emotions */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground block">
              ¿Qué emociones describen mejor cómo te sientes?
            </label>
            <EmotionSelector
              selected={selectedEmotions}
              onChange={setSelectedEmotions}
              maxSelection={3}
            />
          </div>

          {/* Optional comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">
              ¿Algo más que quieras compartir? <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 200))}
              placeholder="Escribe aquí si deseas..."
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/200 caracteres
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={wellbeingLevel === 0 || isSubmitting}
            className="w-full bg-gradient-hero hover:opacity-90 transition-opacity"
            size="lg"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar registro
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
