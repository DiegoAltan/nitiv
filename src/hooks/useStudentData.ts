import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface StudentWithData {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  course?: string;
  lastWellbeing?: number;
  hasAlert?: boolean;
  fileStatus?: "abierta" | "restringida" | "confidencial";
}

export interface Alert {
  id: string;
  student_id: string;
  student_name: string;
  alert_type: string;
  description: string;
  status: string;
  created_at: string;
  course?: string;
}

export interface FileStatusCounts {
  abierta: number;
  restringida: number;
  confidencial: number;
}

export function useStudentData() {
  const { profile, isDupla, isTeacher, isAdmin } = useAuth();
  const [students, setStudents] = useState<StudentWithData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [fileStatusCounts, setFileStatusCounts] = useState<FileStatusCounts>({
    abierta: 0,
    restringida: 0,
    confidencial: 0,
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeAlerts: 0,
    averageWellbeing: 0,
    todayParticipation: 0,
  });

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);

    try {
      // First, get all user IDs that have a role (non-students)
      const { data: usersWithRoles } = await supabase
        .from("user_roles")
        .select("user_id");
      
      const nonStudentIds = new Set(usersWithRoles?.map(u => u.user_id) || []);

      // Fetch student courses to get course names and identify students
      const { data: studentCoursesData } = await supabase
        .from("student_courses")
        .select(`
          student_id,
          courses (
            id,
            name,
            level
          )
        `);

      // Map student to course and identify students
      const studentCourseMap: Record<string, string> = {};
      const studentIds = new Set<string>();
      studentCoursesData?.forEach((sc: any) => {
        if (sc.courses) {
          studentCourseMap[sc.student_id] = sc.courses.name;
          studentIds.add(sc.student_id);
        }
      });

      // Fetch profiles for students only (those in student_courses or without roles)
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .order("full_name");

      // Filter to only include students (either in student_courses or without roles)
      const studentProfiles = profilesData?.filter(p => 
        studentIds.has(p.id) || !nonStudentIds.has(p.id)
      ) || [];

      // Fetch wellbeing records for latest wellbeing
      const { data: wellbeingData } = await supabase
        .from("wellbeing_records")
        .select("student_id, wellbeing_level, recorded_at")
        .order("recorded_at", { ascending: false });

      // Map latest wellbeing per student
      const latestWellbeing: Record<string, number> = {};
      wellbeingData?.forEach((record) => {
        if (!latestWellbeing[record.student_id]) {
          latestWellbeing[record.student_id] = record.wellbeing_level;
        }
      });

      // Fetch alerts if dupla or admin
      let alertsData: Alert[] = [];
      if (isDupla || isAdmin) {
        const { data: rawAlerts } = await supabase
          .from("alerts")
          .select("*")
          .order("created_at", { ascending: false });

        if (rawAlerts && studentProfiles) {
          alertsData = rawAlerts.map((alert) => {
            const student = studentProfiles.find((p) => p.id === alert.student_id);
            return {
              ...alert,
              student_name: student?.full_name || "Estudiante",
              course: studentCourseMap[alert.student_id] || undefined,
            };
          });
        }
        setAlerts(alertsData);
      }

      // Fetch student file statuses if dupla
      if (isDupla) {
        const { data: filesData } = await supabase
          .from("student_files")
          .select("student_id, access_status");

        const fileStatusMap: Record<string, string> = {};
        const counts: FileStatusCounts = { abierta: 0, restringida: 0, confidencial: 0 };
        
        filesData?.forEach((file) => {
          fileStatusMap[file.student_id] = file.access_status;
          if (file.access_status in counts) {
            counts[file.access_status as keyof FileStatusCounts]++;
          }
        });

        // Count students without explicit file status as "abierta"
        const studentsWithoutFile = studentProfiles.length - (filesData?.length || 0);
        counts.abierta += studentsWithoutFile;
        
        setFileStatusCounts(counts);

        // Add file status and course to students
        const studentsWithStatus: StudentWithData[] = studentProfiles.map((p) => ({
          ...p,
          course: studentCourseMap[p.id],
          lastWellbeing: latestWellbeing[p.id],
          hasAlert: alertsData.some((a) => a.student_id === p.id && a.status !== "resuelta"),
          fileStatus: (fileStatusMap[p.id] as "abierta" | "restringida" | "confidencial") || "abierta",
        }));
        setStudents(studentsWithStatus);
      } else {
        // For teachers, just basic info with course
        const studentsBasic: StudentWithData[] = studentProfiles.map((p) => ({
          ...p,
          course: studentCourseMap[p.id],
          lastWellbeing: latestWellbeing[p.id],
          hasAlert: false,
        }));
        setStudents(studentsBasic);
      }

      // Calculate stats
      const activeAlertsCount = alertsData.filter((a) => a.status !== "resuelta").length;
      const allWellbeing = Object.values(latestWellbeing);
      const avgWellbeing = allWellbeing.length > 0
        ? allWellbeing.reduce((a, b) => a + b, 0) / allWellbeing.length
        : 0;

      // Today's participation
      const today = new Date().toISOString().split("T")[0];
      const todayRecords = wellbeingData?.filter(
        (r) => r.recorded_at === today
      ) || [];
      const uniqueStudentsToday = new Set(todayRecords.map((r) => r.student_id)).size;

      setStats({
        totalStudents: studentProfiles.length,
        activeAlerts: activeAlertsCount,
        averageWellbeing: Math.round(avgWellbeing * 10) / 10,
        todayParticipation: uniqueStudentsToday,
      });

    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile, isDupla, isTeacher, isAdmin]);

  return {
    students,
    alerts,
    fileStatusCounts,
    stats,
    loading,
    refetch: fetchData,
  };
}
