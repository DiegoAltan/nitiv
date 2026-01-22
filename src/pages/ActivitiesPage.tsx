import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar, History, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { CreateActivityDialog } from "@/components/activities/CreateActivityDialog";
import { useActivities } from "@/hooks/useActivities";
import { Skeleton } from "@/components/ui/skeleton";

const ActivitiesPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const {
    upcomingActivities,
    pastActivities,
    isLoading,
    createActivity,
    updateActivity,
    deleteActivity,
    rateActivity,
    canEdit,
    canRate,
  } = useActivities();

  const handleRate = (activityId: string, rating: number) => {
    rateActivity.mutate({ activityId, rating });
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta actividad?")) {
      deleteActivity.mutate(id);
    }
  };

  return (
    <AppLayout
      title="Actividades de Convivencia"
      subtitle="Talleres, charlas y actividades realizadas"
    >
      <div className="space-y-6">
        {/* Header with action */}
        {canEdit && (
          <div className="flex justify-end">
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Actividad
            </Button>
          </div>
        )}

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upcoming" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Próximas ({upcomingActivities.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              <History className="w-4 h-4" />
              Realizadas ({pastActivities.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : upcomingActivities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="font-medium text-muted-foreground">
                  No hay actividades programadas
                </h3>
                {canEdit && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Crea una nueva actividad para comenzar
                  </p>
                )}
              </motion.div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    canEdit={canEdit}
                    canRate={canRate}
                    onDelete={handleDelete}
                    onRate={handleRate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : pastActivities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <History className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="font-medium text-muted-foreground">
                  Aún no hay actividades realizadas
                </h3>
              </motion.div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    canEdit={canEdit}
                    canRate={canRate}
                    onDelete={handleDelete}
                    onRate={handleRate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateActivityDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={(data) => {
          createActivity.mutate(data);
          setCreateDialogOpen(false);
        }}
        isLoading={createActivity.isPending}
      />
    </AppLayout>
  );
};

export default ActivitiesPage;
