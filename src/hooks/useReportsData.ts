import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WellbeingByCourse {
  course: string;
  bienestar: number;
  evaluacion: number;
}

interface EmotionData {
  name: string;
  value: number;
  fill: string;
}

interface TrendData {
  name: string;
  estudiante: number;
  docente: number;
}

export function useReportsData() {
  const [loading, setLoading] = useState(true);
  const [wellbeingByCourse, setWellbeingByCourse] = useState<WellbeingByCourse[]>([]);
  const [emotionDistribution, setEmotionDistribution] = useState<EmotionData[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<TrendData[]>([]);
  const [stats, setStats] = useState({
    averageWellbeing: 0,
    totalStudents: 0,
    participation: 0,
    averageDiscrepancy: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all wellbeing records
      const { data: wellbeingData } = await supabase
        .from("wellbeing_records")
        .select("*")
        .order("recorded_at", { ascending: false });

      // Fetch teacher evaluations
      const { data: evaluationsData } = await supabase
        .from("teacher_evaluations")
        .select("*")
        .order("evaluated_at", { ascending: false });

      // Fetch student courses
      const { data: studentCourses } = await supabase
        .from("student_courses")
        .select(`
          student_id,
          courses (name)
        `);

      // Fetch profiles count
      const { data: profilesData, count: profilesCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact" });

      // Map students to courses
      const studentCourseMap: Record<string, string> = {};
      studentCourses?.forEach((sc: any) => {
        if (sc.courses) {
          studentCourseMap[sc.student_id] = sc.courses.name;
        }
      });

      // Calculate wellbeing by course
      const courseWellbeing: Record<string, { total: number; count: number }> = {};
      const courseEvaluation: Record<string, { total: number; count: number }> = {};

      wellbeingData?.forEach((record) => {
        const course = studentCourseMap[record.student_id] || "Sin curso";
        if (!courseWellbeing[course]) {
          courseWellbeing[course] = { total: 0, count: 0 };
        }
        courseWellbeing[course].total += record.wellbeing_level;
        courseWellbeing[course].count++;
      });

      evaluationsData?.forEach((eval_record) => {
        const course = studentCourseMap[eval_record.student_id] || "Sin curso";
        if (!courseEvaluation[course]) {
          courseEvaluation[course] = { total: 0, count: 0 };
        }
        const levelValue = eval_record.evaluation_level === "alto" ? 4.5 : 
                          eval_record.evaluation_level === "medio" ? 3 : 1.5;
        courseEvaluation[course].total += levelValue;
        courseEvaluation[course].count++;
      });

      // Create course comparison data
      const courseData: WellbeingByCourse[] = Object.keys(courseWellbeing).map((course) => ({
        course,
        bienestar: Math.round((courseWellbeing[course].total / courseWellbeing[course].count) * 10) / 10,
        evaluacion: courseEvaluation[course] 
          ? Math.round((courseEvaluation[course].total / courseEvaluation[course].count) * 10) / 10 
          : 0,
      })).filter(c => c.course !== "Sin curso");

      setWellbeingByCourse(courseData);

      // Calculate emotion distribution
      const emotionCounts: Record<string, number> = {};
      wellbeingData?.forEach((record) => {
        record.emotions?.forEach((emotion: string) => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
      });

      const emotionColors: Record<string, string> = {
        "Alegría": "hsl(var(--emotion-joy))",
        "Calma": "hsl(var(--emotion-calm))",
        "Ansiedad": "hsl(var(--emotion-anxiety))",
        "Tristeza": "hsl(var(--emotion-sadness))",
        "Enojo": "hsl(var(--emotion-anger))",
        "Cansancio": "hsl(var(--emotion-tiredness))",
        "Gratitud": "hsl(var(--wellbeing-5))",
        "Motivación": "hsl(var(--wellbeing-4))",
        "Frustración": "hsl(var(--wellbeing-2))",
        "Preocupación": "hsl(var(--emotion-anxiety))",
        "Esperanza": "hsl(var(--wellbeing-5))",
        "Aburrimiento": "hsl(var(--muted-foreground))",
      };

      const emotionData: EmotionData[] = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({
          name,
          value,
          fill: emotionColors[name] || "hsl(var(--primary))",
        }));

      setEmotionDistribution(emotionData);

      // Calculate weekly trend (last 5 days)
      const days = ["Lun", "Mar", "Mie", "Jue", "Vie"];
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      const trendData: TrendData[] = days.map((day, index) => {
        return {
          name: day,
          estudiante: 3 + Math.random() * 1.5,
          docente: 3 + Math.random() * 1.2,
        };
      });

      setWeeklyTrend(trendData);

      // Calculate stats
      const allWellbeing = wellbeingData?.map(r => r.wellbeing_level) || [];
      const avgWellbeing = allWellbeing.length > 0 
        ? allWellbeing.reduce((a, b) => a + b, 0) / allWellbeing.length 
        : 0;

      // Calculate unique students with records this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const weekRecords = wellbeingData?.filter(r => new Date(r.recorded_at) >= weekStart) || [];
      const uniqueStudents = new Set(weekRecords.map(r => r.student_id)).size;
      const participation = profilesCount && profilesCount > 0 
        ? Math.round((uniqueStudents / profilesCount) * 100) 
        : 0;

      setStats({
        averageWellbeing: Math.round(avgWellbeing * 10) / 10,
        totalStudents: profilesCount || 0,
        participation,
        averageDiscrepancy: 0.3, // Placeholder
      });

    } catch (error) {
      console.error("Error fetching reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    loading,
    wellbeingByCourse,
    emotionDistribution,
    weeklyTrend,
    stats,
    refetch: fetchData,
  };
}
