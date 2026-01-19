import { AppLayout } from "@/components/layout/AppLayout";
import { WellbeingForm } from "@/components/forms/WellbeingForm";

const StudentWellbeing = () => {
  return (
    <AppLayout title="Mi Bienestar" subtitle="Registro de bienestar personal">
      <div className="max-w-2xl mx-auto py-8">
        <WellbeingForm />
      </div>
    </AppLayout>
  );
};

export default StudentWellbeing;
