import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CourseStats {
  id: string;
  name: string;
  students: number;
  avgWellbeing: number;
  needsAttention: number;
}

interface TeacherStats {
  totalStudents: number;
  evaluationsToday: number;
  avgWellbeing: number;
  needsAttention: number;
  courses: CourseStats[];
}

export function useTeacherData() {
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    evaluationsToday: 0,
    avgWellbeing: 0,
    needsAttention: 0,
    courses: [],
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
        // Fetch teacher courses
        const { data: teacherCourses, error: tcError } = await supabase
          .from("teacher_courses")
          .select("course_id, courses(id, name)")
          .eq("teacher_id", profile.id);

        if (tcError) throw tcError;

        let effectiveCourses = teacherCourses || [];

        // If no teacher_courses found (e.g. role switcher or moderador),
        // fallback to all courses so the teacher UI is testable
        if (effectiveCourses.length === 0) {
          const { data: allCourses } = await supabase
            .from("courses")
            .select("id, name");
          if (allCourses && allCourses.length > 0) {
            effectiveCourses = allCourses.map((c: any) => ({
              course_id: c.id,
              courses: { id: c.id, name: c.name },
            }));
          }
        }

        if (effectiveCourses.length === 0) {
          setLoading(false);
          return;
        }

        const courseIds = effectiveCourses.map((tc: any) => tc.course_id);

        // Fetch students in these courses
        const { data: studentCourses, error: scError } = await supabase
          .from("student_courses")
          .select("student_id, course_id")
          .in("course_id", courseIds);

        if (scError) throw scError;

        const studentIds = [...new Set(studentCourses?.map((sc: any) => sc.student_id) || [])];

        // Fetch wellbeing records for these students
        let wellbeingData: any[] = [];
        if (studentIds.length > 0) {
          const { data, error: wError } = await supabase
            .from("wellbeing_records")
            .select("student_id, wellbeing_level, recorded_at")
            .in("student_id", studentIds)
            .gte("recorded_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

          if (!wError && data) {
            wellbeingData = data;
          }
        }

        // Fetch today's evaluations
        const today = new Date().toISOString().split("T")[0];
        const { data: evalData, error: evalError } = await supabase
          .from("teacher_evaluations")
          .select("id")
          .eq("teacher_id", profile.id)
          .eq("evaluated_at", today);

        // Calculate stats per course
        const courseStats: CourseStats[] = effectiveCourses.map((tc: any) => {
          const courseStudents = studentCourses?.filter(
            (sc: any) => sc.course_id === tc.course_id
          ) || [];
          
          const courseWellbeing = wellbeingData.filter((w: any) =>
            courseStudents.some((cs: any) => cs.student_id === w.student_id)
          );

          const avgWellbeing =
            courseWellbeing.length > 0
              ? courseWellbeing.reduce((sum: number, w: any) => sum + w.wellbeing_level, 0) /
                courseWellbeing.length
              : 0;

          const needsAttention = courseWellbeing.filter(
            (w: any) => w.wellbeing_level <= 2
          ).length;

          return {
            id: tc.course_id,
            name: tc.courses?.name || "Curso",
            students: courseStudents.length,
            avgWellbeing: Math.round(avgWellbeing * 10) / 10,
            needsAttention,
          };
        });

        const totalAvgWellbeing =
          courseStats.length > 0
            ? courseStats.reduce((sum, c) => sum + c.avgWellbeing, 0) / courseStats.length
            : 0;

        setStats({
          totalStudents: studentIds.length,
          evaluationsToday: evalData?.length || 0,
          avgWellbeing: Math.round(totalAvgWellbeing * 10) / 10,
          needsAttention: courseStats.reduce((sum, c) => sum + c.needsAttention, 0),
          courses: courseStats,
        });
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.id]);

  return { stats, loading };
}
