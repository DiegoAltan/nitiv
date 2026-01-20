import { StudentLayout } from "@/components/layout/StudentLayout";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { StudentDashboard } from "@/components/dashboards/StudentDashboard";
import { TeacherDashboard } from "@/components/dashboards/TeacherDashboard";
import { DuplaDashboard } from "@/components/dashboards/DuplaDashboard";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";

const Dashboard = () => {
  const { isStudent, isTeacher, isDupla, isAdmin } = useAuth();

  // Student has a special layout without sidebar
  if (isStudent && !isTeacher && !isDupla && !isAdmin) {
    return (
      <StudentLayout title="Mi Bienestar" subtitle="Tu espacio personal de bienestar">
        <StudentDashboard />
      </StudentLayout>
    );
  }

  // Determine which dashboard to show based on role priority
  // Priority: Admin > Dupla > Teacher > Student
  const getDashboardConfig = () => {
    if (isAdmin) {
      return {
        component: <AdminDashboard />,
        title: "Panel Administrativo",
        subtitle: "Estadísticas institucionales y gestión",
      };
    }
    if (isDupla) {
      return {
        component: <DuplaDashboard />,
        title: "Panel Psicosocial",
        subtitle: "Gestión de alertas, fichas y seguimiento",
      };
    }
    if (isTeacher) {
      return {
        component: <TeacherDashboard />,
        title: "Panel Docente",
        subtitle: "Resumen de bienestar de mis cursos",
      };
    }
    // Default: Student dashboard
    return {
      component: <StudentDashboard />,
      title: "Mi Bienestar",
      subtitle: "Tu espacio personal de bienestar",
    };
  };

  const dashboardConfig = getDashboardConfig();

  return (
    <AppLayout title={dashboardConfig.title} subtitle={dashboardConfig.subtitle}>
      {dashboardConfig.component}
    </AppLayout>
  );
};

export default Dashboard;
