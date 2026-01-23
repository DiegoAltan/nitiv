import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ActivityNotification {
  id: string;
  activity_id: string;
  student_id: string;
  is_read: boolean;
  created_at: string;
  activity?: {
    title: string;
    activity_date: string;
    activity_time: string | null;
  };
}

export function useActivityNotifications() {
  const { profile, isStudent } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["activity-notifications", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from("activity_notifications")
        .select(`
          *,
          activity:school_activities(title, activity_date, activity_time)
        `)
        .eq("student_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as ActivityNotification[];
    },
    enabled: !!profile?.id && isStudent,
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("activity_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-notifications"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;

      const { error } = await supabase
        .from("activity_notifications")
        .update({ is_read: true })
        .eq("student_id", profile.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-notifications"] });
    },
  });

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!profile?.id || !isStudent) return;

    const channel = supabase
      .channel("activity-notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_notifications",
          filter: `student_id=eq.${profile.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["activity-notifications"] });
          toast({
            title: "Nueva actividad programada",
            description: "Se ha programado una nueva actividad de convivencia escolar.",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, isStudent, queryClient, toast]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  };
}
