import { useState, useEffect } from "react";
import { UserPlus, Trash2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Teacher {
  id: string;
  full_name: string;
  user_id: string;
}

interface AccessGrant {
  id: string;
  teacher_id: string;
  teacher_name: string;
  access_level: string;
  granted_at: string;
  expires_at: string | null;
}

interface TeacherAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  onAccessChanged: () => void;
}

export function TeacherAccessDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  onAccessChanged,
}: TeacherAccessDialogProps) {
  const { profile } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [currentAccess, setCurrentAccess] = useState<AccessGrant[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, studentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all teachers
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "docente");

      if (rolesData && rolesData.length > 0) {
        const teacherUserIds = rolesData.map((r) => r.user_id);
        const { data: teacherProfiles } = await supabase
          .from("profiles")
          .select("id, full_name, user_id")
          .in("user_id", teacherUserIds);

        setTeachers(teacherProfiles || []);
      }

      // Fetch current access grants for this student
      const { data: accessData } = await supabase
        .from("teacher_student_access")
        .select("*")
        .eq("student_id", studentId);

      if (accessData) {
        // Get teacher names
        const teacherIds = accessData.map((a) => a.teacher_id);
        const { data: teacherProfiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", teacherIds);

        const accessWithNames: AccessGrant[] = accessData.map((a) => ({
          id: a.id,
          teacher_id: a.teacher_id,
          teacher_name: teacherProfiles?.find((t) => t.id === a.teacher_id)?.full_name || "Docente",
          access_level: a.access_level,
          granted_at: a.granted_at,
          expires_at: a.expires_at,
        }));
        setCurrentAccess(accessWithNames);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedTeacher || !profile) return;

    setSaving(true);
    try {
      // Check if access already exists
      const existing = currentAccess.find((a) => a.teacher_id === selectedTeacher);
      if (existing) {
        toast.error("Este docente ya tiene acceso extendido");
        return;
      }

      const { error } = await supabase.from("teacher_student_access").insert({
        teacher_id: selectedTeacher,
        student_id: studentId,
        granted_by: profile.id,
        access_level: "extended",
      });

      if (error) throw error;

      toast.success("Acceso extendido otorgado correctamente");
      setSelectedTeacher("");
      fetchData();
      onAccessChanged();
    } catch (error) {
      console.error("Error granting access:", error);
      toast.error("Error al otorgar acceso");
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeAccess = async (accessId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("teacher_student_access")
        .delete()
        .eq("id", accessId);

      if (error) throw error;

      toast.success("Acceso revocado correctamente");
      fetchData();
      onAccessChanged();
    } catch (error) {
      console.error("Error revoking access:", error);
      toast.error("Error al revocar acceso");
    } finally {
      setSaving(false);
    }
  };

  const availableTeachers = teachers.filter(
    (t) => !currentAccess.some((a) => a.teacher_id === t.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Permisos Extendidos
          </DialogTitle>
          <DialogDescription>
            Gestionar acceso extendido de docentes a la ficha de {studentName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Access List */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Docentes con acceso extendido</Label>
            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : currentAccess.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg text-center">
                Ningún docente tiene acceso extendido a esta ficha
              </p>
            ) : (
              <div className="space-y-2">
                {currentAccess.map((access) => (
                  <div
                    key={access.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div>
                      <p className="font-medium text-sm">{access.teacher_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {access.access_level === "extended" ? "Extendido" : "Básico"}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(access.granted_at), "d MMM yyyy", { locale: es })}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-alert hover:text-alert hover:bg-alert/10"
                      onClick={() => handleRevokeAccess(access.id)}
                      disabled={saving}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grant New Access */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-medium">Otorgar nuevo acceso</Label>
            <div className="flex gap-2">
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleccionar docente..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTeachers.length === 0 ? (
                    <SelectItem value="_empty" disabled>
                      No hay docentes disponibles
                    </SelectItem>
                  ) : (
                    availableTeachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={handleGrantAccess}
                disabled={!selectedTeacher || saving}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Otorgar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              El docente podrá ver información sensible de este estudiante, incluyendo comentarios y alertas.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
