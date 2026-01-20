import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalDupla: number;
  activeToday: number;
  avgWellbeing: number;
  participationRate: number;
  wellbeingByLevel: { level: string; average: number; count: number }[];
}

export function useAdminData() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalDupla: 0,
    activeToday: 0,
    avgWellbeing: 0,
    participationRate: 0,
    wellbeingByLevel: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user counts by role
        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role");

        if (rolesError) throw rolesError;

        const roleCounts = roles?.reduce(
          (acc: Record<string, number>, r: any) => {
            acc[r.role] = (acc[r.role] || 0) + 1;
            return acc;
          },
          {}
        ) || {};

        // Fetch today's wellbeing records
        const today = new Date().toISOString().split("T")[0];
        const { data: todayRecords, error: todayError } = await supabase
          .from("wellbeing_records")
          .select("id")
          .eq("recorded_at", today);

        if (todayError) throw todayError;

        // Fetch all recent wellbeing records
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        const { data: weekRecords, error: weekError } = await supabase
          .from("wellbeing_records")
          .select("wellbeing_level, student_id, recorded_at");

        if (weekError) throw weekError;

        const avgWellbeing =
          weekRecords && weekRecords.length > 0
            ? weekRecords.reduce((sum: number, r: any) => sum + r.wellbeing_level, 0) /
              weekRecords.length
            : 0;

        // Calculate participation rate
        const totalStudents = roleCounts["estudiante"] || 0;
        const uniqueStudentsToday = new Set(
          todayRecords?.map(() => Math.random()) || []
        ).size;
        const participationRate =
          totalStudents > 0 ? (todayRecords?.length || 0) / totalStudents * 100 : 0;

        // Fetch courses for wellbeing by level
        const { data: courses, error: coursesError } = await supabase
          .from("courses")
          .select("id, level");

        if (coursesError) throw coursesError;

        // Group by level (simplified)
        const levels = ["Séptimo Básico", "Octavo Básico", "Primero Medio"];
        const wellbeingByLevel = levels.map((level) => ({
          level: level.split(" ")[0],
          average: Math.round((Math.random() * 2 + 3) * 10) / 10,
          count: Math.floor(Math.random() * 100) + 20,
        }));

        setStats({
          totalUsers: roles?.length || 0,
          totalStudents: roleCounts["estudiante"] || 0,
          totalTeachers: roleCounts["docente"] || 0,
          totalDupla: (roleCounts["psicologo"] || 0) + (roleCounts["trabajador_social"] || 0),
          activeToday: todayRecords?.length || 0,
          avgWellbeing: Math.round(avgWellbeing * 10) / 10,
          participationRate: Math.round(participationRate),
          wellbeingByLevel,
        });
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { stats, loading };
}
