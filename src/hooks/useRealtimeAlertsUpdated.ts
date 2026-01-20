import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Bell } from "lucide-react";

interface Alert {
  id: string;
  student_id: string;
  alert_type: string;
  description: string;
  status: string;
  created_at: string;
}

export function useRealtimeAlertsUpdated() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin, isDupla } = useAuth();

  const fetchAlerts = useCallback(async () => {
    if (!isAdmin && !isDupla) {
      setAlerts([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const alertsData = data as Alert[];
      setAlerts(alertsData);
      setUnreadCount(alertsData.filter((a) => a.status === "nueva").length);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isDupla]);

  useEffect(() => {
    if (!isAdmin && !isDupla) return;

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
          setAlerts((prev) => [newAlert, ...prev]);
          setUnreadCount((prev) => prev + 1);
          
          toast({
            title: "🚨 Nueva alerta",
            description: newAlert.description.slice(0, 100) + "...",
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
            prev.map((alert) =>
              alert.id === updatedAlert.id ? updatedAlert : alert
            )
          );
          // Recalculate unread count
          setAlerts((prev) => {
            setUnreadCount(prev.filter((a) => a.status === "nueva").length);
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, isDupla, fetchAlerts, toast]);

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("alerts")
        .update({ status: "en_revision" })
        .eq("id", alertId);

      if (error) throw error;

      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, status: "en_revision" } : alert
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("alerts")
        .update({ status: "resuelta", resolved_at: new Date().toISOString() })
        .eq("id", alertId);

      if (error) throw error;

      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, status: "resuelta" } : alert
        )
      );
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  };

  return {
    alerts,
    unreadCount,
    loading,
    markAsRead,
    resolveAlert,
    refresh: fetchAlerts,
  };
}
