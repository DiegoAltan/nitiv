import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FileText, 
  Search, 
  Filter, 
  AlertTriangle, 
  Users,
  TrendingUp,
  PieChart,
  X,
  Eye,
  Shield,
  Plus
} from "lucide-react";
import { CreateRecordDialog } from "@/components/fichas/CreateRecordDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface FichaListItem {
  studentId: string;
  studentName: string;
  courseName: string | null;
  fileStatus: string;
  severityLevel: string | null;
  activeAlerts: number;
  lastUpdate: string | null;
  recordCount: number;
  tags: string[];
}

interface AggregatedStats {
  totalFichas: number;
  bySeverity: Record<string, number>;
  withAlerts: number;
}

const severityConfig: Record<string, { label: string; color: string }> = {
  leve: { label: "Leve", color: "bg-success/10 text-success border-success/30" },
  moderada: { label: "Moderada", color: "bg-warning/10 text-warning border-warning/30" },
  alta: { label: "Alta", color: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400" },
  critica: { label: "Crítica", color: "bg-alert/10 text-alert border-alert/30" },
};

const fileStatusConfig: Record<string, { label: string; color: string }> = {
  abierta: { label: "Abierta", color: "border-success text-success" },
  restringida: { label: "Restringida", color: "border-warning text-warning" },
  confidencial: { label: "Confidencial", color: "border-alert text-alert" },
};

export default function FichasPage() {
  const navigate = useNavigate();
  const { isDupla, isAdmin, isTeacher, profile } = useAuth();
  const [fichas, setFichas] = useState<FichaListItem[]>([]);
  const [stats, setStats] = useState<AggregatedStats>({ totalFichas: 0, bySeverity: {}, withAlerts: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Teachers only see students they have shared access to
  const canViewFullFichas = isDupla;
  const canViewStats = isAdmin;
  const canViewList = isDupla || isTeacher;

  useEffect(() => {
    fetchFichas();
  }, [isDupla, isAdmin, isTeacher, profile]);

  const fetchFichas = async () => {
    setLoading(true);
    try {
      // For dupla: fetch all students with case records
      if (isDupla) {
        // Get all students who have case records
        const { data: recordsData } = await supabase
          .from("student_case_records")
          .select("student_id, severity_level, tags, updated_at")
          .order("updated_at", { ascending: false });

        // Get unique students
        const studentIds = [...new Set(recordsData?.map(r => r.student_id) || [])];

        // Fetch student profiles
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", studentIds);

        // Fetch student files for status
        const { data: filesData } = await supabase
          .from("student_files")
          .select("student_id, access_status")
          .in("student_id", studentIds);

        // Fetch active alerts count per student
        const { data: alertsData } = await supabase
          .from("alerts")
          .select("student_id")
          .in("student_id", studentIds)
          .neq("status", "resuelta");

        // Build fichas list
        const fichasList: FichaListItem[] = studentIds.map(studentId => {
          const studentRecords = recordsData?.filter(r => r.student_id === studentId) || [];
          const profile = profilesData?.find(p => p.id === studentId);
          const file = filesData?.find(f => f.student_id === studentId);
          const alertCount = alertsData?.filter(a => a.student_id === studentId).length || 0;
          
          // Get highest severity from records
          const severities = studentRecords.map(r => r.severity_level).filter(Boolean);
          const highestSeverity = getHighestSeverity(severities as string[]);
          
          // Collect all unique tags
          const allTags = [...new Set(studentRecords.flatMap(r => r.tags || []))];
          
          // Get most recent update
          const lastUpdate = studentRecords[0]?.updated_at || null;

          return {
            studentId,
            studentName: profile?.full_name || "Desconocido",
            courseName: null, // Would need course join
            fileStatus: file?.access_status || "abierta",
            severityLevel: highestSeverity,
            activeAlerts: alertCount,
            lastUpdate,
            recordCount: studentRecords.length,
            tags: allTags,
          };
        });

        setFichas(fichasList);

        // Calculate aggregated stats
        const bySeverity: Record<string, number> = {};
        fichasList.forEach(f => {
          if (f.severityLevel) {
            bySeverity[f.severityLevel] = (bySeverity[f.severityLevel] || 0) + 1;
          }
        });

        setStats({
          totalFichas: fichasList.length,
          bySeverity,
          withAlerts: fichasList.filter(f => f.activeAlerts > 0).length,
        });
      } else if (isTeacher && profile?.id) {
        // Teachers: only students with shared access
        const { data: accessData } = await supabase
          .from("shared_case_access")
          .select("student_id")
          .eq("granted_to", profile.id)
          .eq("access_type", "full");

        if (accessData && accessData.length > 0) {
          const studentIds = accessData.map(a => a.student_id);

          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", studentIds);

          const { data: recordsData } = await supabase
            .from("student_case_records")
            .select("student_id, severity_level, tags, updated_at")
            .in("student_id", studentIds);

          const fichasList: FichaListItem[] = studentIds.map(studentId => {
            const studentRecords = recordsData?.filter(r => r.student_id === studentId) || [];
            const profile = profilesData?.find(p => p.id === studentId);
            const severities = studentRecords.map(r => r.severity_level).filter(Boolean);
            const highestSeverity = getHighestSeverity(severities as string[]);
            const allTags = [...new Set(studentRecords.flatMap(r => r.tags || []))];
            const lastUpdate = studentRecords[0]?.updated_at || null;

            return {
              studentId,
              studentName: profile?.full_name || "Desconocido",
              courseName: null,
              fileStatus: "abierta",
              severityLevel: highestSeverity,
              activeAlerts: 0,
              lastUpdate,
              recordCount: studentRecords.length,
              tags: allTags,
            };
          });

          setFichas(fichasList);
        }
      } else if (isAdmin) {
        // Admin: only aggregated stats
        const { data: recordsData } = await supabase
          .from("student_case_records")
          .select("student_id, severity_level");

        const studentIds = [...new Set(recordsData?.map(r => r.student_id) || [])];

        const { data: alertsData } = await supabase
          .from("alerts")
          .select("student_id")
          .neq("status", "resuelta");

        const bySeverity: Record<string, number> = {};
        const studentSeverities: Record<string, string[]> = {};
        
        recordsData?.forEach(r => {
          if (r.severity_level) {
            if (!studentSeverities[r.student_id]) {
              studentSeverities[r.student_id] = [];
            }
            studentSeverities[r.student_id].push(r.severity_level);
          }
        });

        Object.values(studentSeverities).forEach(severities => {
          const highest = getHighestSeverity(severities);
          if (highest) {
            bySeverity[highest] = (bySeverity[highest] || 0) + 1;
          }
        });

        const studentsWithAlerts = new Set(alertsData?.map(a => a.student_id) || []);
        const withAlerts = [...studentsWithAlerts].filter(id => studentIds.includes(id)).length;

        setStats({
          totalFichas: studentIds.length,
          bySeverity,
          withAlerts,
        });
      }
    } catch (error) {
      console.error("Error fetching fichas:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHighestSeverity = (severities: string[]): string | null => {
    const order = ["critica", "alta", "moderada", "leve"];
    for (const level of order) {
      if (severities.includes(level)) return level;
    }
    return null;
  };

  // Filter fichas
  const filteredFichas = fichas.filter(ficha => {
    if (searchTerm && !ficha.studentName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (severityFilter !== "all" && ficha.severityLevel !== severityFilter) {
      return false;
    }
    if (statusFilter !== "all" && ficha.fileStatus !== statusFilter) {
      return false;
    }
    return true;
  });

  const hasActiveFilters = searchTerm || severityFilter !== "all" || statusFilter !== "all";

  if (loading) {
    return (
      <AppLayout title="Fichas / Registros" subtitle="Cargando...">
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

  return (
    <AppLayout 
      title="Fichas / Registros" 
      subtitle={isDupla ? "Gestión integral de casos" : isAdmin ? "Estadísticas agregadas" : "Fichas autorizadas"}
    >
      <div className="space-y-6">
        {/* Stats Cards - Admin sees all stats, Dupla sees summary */}
        {(canViewStats || isDupla) && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-elevated">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalFichas}</p>
                  <p className="text-sm text-muted-foreground">Fichas activas</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-elevated">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-alert/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-alert" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.withAlerts}</p>
                  <p className="text-sm text-muted-foreground">Con alertas</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-elevated">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.bySeverity["alta"] || 0}</p>
                  <p className="text-sm text-muted-foreground">Gravedad alta</p>
                </div>
              </CardContent>
            </Card>
            <Card className="card-elevated">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.bySeverity["leve"] || 0}</p>
                  <p className="text-sm text-muted-foreground">Gravedad leve</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin: only sees stats, no list */}
        {isAdmin && !isDupla && (
          <Card className="card-elevated">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Acceso limitado a estadísticas</h3>
              <p className="text-muted-foreground">
                Como administrador, puedes ver las estadísticas agregadas del sistema.
                Para acceder a fichas individuales, contacta al equipo psicosocial.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Fichas list - Dupla and authorized teachers */}
        {canViewList && (
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {isDupla ? "Listado de Fichas" : "Fichas Autorizadas"}
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                {isDupla && (
                  <Button onClick={() => setShowCreateDialog(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Registro
                  </Button>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar estudiante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button
                  variant={showFilters ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 px-1.5">!</Badge>
                  )}
                </Button>
              </div>
            </CardHeader>

            {/* Filters */}
            {showFilters && (
              <div className="px-6 pb-4">
                <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex-1 min-w-[180px]">
                    <label className="text-sm font-medium mb-2 block">Gravedad</label>
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {Object.entries(severityConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {isDupla && (
                    <div className="flex-1 min-w-[180px]">
                      <label className="text-sm font-medium mb-2 block">Estado de ficha</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {Object.entries(fileStatusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {hasActiveFilters && (
                    <div className="flex items-end">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSearchTerm("");
                        setSeverityFilter("all");
                        setStatusFilter("all");
                      }}>
                        <X className="w-4 h-4 mr-1" />
                        Limpiar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <CardContent>
              {filteredFichas.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  {hasActiveFilters ? (
                    <p>No hay fichas que coincidan con los filtros</p>
                  ) : isTeacher ? (
                    <p>No tienes acceso autorizado a ninguna ficha</p>
                  ) : (
                    <p>No hay fichas registradas</p>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estudiante</TableHead>
                        <TableHead>Gravedad</TableHead>
                        {isDupla && <TableHead>Estado</TableHead>}
                        <TableHead>Alertas</TableHead>
                        <TableHead>Registros</TableHead>
                        <TableHead>Última actualización</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFichas.map((ficha, index) => (
                        <motion.tr
                          key={ficha.studentId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="group hover:bg-muted/30"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center text-white text-sm font-bold">
                                {ficha.studentName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                              </div>
                              <div>
                                <p className="font-medium">{ficha.studentName}</p>
                                {ficha.tags.length > 0 && (
                                  <div className="flex gap-1 mt-0.5">
                                    {ficha.tags.slice(0, 2).map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {ficha.tags.length > 2 && (
                                      <span className="text-xs text-muted-foreground">+{ficha.tags.length - 2}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {ficha.severityLevel ? (
                              <Badge variant="outline" className={severityConfig[ficha.severityLevel]?.color}>
                                {severityConfig[ficha.severityLevel]?.label}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          {isDupla && (
                            <TableCell>
                              <Badge variant="outline" className={fileStatusConfig[ficha.fileStatus]?.color}>
                                <Shield className="w-3 h-3 mr-1" />
                                {fileStatusConfig[ficha.fileStatus]?.label}
                              </Badge>
                            </TableCell>
                          )}
                          <TableCell>
                            {ficha.activeAlerts > 0 ? (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {ficha.activeAlerts}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">0</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{ficha.recordCount}</span>
                          </TableCell>
                          <TableCell>
                            {ficha.lastUpdate ? (
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(ficha.lastUpdate), "d MMM yyyy", { locale: es })}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/students/${ficha.studentId}`)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver ficha
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Record Dialog */}
        <CreateRecordDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog}
          onSuccess={fetchFichas}
        />
      </div>
    </AppLayout>
  );
}