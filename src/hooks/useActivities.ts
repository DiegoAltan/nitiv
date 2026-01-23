import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Activity {
  id: string;
  title: string;
  description: string | null;
  activity_date: string;
  activity_time: string | null;
  course_id: string | null;
  activity_type: "interna" | "externa" | "conjunta";
  organizers: string[];
  photo_urls: string[];
  is_upcoming: boolean;
  created_by: string;
  institution_id: string | null;
  created_at: string;
  updated_at: string;
  course?: { name: string; level: string } | null;
  average_rating?: number;
  total_ratings?: number;
  user_rating?: number | null;
}

export interface CreateActivityData {
  title: string;
  description?: string;
  activity_date: string;
  activity_time?: string;
  course_id?: string;
  activity_type: "interna" | "externa" | "conjunta";
  organizers: string[];
  is_upcoming: boolean;
  photo_urls?: string[];
}

export function useActivities() {
  const { profile, isStudent } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ["school-activities"],
    queryFn: async () => {
      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("school_activities")
        .select(`
          *,
          course:courses(name, level)
        `)
        .order("activity_date", { ascending: false });

      if (activitiesError) throw activitiesError;

      // Fetch all ratings
      const { data: ratingsData, error: ratingsError } = await supabase
        .from("activity_ratings")
        .select("*");

      if (ratingsError) throw ratingsError;

      // Calculate average ratings and check user rating
      const activitiesWithRatings = activitiesData.map((activity) => {
        const activityRatings = ratingsData.filter(
          (r) => r.activity_id === activity.id
        );
        const totalRatings = activityRatings.length;
        const averageRating =
          totalRatings > 0
            ? activityRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
            : 0;
        const userRating = profile
          ? activityRatings.find((r) => r.student_id === profile.id)?.rating
          : null;

        return {
          ...activity,
          average_rating: Math.round(averageRating * 10) / 10,
          total_ratings: totalRatings,
          user_rating: userRating,
        };
      });

      return activitiesWithRatings as Activity[];
    },
  });

  const createActivity = useMutation({
    mutationFn: async (data: CreateActivityData) => {
      if (!profile) throw new Error("No profile found");

      const { data: newActivity, error } = await supabase
        .from("school_activities")
        .insert({
          ...data,
          created_by: profile.id,
          institution_id: profile.institution_id,
        })
        .select()
        .single();

      if (error) throw error;
      return newActivity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-activities"] });
      toast({
        title: "Actividad creada",
        description: "La actividad se ha registrado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la actividad.",
        variant: "destructive",
      });
      console.error("Error creating activity:", error);
    },
  });

  const updateActivity = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Activity> & { id: string }) => {
      const { data: updated, error } = await supabase
        .from("school_activities")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-activities"] });
      toast({
        title: "Actividad actualizada",
        description: "Los cambios se han guardado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la actividad.",
        variant: "destructive",
      });
      console.error("Error updating activity:", error);
    },
  });

  const deleteActivity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("school_activities")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-activities"] });
      toast({
        title: "Actividad eliminada",
        description: "La actividad se ha eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la actividad.",
        variant: "destructive",
      });
      console.error("Error deleting activity:", error);
    },
  });

  const rateActivity = useMutation({
    mutationFn: async ({
      activityId,
      rating,
    }: {
      activityId: string;
      rating: number;
    }) => {
      if (!profile) throw new Error("No profile found");

      const { data, error } = await supabase
        .from("activity_ratings")
        .upsert(
          {
            activity_id: activityId,
            student_id: profile.id,
            rating,
          },
          {
            onConflict: "activity_id,student_id",
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-activities"] });
      toast({
        title: "Valoración guardada",
        description: "Tu valoración se ha registrado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar tu valoración.",
        variant: "destructive",
      });
      console.error("Error rating activity:", error);
    },
  });

  const upcomingActivities = activities.filter((a) => a.is_upcoming);
  const pastActivities = activities.filter((a) => !a.is_upcoming);

  return {
    activities,
    upcomingActivities,
    pastActivities,
    isLoading,
    error,
    createActivity,
    updateActivity,
    deleteActivity,
    rateActivity,
    canEdit: !isStudent,
    canRate: isStudent,
  };
}
