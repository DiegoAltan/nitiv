import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WellbeingRecord {
  id: string;
  wellbeing_level: number;
  anxiety_level: number | null;
  stress_level: number | null;
  emotions: string[];
  comment: string | null;
  recorded_at: string;
  created_at: string;
}

interface StudentStats {
  averageWellbeing: number;
  daysRegistered: number;
  currentStreak: number;
  recentRecords: WellbeingRecord[];
}

export function useStudentWellbeing() {
  const [stats, setStats] = useState<StudentStats>({
    averageWellbeing: 0,
    daysRegistered: 0,
    currentStreak: 0,
    recentRecords: [],
  });
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch wellbeing records
        const { data: records, error } = await supabase
          .from("wellbeing_records")
          .select("*")
          .eq("student_id", profile.id)
          .order("recorded_at", { ascending: false });

        if (error) throw error;

        const wellbeingRecords = records as WellbeingRecord[];

        // Calculate stats
        const thisMonth = wellbeingRecords.filter((r) => {
          const recordDate = new Date(r.recorded_at);
          const now = new Date();
          return (
            recordDate.getMonth() === now.getMonth() &&
            recordDate.getFullYear() === now.getFullYear()
          );
        });

        const thisWeek = wellbeingRecords.filter((r) => {
          const recordDate = new Date(r.recorded_at);
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return recordDate >= weekAgo;
        });

        const averageWellbeing =
          thisWeek.length > 0
            ? thisWeek.reduce((sum, r) => sum + r.wellbeing_level, 0) / thisWeek.length
            : 0;

        // Calculate streak
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const dateStr = checkDate.toISOString().split("T")[0];
          
          const hasRecord = wellbeingRecords.some(
            (r) => r.recorded_at === dateStr
          );
          
          if (hasRecord) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }

        setStats({
          averageWellbeing: Math.round(averageWellbeing * 10) / 10,
          daysRegistered: thisMonth.length,
          currentStreak: streak,
          recentRecords: wellbeingRecords.slice(0, 5),
        });
      } catch (error) {
        console.error("Error fetching student wellbeing:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.id]);

  return { stats, loading };
}
