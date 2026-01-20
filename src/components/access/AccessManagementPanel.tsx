import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Search,
  Filter,
  Trash2,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TeacherAccess {
  id: string;
  teacher_id: string;
  teacher_name: string;
  student_id: string;
  student_name: string;
  student_course: string;
  access_level: string;
  granted_at: string;
  granted_by_name: string;
  expires_at: string | null;
}

interface OrientadorAccess {
  id: string;
  orientador_id: string;
  orientador_name: string;
  student_id: string;
  student_name: string;
  student_course: string;
  access_type: string;
  granted_at: string;
  granted_by_name: string;
  expires_at: string | null;
}

export function AccessManagementPanel() {
  const [teacherAccess, setTeacherAccess] = useState<TeacherAccess[]>([]);
  const [orientadorAccess, setOrientadorAccess] = useState<OrientadorAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<string>("todos");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "teacher" | "orientador"; id: string } | null>(null);

  useEffect(() => {
    fetchAccessData();
  }, []);

  const fetchAccessData = async () => {
    setLoading(true);
    try {
      // Fetch teacher access
      const { data: teacherAccessData } = await supabase
        .from("teacher_student_access")
        .select("*")
        .order("granted_at", { ascending: false });

      // Fetch orientador (shared case) access
      const { data: sharedAccessData } = await supabase
        .from("shared_case_access")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch profiles for names
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name");

      // Fetch student courses
      const { data: studentCourses } = await supabase
        .from("student_courses")
        .select("student_id, courses(name)");

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      const courseMap = new Map(studentCourses?.map((sc: any) => [sc.student_id, sc.courses?.name || ""]) || []);

      // Map teacher access with names
      const mappedTeacherAccess: TeacherAccess[] = (teacherAccessData || []).map(ta => ({
        id: ta.id,
        teacher_id: ta.teacher_id,
        teacher_name: profileMap.get(ta.teacher_id) || "Docente",
        student_id: ta.student_id,
        student_name: profileMap.get(ta.student_id) || "Estudiante",
        student_course: courseMap.get(ta.student_id) || "",
        access_level: ta.access_level,
        granted_at: ta.granted_at,
        granted_by_name: profileMap.get(ta.granted_by) || "Desconocido",
        expires_at: ta.expires_at,
      }));

      // Map orientador access with names
      const mappedOrientadorAccess: OrientadorAccess[] = (sharedAccessData || []).map(sa => ({
        id: sa.id,
        orientador_id: sa.granted_to,
        orientador_name: profileMap.get(sa.granted_to) || "Orientador",
        student_id: sa.student_id,
        student_name: profileMap.get(sa.student_id) || "Estudiante",
        student_course: courseMap.get(sa.student_id) || "",
        access_type: sa.access_type,
        granted_at: sa.created_at,
        granted_by_name: profileMap.get(sa.granted_by) || "Desconocido",
        expires_at: sa.expires_at,
      }));

      setTeacherAccess(mappedTeacherAccess);
      setOrientadorAccess(mappedOrientadorAccess);
    } catch (error) {
      console.error("Error fetching access data:", error);
      toast.error("Error al cargar datos de acceso");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeTeacherAccess = async (id: string) => {
    try {
      const { error } = await supabase
        .from("teacher_student_access")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Acceso revocado correctamente");
      setTeacherAccess(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error("Error revoking access:", error);
      toast.error("Error al revocar acceso");
    }
    setDeleteConfirm(null);
  };

  const handleRevokeOrientadorAccess = async (id: string) => {
    try {
      const { error } = await supabase
        .from("shared_case_access")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Acceso revocado correctamente");
      setOrientadorAccess(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error("Error revoking access:", error);
      toast.error("Error al revocar acceso");
    }
    setDeleteConfirm(null);
  };

  const filterAccess = <T extends { teacher_name?: string; orientador_name?: string; student_name: string; student_course: string }>(
    items: T[]
  ): T[] => {
    return items.filter(item => {
      const name = 'teacher_name' in item ? item.teacher_name : item.orientador_name;
      const matchesSearch = 
        name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterBy === "todos" || item.student_course === filterBy;
      
      return matchesSearch && matchesFilter;
    });
  };

  const filteredTeacherAccess = filterAccess(teacherAccess);
  const filteredOrientadorAccess = filterAccess(orientadorAccess);

  const uniqueCourses = [...new Set([
    ...teacherAccess.map(a => a.student_course),
    ...orientadorAccess.map(a => a.student_course),
  ])].filter(Boolean);

  if (loading) {
    return (
      <Card className="card-elevated">
        <CardContent className="py-12 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-elevated">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-role-docente/10 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-role-docente" />
            </div>
            <div>
              <p className="text-2xl font-bold">{teacherAccess.length}</p>
              <p className="text-sm text-muted-foreground">Accesos a Docentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-role-orientador/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-role-orientador" />
            </div>
            <div>
              <p className="text-2xl font-bold">{orientadorAccess.length}</p>
              <p className="text-sm text-muted-foreground">Accesos a Orientadores</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{teacherAccess.length + orientadorAccess.length}</p>
              <p className="text-sm text-muted-foreground">Total permisos activos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los cursos</SelectItem>
            {uniqueCourses.map((course) => (
              <SelectItem key={course} value={course}>
                {course}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="docentes" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="docentes" className="rounded-lg">
            <UserCheck className="w-4 h-4 mr-2" />
            Docentes ({filteredTeacherAccess.length})
          </TabsTrigger>
          <TabsTrigger value="orientadores" className="rounded-lg">
            <Users className="w-4 h-4 mr-2" />
            Orientadores ({filteredOrientadorAccess.length})
          </TabsTrigger>
        </TabsList>

        {/* Teacher Access Tab */}
        <TabsContent value="docentes">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg font-display">Accesos Extendidos a Docentes</CardTitle>
              <CardDescription>
                Docentes con permisos para ver información sensible de estudiantes específicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTeacherAccess.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserX className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay accesos extendidos a docentes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTeacherAccess.map((access, index) => (
                    <motion.div
                      key={access.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-role-docente/20 flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-role-docente" />
                        </div>
                        <div>
                          <p className="font-medium">{access.teacher_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Acceso a: <span className="font-medium">{access.student_name}</span>
                            {access.student_course && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {access.student_course}
                              </Badge>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            Otorgado por {access.granted_by_name} el {format(new Date(access.granted_at), "d MMM yyyy", { locale: es })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-success/10 text-success border-success/20">
                          {access.access_level === "extended" ? "Extendido" : access.access_level}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-alert hover:text-alert hover:bg-alert/10"
                          onClick={() => setDeleteConfirm({ type: "teacher", id: access.id })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orientador Access Tab */}
        <TabsContent value="orientadores">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg font-display">Accesos a Orientadores</CardTitle>
              <CardDescription>
                Orientadores con permisos para ver fichas de estudiantes específicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOrientadorAccess.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserX className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay accesos otorgados a orientadores</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrientadorAccess.map((access, index) => (
                    <motion.div
                      key={access.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-role-orientador/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-role-orientador" />
                        </div>
                        <div>
                          <p className="font-medium">{access.orientador_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Acceso a: <span className="font-medium">{access.student_name}</span>
                            {access.student_course && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {access.student_course}
                              </Badge>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            Otorgado por {access.granted_by_name} el {format(new Date(access.granted_at), "d MMM yyyy", { locale: es })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-role-orientador/10 text-role-orientador border-role-orientador/20">
                          <Eye className="w-3 h-3 mr-1" />
                          {access.access_type === "view" ? "Lectura" : access.access_type}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-alert hover:text-alert hover:bg-alert/10"
                          onClick={() => setDeleteConfirm({ type: "orientador", id: access.id })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Revocar acceso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el permiso de acceso. El {deleteConfirm?.type === "teacher" ? "docente" : "orientador"} ya no podrá 
              ver la información sensible del estudiante.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-alert text-alert-foreground hover:bg-alert/90"
              onClick={() => {
                if (deleteConfirm?.type === "teacher") {
                  handleRevokeTeacherAccess(deleteConfirm.id);
                } else if (deleteConfirm?.type === "orientador") {
                  handleRevokeOrientadorAccess(deleteConfirm.id);
                }
              }}
            >
              Revocar acceso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
