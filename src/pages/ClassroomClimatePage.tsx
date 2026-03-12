import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ClimateQuickForm } from "@/components/climate/ClimateQuickForm";
import { ClimateStats } from "@/components/climate/ClimateStats";

const ClassroomClimatePage = () => {
  const { isTeacher } = useAuth();

  return (
    <AppLayout
      title="Clima de Aula"
      subtitle="Registro y estadísticas del clima escolar"
    >
      <div className="space-y-6">
        {/* Quick form - only for teachers */}
        {isTeacher && <ClimateQuickForm />}

        {/* Stats - visible for all non-student roles */}
        <ClimateStats />
      </div>
    </AppLayout>
  );
};

export default ClassroomClimatePage;
