import { motion } from "framer-motion";
import { AlertTriangle, Clock, User, ArrowRight, Eye } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const alerts = [
  {
    id: 1,
    student: "Estudiante A",
    course: "8°A",
    type: "sustained-low" as const,
    description: "Bienestar bajo sostenido durante las últimas 3 semanas",
    date: "15 ene 2025",
    isNew: true,
  },
  {
    id: 2,
    student: "Estudiante B",
    course: "7°B",
    type: "discrepancy" as const,
    description: "Alta discrepancia entre autoevaluación (4) y evaluación docente (bajo)",
    date: "14 ene 2025",
    isNew: true,
  },
  {
    id: 3,
    student: "Estudiante C",
    course: "6°A",
    type: "low-wellbeing" as const,
    description: "Registro de bienestar nivel 1 con emociones de tristeza y ansiedad",
    date: "14 ene 2025",
    isNew: false,
  },
  {
    id: 4,
    student: "Estudiante D",
    course: "8°B",
    type: "sustained-low" as const,
    description: "Bienestar bajo sostenido durante las últimas 2 semanas",
    date: "13 ene 2025",
    isNew: false,
  },
];

const AlertsPage = () => {
  const newAlerts = alerts.filter((a) => a.isNew);
  const previousAlerts = alerts.filter((a) => !a.isNew);

  return (
    <AppLayout title="Alertas" subtitle="Situaciones que requieren atención">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-elevated border-alert/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-alert/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-alert" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alerts.length}</p>
                <p className="text-sm text-muted-foreground">Alertas activas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{newAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Nuevas hoy</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(alerts.map((a) => a.student)).size}
                </p>
                <p className="text-sm text-muted-foreground">Estudiantes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Alerts */}
        {newAlerts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-display font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-alert rounded-full animate-pulse" />
              Nuevas alertas
            </h2>
            <div className="space-y-3">
              {newAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-elevated border-l-4 border-l-alert hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{alert.student}</h3>
                            <Badge variant="outline">{alert.course}</Badge>
                            <Badge className="bg-alert text-alert-foreground">Nueva</Badge>
                          </div>
                          <AlertBadge type={alert.type} className="mb-2" />
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">{alert.date}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver perfil
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Previous Alerts */}
        {previousAlerts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-display font-semibold text-muted-foreground">
              Alertas anteriores
            </h2>
            <div className="space-y-3">
              {previousAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-elevated hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{alert.student}</h3>
                            <Badge variant="outline">{alert.course}</Badge>
                          </div>
                          <AlertBadge type={alert.type} className="mb-2" />
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">{alert.date}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {alerts.length === 0 && (
          <Card className="card-elevated">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-light flex items-center justify-center">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Sin alertas activas</h3>
              <p className="text-muted-foreground">
                No hay situaciones que requieran atención en este momento.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default AlertsPage;
