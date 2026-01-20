import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Alert {
  id: string;
  student_id: string;
  alert_type: string;
  description: string;
  status: string;
  created_at: string;
}

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const { isAdmin, isDupla } = useAuth();

  useEffect(() => {
    // Only subscribe for users who can see alerts
    if (!isAdmin && !isDupla) return;

    // Fetch initial alerts
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from("alerts")
        .select("*")
        .neq("status", "resuelta")
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setAlerts(data);
        setUnreadCount(data.filter(a => a.status === "nueva").length);
      }
    };

    fetchAlerts();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("alerts-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerts",
        },
        (payload) => {
          const newAlert = payload.new as Alert;
          setAlerts((prev) => [newAlert, ...prev].slice(0, 10));
          setUnreadCount((prev) => prev + 1);

          // Show toast notification
          const alertTypeLabels: Record<string, string> = {
            bienestar_bajo: "Bienestar muy bajo",
            sostenido_bajo: "Bienestar bajo sostenido",
            discrepancia: "Discrepancia detectada",
          };

          toast({
            title: "🚨 Nueva alerta",
            description: alertTypeLabels[newAlert.alert_type] || newAlert.description,
            variant: "destructive",
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "alerts",
        },
        (payload) => {
          const updatedAlert = payload.new as Alert;
          setAlerts((prev) =>
            prev.map((a) => (a.id === updatedAlert.id ? updatedAlert : a))
          );
          
          // Recalculate unread count
          setAlerts((prev) => {
            const newUnread = prev.filter(a => a.status === "nueva").length;
            setUnreadCount(newUnread);
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, isDupla, toast]);

  const markAsRead = async (alertId: string) => {
    const { error } = await supabase
      .from("alerts")
      .update({ status: "en_revision" })
      .eq("id", alertId);

    if (!error) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: "en_revision" } : a))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  return { alerts, unreadCount, markAsRead };
}