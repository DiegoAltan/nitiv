import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";

interface WellbeingDistribution {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
}

interface WeeklyTrendItem {
  day: string;
  estudiante: number;
  docente: number;
}

interface CoursePerformanceItem {
  name: string;
  wellbeing: number;
}

interface ExecutiveStats {
  totalStudents: number;
  totalCourses: number;
  activeStudents: number;
  todayRecords: number;
  averageWellbeing: number;
  wellbeingTrend: number;
  participationRate: number;
  participationTrend: number;
  activeAlerts: number;
  criticalAlerts: number;
  discrepancyAverage: number;
  discrepancyLabel: string;
  wellbeingDistribution: WellbeingDistribution;
  emotionDistribution: Record<string, number>;
  weeklyTrend: WeeklyTrendItem[];
  coursePerformance: CoursePerformanceItem[];
  topCourse: string;
  bottomCourse: string;
  dominantEmotion: string;
}

const defaultStats: ExecutiveStats = {
  totalStudents: 0,
  totalCourses: 0,
  activeStudents: 0,
  todayRecords: 0,
  averageWellbeing: 0,
  wellbeingTrend: 0,
  participationRate: 0,
  participationTrend: 0,
  activeAlerts: 0,
  criticalAlerts: 0,
  discrepancyAverage: 0,
  discrepancyLabel: "Baja",
  wellbeingDistribution: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 },
  emotionDistribution: {},
  weeklyTrend: [],
  coursePerformance: [],
  topCourse: "",
  bottomCourse: "",
  dominantEmotion: "",
};

export function useExecutiveData() {
  const [stats, setStats] = useState<ExecutiveStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const today = new Date();
        const todayStr = format(today, "yyyy-MM-dd");

        // Fetch all data in parallel
        const [
          studentsResult,
          coursesResult,
          wellbeingResult,
          todayWellbeingResult,
          alertsResult,
          teacherEvalsResult,
        ] = await Promise.all([
          supabase.from("profiles").select("id").not("id", "is", null),
          supabase.from("courses").select("id, name"),
          supabase.from("wellbeing_records").select("*"),
          supabase.from("wellbeing_records").select("id").eq("recorded_at", todayStr),
          supabase.from("alerts").select("id, alert_type, status"),
          supabase.from("teacher_evaluations").select("*"),
        ]);

        const students = studentsResult.data || [];
        const courses = coursesResult.data || [];
        const wellbeingRecords = wellbeingResult.data || [];
        const todayRecords = todayWellbeingResult.data || [];
        const alerts = alertsResult.data || [];
        const teacherEvals = teacherEvalsResult.data || [];

        // Calculate total students (filter to only students with wellbeing records)
        const studentsWithRecords = new Set(wellbeingRecords.map((r) => r.student_id));
        const totalStudents = studentsWithRecords.size || students.length;

        // Today's active students
        const todayStudents = new Set(todayRecords.map((r: any) => r.student_id));
        const activeStudents = todayStudents.size;

        // Participation rate
        const participationRate = totalStudents > 0 
          ? Math.round((activeStudents / totalStudents) * 100) 
          : 0;

        // Average wellbeing
        const avgWellbeing = wellbeingRecords.length > 0
          ? wellbeingRecords.reduce((sum, r) => sum + (r.wellbeing_level || 0), 0) / wellbeingRecords.length
          : 0;

        // Wellbeing distribution
        const distribution: WellbeingDistribution = { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 };
        wellbeingRecords.forEach((r) => {
          const level = r.wellbeing_level;
          if (level === 1) distribution.level1++;
          else if (level === 2) distribution.level2++;
          else if (level === 3) distribution.level3++;
          else if (level === 4) distribution.level4++;
          else if (level === 5) distribution.level5++;
        });

        // Emotion distribution
        const emotionCounts: Record<string, number> = {};
        wellbeingRecords.forEach((r) => {
          if (r.emotions && Array.isArray(r.emotions)) {
            r.emotions.forEach((emotion: string) => {
              emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
            });
          }
        });
        const totalEmotions = Object.values(emotionCounts).reduce((a, b) => a + b, 0);
        const emotionDistribution: Record<string, number> = {};
        Object.entries(emotionCounts).forEach(([emotion, count]) => {
          emotionDistribution[emotion] = totalEmotions > 0 ? Math.round((count / totalEmotions) * 100) : 0;
        });

        // Dominant emotion
        const dominantEmotion = Object.entries(emotionDistribution)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || "";

        // Weekly trend
        const weeklyTrend: WeeklyTrendItem[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = subDays(today, i);
          const dateStr = format(date, "yyyy-MM-dd");
          const dayName = format(date, "EEE", { locale: es });
          
          const dayRecords = wellbeingRecords.filter(
            (r) => format(new Date(r.recorded_at), "yyyy-MM-dd") === dateStr
          );
          const dayEvals = teacherEvals.filter(
            (e) => format(new Date(e.evaluated_at), "yyyy-MM-dd") === dateStr
          );

          const avgStudent = dayRecords.length > 0
            ? dayRecords.reduce((sum, r) => sum + (r.wellbeing_level || 0), 0) / dayRecords.length
            : 0;

          const evalLevelMap: Record<string, number> = { bajo: 2, medio: 3, alto: 4 };
          const avgTeacher = dayEvals.length > 0
            ? dayEvals.reduce((sum, e) => sum + (evalLevelMap[e.evaluation_level] || 3), 0) / dayEvals.length
            : 0;

          weeklyTrend.push({
            day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
            estudiante: Number(avgStudent.toFixed(1)),
            docente: Number(avgTeacher.toFixed(1)),
          });
        }

        // Calculate discrepancy
        const discrepancySum = weeklyTrend.reduce((sum, d) => {
          if (d.estudiante > 0 && d.docente > 0) {
            return sum + Math.abs(d.estudiante - d.docente);
          }
          return sum;
        }, 0);
        const discrepancyCount = weeklyTrend.filter((d) => d.estudiante > 0 && d.docente > 0).length;
        const discrepancyAverage = discrepancyCount > 0 ? discrepancySum / discrepancyCount : 0;
        
        let discrepancyLabel = "Baja";
        if (discrepancyAverage >= 1.5) discrepancyLabel = "Alta";
        else if (discrepancyAverage >= 0.8) discrepancyLabel = "Media";

        // Alerts
        const activeAlerts = alerts.filter((a) => a.status !== "resuelta").length;
        const criticalAlerts = alerts.filter(
          (a) => a.status !== "resuelta" && (a.alert_type === "bienestar_bajo" || a.alert_type === "sostenido_bajo")
        ).length;

        // Course performance
        const coursePerformance: CoursePerformanceItem[] = courses.slice(0, 6).map((course) => {
          // This is simplified - in a real scenario you'd join with student_courses
          return {
            name: course.name,
            wellbeing: 2.5 + Math.random() * 2, // Placeholder - would need proper join
          };
        });

        // Sort to find top/bottom
        const sortedCourses = [...coursePerformance].sort((a, b) => b.wellbeing - a.wellbeing);
        const topCourse = sortedCourses[0]?.name || "";
        const bottomCourse = sortedCourses[sortedCourses.length - 1]?.name || "";

        setStats({
          totalStudents,
          totalCourses: courses.length,
          activeStudents,
          todayRecords: todayRecords.length,
          averageWellbeing: avgWellbeing,
          wellbeingTrend: 2.5, // Placeholder for trend calculation
          participationRate,
          participationTrend: 5, // Placeholder
          activeAlerts,
          criticalAlerts,
          discrepancyAverage,
          discrepancyLabel,
          wellbeingDistribution: distribution,
          emotionDistribution,
          weeklyTrend,
          coursePerformance,
          topCourse,
          bottomCourse,
          dominantEmotion,
        });
      } catch (error) {
        console.error("Error fetching executive data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { stats, loading };
}
