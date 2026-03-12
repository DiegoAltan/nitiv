import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ClimateRecord {
  id: string;
  teacher_id: string;
  course_id: string;
  climate_level: string;
  energy_level: string;
  participation_level: string;
  conflict_present: boolean;
  notes: string | null;
  recorded_at: string;
  created_at: string;
}

export interface ClimateFormData {
  course_id: string;
  climate_level: string;
  energy_level: string;
  participation_level: string;
  conflict_present: boolean;
  notes?: string;
}

export function useClassroomClimate() {
  const [records, setRecords] = useState<ClimateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchRecords = async () => {
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase
        .from("classroom_climate")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setRecords((data as unknown as ClimateRecord[]) || []);
    } catch (error) {
      console.error("Error fetching climate records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [profile?.id]);

  const submitClimate = async (data: ClimateFormData) => {
    if (!profile?.id) return false;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("classroom_climate")
        .upsert(
          {
            teacher_id: profile.id,
            course_id: data.course_id,
            climate_level: data.climate_level,
            energy_level: data.energy_level,
            participation_level: data.participation_level,
            conflict_present: data.conflict_present,
            notes: data.notes || null,
            recorded_at: new Date().toISOString().split("T")[0],
          } as any,
          { onConflict: "teacher_id,course_id,recorded_at" }
        );

      if (error) throw error;

      toast({
        title: "Clima registrado",
        description: "El clima de aula se ha registrado correctamente.",
      });
      await fetchRecords();
      return true;
    } catch (error: any) {
      console.error("Error submitting climate:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el clima de aula.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const getTodayRecord = (courseId: string) => {
    const today = new Date().toISOString().split("T")[0];
    return records.find(
      (r) => r.course_id === courseId && r.recorded_at === today && r.teacher_id === profile?.id
    );
  };

  return { records, loading, submitting, submitClimate, getTodayRecord, refetch: fetchRecords };
}
