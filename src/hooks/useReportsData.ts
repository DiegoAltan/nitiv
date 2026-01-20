import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WellbeingByCourse {
  course: string;
  bienestar: number;
  evaluacion: number;
  studentCount: number;
  recordCount: number;
  alertCount: number;
}

interface EmotionData {
  name: string;
  value: number;
  fill: string;
}

interface TrendData {
  name: string;
  date: string;
  estudiante: number;
  docente: number;
  recordCount: number;
}

interface StudentReport {
  id: string;
  name: string;
  course: string;
  avgWellbeing: number;
  recordCount: number;
  lastRecord: string | null;
  topEmotions: string[];
  hasAlert: boolean;
  trend: "up" | "down" | "stable";
}

interface CourseReport {
  id: string;
  name: string;
  level: string;
  studentCount: number;
  avgWellbeing: number;
  avgTeacherEval: number;
  discrepancy: number;
  participation: number;
  alertCount: number;
  topEmotions: { name: string; count: number }[];
  students: StudentReport[];
}

export function useReportsData(selectedCourse?: string, selectedStudent?: string) {
  const [loading, setLoading] = useState(true);
  const [wellbeingByCourse, setWellbeingByCourse] = useState<WellbeingByCourse[]>([]);
  const [emotionDistribution, setEmotionDistribution] = useState<EmotionData[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<TrendData[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<TrendData[]>([]);
  const [courses, setCourses] = useState<CourseReport[]>([]);
  const [students, setStudents] = useState<StudentReport[]>([]);
  const [selectedCourseData, setSelectedCourseData] = useState<CourseReport | null>(null);
  const [selectedStudentData, setSelectedStudentData] = useState<StudentReport | null>(null);
  const [stats, setStats] = useState({
    averageWellbeing: 0,
    totalStudents: 0,
    participation: 0,
    averageDiscrepancy: 0,
    totalRecords: 0,
    activeAlerts: 0,
    lowWellbeingCount: 0,
  });

  // Distinct vibrant colors for each emotion
  const emotionColors: Record<string, string> = {
    "Alegría": "#FFD93D",
    "Calma": "#6BCB77",
    "Ansiedad": "#9B59B6",
    "Tristeza": "#5DADE2",
    "Enojo": "#E74C3C",
    "Cansancio": "#95A5A6",
    "Gratitud": "#27AE60",
    "Motivación": "#F39C12",
    "Frustración": "#E67E22",
    "Preocupación": "#8E44AD",
    "Esperanza": "#1ABC9C",
    "Aburrimiento": "#7F8C8D",
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all courses
      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, name, level")
        .order("level")
        .order("name");

      // Fetch student courses with profiles
      const { data: studentCourses } = await supabase
        .from("student_courses")
        .select(`
          student_id,
          course_id,
          courses (id, name, level),
          profiles:student_id (id, full_name, email, avatar_url)
        `);

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

      // Fetch alerts
      const { data: alertsData } = await supabase
        .from("alerts")
        .select("*")
        .neq("status", "resuelta");

      // Build student-course mapping
      const studentCourseMap: Record<string, { courseId: string; courseName: string; level: string }> = {};
      const courseStudentMap: Record<string, string[]> = {};
      
      studentCourses?.forEach((sc: any) => {
        if (sc.courses && sc.profiles) {
          const courseId = sc.courses.id;
          const courseName = sc.courses.name;
          const level = sc.courses.level || "";
          studentCourseMap[sc.student_id] = { courseId, courseName, level };
          
          if (!courseStudentMap[courseId]) {
            courseStudentMap[courseId] = [];
          }
          courseStudentMap[courseId].push(sc.student_id);
        }
      });

      // Build student name map
      const studentNameMap: Record<string, string> = {};
      studentCourses?.forEach((sc: any) => {
        if (sc.profiles) {
          studentNameMap[sc.student_id] = sc.profiles.full_name || "Sin nombre";
        }
      });

      // Build student alerts map
      const studentAlertMap: Record<string, boolean> = {};
      alertsData?.forEach((alert) => {
        studentAlertMap[alert.student_id] = true;
      });

      // Calculate per-student statistics
      const studentWellbeingMap: Record<string, { total: number; count: number; records: number[]; emotions: string[]; lastRecord: string | null }> = {};
      
      wellbeingData?.forEach((record) => {
        if (!studentWellbeingMap[record.student_id]) {
          studentWellbeingMap[record.student_id] = { total: 0, count: 0, records: [], emotions: [], lastRecord: null };
        }
        studentWellbeingMap[record.student_id].total += record.wellbeing_level;
        studentWellbeingMap[record.student_id].count++;
        studentWellbeingMap[record.student_id].records.push(record.wellbeing_level);
        if (record.emotions) {
          studentWellbeingMap[record.student_id].emotions.push(...record.emotions);
        }
        if (!studentWellbeingMap[record.student_id].lastRecord) {
          studentWellbeingMap[record.student_id].lastRecord = record.recorded_at;
        }
      });

      // Build student reports
      const studentReports: StudentReport[] = Object.entries(studentWellbeingMap).map(([studentId, data]) => {
        const courseInfo = studentCourseMap[studentId];
        const records = data.records;
        let trend: "up" | "down" | "stable" = "stable";
        
        if (records.length >= 3) {
          const recent = records.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
          const older = records.slice(3, 6).reduce((a, b) => a + b, 0) / Math.min(records.length - 3, 3);
          if (recent > older + 0.3) trend = "up";
          else if (recent < older - 0.3) trend = "down";
        }

        // Count emotion frequency
        const emotionCounts: Record<string, number> = {};
        data.emotions.forEach(e => {
          emotionCounts[e] = (emotionCounts[e] || 0) + 1;
        });
        const topEmotions = Object.entries(emotionCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name]) => name);

        return {
          id: studentId,
          name: studentNameMap[studentId] || "Estudiante",
          course: courseInfo?.courseName || "Sin curso",
          avgWellbeing: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0,
          recordCount: data.count,
          lastRecord: data.lastRecord,
          topEmotions,
          hasAlert: studentAlertMap[studentId] || false,
          trend,
        };
      });

      setStudents(studentReports);

      // Build course reports
      const courseReports: CourseReport[] = (coursesData || []).map((course) => {
        const studentIds = courseStudentMap[course.id] || [];
        const courseStudentReports = studentReports.filter(s => 
          studentCourseMap[s.id]?.courseId === course.id
        );

        // Calculate course wellbeing
        const wellbeingSum = courseStudentReports.reduce((sum, s) => sum + s.avgWellbeing * s.recordCount, 0);
        const recordSum = courseStudentReports.reduce((sum, s) => sum + s.recordCount, 0);
        const avgWellbeing = recordSum > 0 ? Math.round((wellbeingSum / recordSum) * 10) / 10 : 0;

        // Calculate teacher evaluations for course
        const courseEvals = evaluationsData?.filter(e => studentCourseMap[e.student_id]?.courseId === course.id) || [];
        const evalSum = courseEvals.reduce((sum, e) => {
          const val = e.evaluation_level === "alto" ? 4.5 : e.evaluation_level === "medio" ? 3 : 1.5;
          return sum + val;
        }, 0);
        const avgTeacherEval = courseEvals.length > 0 ? Math.round((evalSum / courseEvals.length) * 10) / 10 : 0;

        // Count alerts
        const alertCount = courseStudentReports.filter(s => s.hasAlert).length;

        // Participation
        const participation = studentIds.length > 0 
          ? Math.round((courseStudentReports.filter(s => s.recordCount > 0).length / studentIds.length) * 100)
          : 0;

        // Top emotions for course
        const allEmotions: Record<string, number> = {};
        courseStudentReports.forEach(s => {
          s.topEmotions.forEach(e => {
            allEmotions[e] = (allEmotions[e] || 0) + 1;
          });
        });
        const topEmotions = Object.entries(allEmotions)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([name, count]) => ({ name, count }));

        return {
          id: course.id,
          name: course.name,
          level: course.level || "",
          studentCount: studentIds.length,
          avgWellbeing,
          avgTeacherEval,
          discrepancy: Math.round(Math.abs(avgWellbeing - avgTeacherEval) * 10) / 10,
          participation,
          alertCount,
          topEmotions,
          students: courseStudentReports,
        };
      }).filter(c => c.studentCount > 0);

      setCourses(courseReports);

      // Set selected course data if applicable
      if (selectedCourse && selectedCourse !== "all") {
        const courseData = courseReports.find(c => c.id === selectedCourse || c.name === selectedCourse);
        setSelectedCourseData(courseData || null);
      } else {
        setSelectedCourseData(null);
      }

      // Set selected student data if applicable
      if (selectedStudent) {
        const studentData = studentReports.find(s => s.id === selectedStudent);
        setSelectedStudentData(studentData || null);
      } else {
        setSelectedStudentData(null);
      }

      // Calculate wellbeing by course for charts
      const wellbeingByCourseData: WellbeingByCourse[] = courseReports.map(c => ({
        course: c.name,
        bienestar: c.avgWellbeing,
        evaluacion: c.avgTeacherEval,
        studentCount: c.studentCount,
        recordCount: c.students.reduce((sum, s) => sum + s.recordCount, 0),
        alertCount: c.alertCount,
      }));

      setWellbeingByCourse(wellbeingByCourseData);

      // Calculate emotion distribution
      const allEmotionCounts: Record<string, number> = {};
      wellbeingData?.forEach((record) => {
        record.emotions?.forEach((emotion: string) => {
          allEmotionCounts[emotion] = (allEmotionCounts[emotion] || 0) + 1;
        });
      });

      const emotionData: EmotionData[] = Object.entries(allEmotionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({
          name,
          value,
          fill: emotionColors[name] || "hsl(var(--primary))",
        }));

      setEmotionDistribution(emotionData);

      // Calculate weekly trend (last 7 days)
      const now = new Date();
      const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const weekData: TrendData[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        
        const dayRecords = wellbeingData?.filter(r => r.recorded_at === dateStr) || [];
        const dayEvals = evaluationsData?.filter(e => e.evaluated_at === dateStr) || [];
        
        const avgStudent = dayRecords.length > 0 
          ? dayRecords.reduce((sum, r) => sum + r.wellbeing_level, 0) / dayRecords.length 
          : 0;
        const avgTeacher = dayEvals.length > 0 
          ? dayEvals.reduce((sum, e) => {
              const val = e.evaluation_level === "alto" ? 4.5 : e.evaluation_level === "medio" ? 3 : 1.5;
              return sum + val;
            }, 0) / dayEvals.length 
          : 0;

        weekData.push({
          name: dayNames[date.getDay()],
          date: dateStr,
          estudiante: Math.round(avgStudent * 10) / 10,
          docente: Math.round(avgTeacher * 10) / 10,
          recordCount: dayRecords.length,
        });
      }

      setWeeklyTrend(weekData);

      // Calculate monthly trend (last 4 weeks)
      const monthData: TrendData[] = [];
      for (let w = 3; w >= 0; w--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (w * 7 + 6));
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - (w * 7));
        
        const weekRecords = wellbeingData?.filter(r => {
          const recordDate = new Date(r.recorded_at);
          return recordDate >= weekStart && recordDate <= weekEnd;
        }) || [];
        
        const weekEvals = evaluationsData?.filter(e => {
          const evalDate = new Date(e.evaluated_at);
          return evalDate >= weekStart && evalDate <= weekEnd;
        }) || [];

        const avgStudent = weekRecords.length > 0 
          ? weekRecords.reduce((sum, r) => sum + r.wellbeing_level, 0) / weekRecords.length 
          : 0;
        const avgTeacher = weekEvals.length > 0 
          ? weekEvals.reduce((sum, e) => {
              const val = e.evaluation_level === "alto" ? 4.5 : e.evaluation_level === "medio" ? 3 : 1.5;
              return sum + val;
            }, 0) / weekEvals.length 
          : 0;

        monthData.push({
          name: `Sem ${4 - w}`,
          date: weekStart.toISOString().split("T")[0],
          estudiante: Math.round(avgStudent * 10) / 10,
          docente: Math.round(avgTeacher * 10) / 10,
          recordCount: weekRecords.length,
        });
      }

      setMonthlyTrend(monthData);

      // Calculate overall stats
      const totalRecords = wellbeingData?.length || 0;
      const allWellbeing = wellbeingData?.map(r => r.wellbeing_level) || [];
      const avgWellbeing = allWellbeing.length > 0 
        ? allWellbeing.reduce((a, b) => a + b, 0) / allWellbeing.length 
        : 0;

      const uniqueStudentsWithRecords = new Set(wellbeingData?.map(r => r.student_id) || []).size;
      const totalStudents = Object.keys(studentCourseMap).length;
      const participation = totalStudents > 0 
        ? Math.round((uniqueStudentsWithRecords / totalStudents) * 100) 
        : 0;

      const lowWellbeingCount = studentReports.filter(s => s.avgWellbeing > 0 && s.avgWellbeing <= 2).length;

      // Calculate average discrepancy
      const discrepancies = courseReports.filter(c => c.avgTeacherEval > 0).map(c => c.discrepancy);
      const avgDiscrepancy = discrepancies.length > 0 
        ? Math.round((discrepancies.reduce((a, b) => a + b, 0) / discrepancies.length) * 10) / 10 
        : 0;

      setStats({
        averageWellbeing: Math.round(avgWellbeing * 10) / 10,
        totalStudents,
        participation,
        averageDiscrepancy: avgDiscrepancy,
        totalRecords,
        activeAlerts: alertsData?.length || 0,
        lowWellbeingCount,
      });

    } catch (error) {
      console.error("Error fetching reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCourse, selectedStudent]);

  return {
    loading,
    wellbeingByCourse,
    emotionDistribution,
    weeklyTrend,
    monthlyTrend,
    courses,
    students,
    selectedCourseData,
    selectedStudentData,
    stats,
    refetch: fetchData,
  };
}
