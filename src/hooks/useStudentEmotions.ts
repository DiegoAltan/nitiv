import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TimelineEntry {
  id: string;
  date: string;
  wellbeing_level: number;
  emotions: string[];
  description: string;
}

interface EmotionData {
  emotion: string;
  count: number;
  percentage: number;
}

interface StudentEmotionData {
  timeline: TimelineEntry[];
  emotionMap: EmotionData[];
  totalRecords: number;
  loading: boolean;
}

export function useStudentEmotions(): StudentEmotionData {
  const { profile } = useAuth();
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [emotionMap, setEmotionMap] = useState<EmotionData[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    const fetchEmotionData = async () => {
      try {
        const { data: records, error } = await supabase
          .from("wellbeing_records")
          .select("id, recorded_at, wellbeing_level, emotions")
          .eq("student_id", profile.id)
          .order("recorded_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        const wellbeingRecords = records || [];
        setTotalRecords(wellbeingRecords.length);

        // Build timeline entries
        const timelineEntries: TimelineEntry[] = wellbeingRecords.slice(0, 15).map((record) => ({
          id: record.id,
          date: record.recorded_at,
          wellbeing_level: record.wellbeing_level,
          emotions: (record.emotions as string[]) || [],
          description: "",
        }));
        setTimeline(timelineEntries);

        // Build emotion map
        const emotionCounts: Record<string, number> = {};
        wellbeingRecords.forEach((record) => {
          const emotions = (record.emotions as string[]) || [];
          emotions.forEach((emotion) => {
            emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
          });
        });

        const totalEmotions = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);
        
        const emotionData: EmotionData[] = Object.entries(emotionCounts).map(
          ([emotion, count]) => ({
            emotion,
            count,
            percentage: totalEmotions > 0 ? Math.round((count / totalEmotions) * 100) : 0,
          })
        );

        setEmotionMap(emotionData);
      } catch (error) {
        console.error("Error fetching emotion data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmotionData();
  }, [profile?.id]);

  return { timeline, emotionMap, totalRecords, loading };
}
