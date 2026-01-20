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
      // Fetch profiles (students)
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .order("full_name");

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

        if (rawAlerts && profilesData) {
          alertsData = rawAlerts.map((alert) => {
            const student = profilesData.find((p) => p.id === alert.student_id);
            return {
              ...alert,
              student_name: student?.full_name || "Estudiante",
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
        const studentsWithoutFile = (profilesData?.length || 0) - (filesData?.length || 0);
        counts.abierta += studentsWithoutFile;
        
        setFileStatusCounts(counts);

        // Add file status to students
        if (profilesData) {
          const studentsWithStatus: StudentWithData[] = profilesData.map((p) => ({
            ...p,
            lastWellbeing: latestWellbeing[p.id],
            hasAlert: alertsData.some((a) => a.student_id === p.id && a.status !== "resuelta"),
            fileStatus: (fileStatusMap[p.id] as "abierta" | "restringida" | "confidencial") || "abierta",
          }));
          setStudents(studentsWithStatus);
        }
      } else if (profilesData) {
        // For teachers, just basic info
        const studentsBasic: StudentWithData[] = profilesData.map((p) => ({
          ...p,
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
        totalStudents: profilesData?.length || 0,
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
