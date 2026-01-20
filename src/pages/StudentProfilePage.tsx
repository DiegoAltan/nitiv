import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Heart, 
  AlertTriangle, 
  ClipboardCheck, 
  Calendar,
  TrendingUp,
  MessageSquare,
  Shield,
  Lock
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WellbeingTrendChart } from "@/components/charts/WellbeingTrendChart";
import { WellbeingScale } from "@/components/ui/WellbeingScale";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

interface StudentProfile {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
}

interface WellbeingRecord {
  id: string;
  wellbeing_level: number;
  emotions: string[] | null;
  comment: string | null;
  recorded_at: string;
  created_at: string;
}

interface TeacherEvaluation {
  id: string;
  evaluation_level: string;
  observations: string | null;
  evaluated_at: string;
  teacher: { full_name: string } | null;
}

interface Alert {
  id: string;
  alert_type: string;
  description: string;
  status: string;
  created_at: string;
}

export default function StudentProfilePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { isTeacher, isDupla } = useAuth();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [wellbeingRecords, setWellbeingRecords] = useState<WellbeingRecord[]>([]);
  const [evaluations, setEvaluations] = useState<TeacherEvaluation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileStatus, setFileStatus] = useState<string>("abierta");

  // Teachers have limited access - they can only see basic indicators, not comments or sensitive details
  const hasFullAccess = isDupla;

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    if (!studentId) return;

    setLoading(true);
    try {
      // Fetch student profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("id", studentId)
        .single();

      if (profileData) {
        setStudent(profileData);
      }

      // Fetch wellbeing records
      const { data: wellbeingData } = await supabase
        .from("wellbeing_records")
        .select("*")
        .eq("student_id", studentId)
        .order("recorded_at", { ascending: false })
        .limit(30);

      if (wellbeingData) {
        setWellbeingRecords(wellbeingData);
      }

      // Fetch teacher evaluations
      const { data: evalData } = await supabase
        .from("teacher_evaluations")
        .select(`
          id,
          evaluation_level,
          observations,
          evaluated_at,
          teacher_id
        `)
        .eq("student_id", studentId)
        .order("evaluated_at", { ascending: false })
        .limit(20);

      if (evalData) {
        // Map to include teacher name (would need join in production)
        setEvaluations(evalData.map(e => ({ ...e, teacher: null })));
      }

      // Fetch alerts - only for dupla
      if (isDupla) {
        const { data: alertsData } = await supabase
          .from("alerts")
          .select("*")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false });

        if (alertsData) {
          setAlerts(alertsData);
        }

        // Fetch file status
        const { data: fileData } = await supabase
          .from("student_files")
          .select("access_status")
          .eq("student_id", studentId)
          .maybeSingle();

        if (fileData) {
          setFileStatus(fileData.access_status);
        }
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEvaluationColor = (level: string) => {
    switch (level) {
      case "alto": return "bg-success text-success-foreground";
      case "medio": return "bg-warning text-warning-foreground";
      case "bajo": return "bg-alert text-alert-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getAlertType = (type: string): "low-wellbeing" | "sustained-low" | "discrepancy" => {
    switch (type) {
      case "bienestar_bajo": return "low-wellbeing";
      case "sostenido_bajo": return "sustained-low";
      case "discrepancia": return "discrepancy";
      default: return "low-wellbeing";
    }
  };

  const averageWellbeing = wellbeingRecords.length > 0
    ? (wellbeingRecords.reduce((acc, r) => acc + r.wellbeing_level, 0) / wellbeingRecords.length).toFixed(1)
    : "N/A";

  const activeAlerts = alerts.filter(a => a.status !== "resuelta").length;

  // Prepare chart data
  const chartData = wellbeingRecords.slice(0, 14).reverse().map(record => ({
    date: format(new Date(record.recorded_at), "dd MMM", { locale: es }),
    wellbeing: record.wellbeing_level,
  }));

  if (loading) {
    return (
      <AppLayout title="Perfil de Estudiante" subtitle="Cargando...">
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
          />
        </div>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout title="Estudiante no encontrado">
        <div className="text-center py-20">
          <p className="text-muted-foreground">No se encontró el estudiante solicitado.</p>
          <Button onClick={() => navigate("/students")} className="mt-4">
            Volver a la lista
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Perfil de Estudiante" subtitle={student.full_name}>
      <div className="space-y-6">
        {/* Back button and header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/students")}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {student.full_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">{student.full_name}</h2>
              {hasFullAccess && student.email && (
                <p className="text-muted-foreground">{student.email}</p>
              )}
              {hasFullAccess && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline"
                    className={
                      fileStatus === "confidencial" ? "border-alert text-alert" :
                      fileStatus === "restringida" ? "border-warning text-warning" :
                      "border-success text-success"
                    }
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Ficha {fileStatus}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageWellbeing}</p>
                <p className="text-sm text-muted-foreground">Bienestar promedio</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{wellbeingRecords.length}</p>
                <p className="text-sm text-muted-foreground">Registros totales</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/50 flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{evaluations.length}</p>
                <p className="text-sm text-muted-foreground">Evaluaciones</p>
              </div>
            </CardContent>
          </Card>
          {hasFullAccess && (
            <Card className={`card-elevated ${activeAlerts > 0 ? "border-l-4 border-l-alert" : ""}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-alert/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-alert" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeAlerts}</p>
                  <p className="text-sm text-muted-foreground">Alertas activas</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Teacher limited access notice */}
        {isTeacher && !isDupla && (
          <Card className="card-elevated border-warning/30 bg-warning/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Lock className="w-5 h-5 text-warning" />
              <p className="text-sm text-muted-foreground">
                Como docente, puedes ver indicadores generales de bienestar. Para acceder a comentarios 
                sensibles o fichas completas, contacta al equipo psicosocial.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="wellbeing" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="wellbeing" className="rounded-lg">
              <Heart className="w-4 h-4 mr-2" />
              Bienestar
            </TabsTrigger>
            <TabsTrigger value="evaluations" className="rounded-lg">
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Evaluaciones
            </TabsTrigger>
            {hasFullAccess && (
              <TabsTrigger value="alerts" className="rounded-lg">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Alertas
              </TabsTrigger>
            )}
          </TabsList>

          {/* Wellbeing Tab */}
          <TabsContent value="wellbeing" className="space-y-6">
            {/* Trend Chart */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg font-display">Evolución del Bienestar</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <WellbeingTrendChart 
                    weeklyData={chartData.map(d => ({ date: d.date, level: d.wellbeing }))} 
                  />
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No hay datos suficientes para mostrar el gráfico
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Records */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg font-display">Historial de Registros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wellbeingRecords.length > 0 ? (
                    wellbeingRecords.map((record, index) => (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <WellbeingScale value={record.wellbeing_level} readonly size="sm" />
                          <div>
                            <p className="font-medium">
                              {format(new Date(record.recorded_at), "EEEE, d 'de' MMMM", { locale: es })}
                            </p>
                            {record.emotions && record.emotions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1 max-w-full overflow-hidden">
                                {record.emotions.map((emotion) => (
                                  <Badge 
                                    key={emotion} 
                                    variant="secondary" 
                                    className="text-xs whitespace-nowrap shrink-0 max-w-[100px] truncate"
                                  >
                                    {emotion}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {/* Comments only visible to Dupla */}
                            {hasFullAccess && record.comment && (
                              <p className="text-sm text-muted-foreground mt-2 flex items-start gap-1">
                                <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                {record.comment}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(record.created_at), "HH:mm")}
                        </span>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No hay registros de bienestar
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evaluations Tab */}
          <TabsContent value="evaluations" className="space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg font-display">Evaluaciones Docentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {evaluations.length > 0 ? (
                    evaluations.map((evaluation, index) => (
                      <motion.div
                        key={evaluation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start justify-between p-4 rounded-xl bg-muted/30"
                      >
                        <div className="flex items-start gap-4">
                          <Badge className={getEvaluationColor(evaluation.evaluation_level)}>
                            {evaluation.evaluation_level.charAt(0).toUpperCase() + evaluation.evaluation_level.slice(1)}
                          </Badge>
                          <div>
                            <p className="font-medium">
                              {format(new Date(evaluation.evaluated_at), "d 'de' MMMM, yyyy", { locale: es })}
                            </p>
                            {evaluation.observations && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {evaluation.observations}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No hay evaluaciones registradas
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg font-display">Historial de Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.length > 0 ? (
                    alerts.map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border ${
                          alert.status === "resuelta" 
                            ? "bg-muted/30 border-border" 
                            : "bg-alert-light border-alert/30"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <AlertBadge type={getAlertType(alert.alert_type)} />
                          <Badge variant={alert.status === "resuelta" ? "secondary" : "destructive"}>
                            {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {format(new Date(alert.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-light flex items-center justify-center">
                        <span className="text-3xl">✨</span>
                      </div>
                      <p className="text-muted-foreground">No hay alertas registradas</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}