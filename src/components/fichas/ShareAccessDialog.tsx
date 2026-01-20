import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { supabase } from "@/integrations/supabase/client";
import { SharedAccess } from "@/hooks/useCaseRecords";
import { Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ShareAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  sharedAccess: SharedAccess[];
  onGrantAccess: (profileId: string, accessType: string) => Promise<boolean>;
  onRevokeAccess: (accessId: string) => Promise<boolean>;
}

interface ProfileOption {
  id: string;
  full_name: string;
  role: string;
}

export function ShareAccessDialog({
  open,
  onOpenChange,
  studentId,
  sharedAccess,
  onGrantAccess,
  onRevokeAccess,
}: ShareAccessDialogProps) {
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [accessType, setAccessType] = useState("view");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProfiles();
    }
  }, [open]);

  const fetchProfiles = async () => {
    // Fetch teachers and admins that could receive access
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name");

    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (profilesData && rolesData) {
      // Get user_ids from profiles
      const profileUserIds = await Promise.all(
        profilesData.map(async (p) => {
          const { data } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("id", p.id)
            .single();
          return { ...p, user_id: data?.user_id };
        })
      );

      // Map profiles with roles
      const profilesWithRoles = profileUserIds
        .filter((p) => p.user_id)
        .map((p) => {
          const userRole = rolesData.find((r) => r.user_id === p.user_id);
          return {
            id: p.id,
            full_name: p.full_name,
            role: userRole?.role || "unknown",
          };
        })
        .filter((p) => p.role === "docente" || p.role === "administrador")
        .filter((p) => !sharedAccess.some((s) => s.granted_to === p.id));

      setProfiles(profilesWithRoles);
    }
  };

  const handleGrant = async () => {
    if (!selectedProfile) return;
    setLoading(true);
    const success = await onGrantAccess(selectedProfile, accessType);
    if (success) {
      setSelectedProfile("");
      await fetchProfiles();
    }
    setLoading(false);
  };

  const handleRevoke = async (accessId: string) => {
    setLoading(true);
    await onRevokeAccess(accessId);
    await fetchProfiles();
    setLoading(false);
  };

  const roleLabels: Record<string, string> = {
    docente: "Docente",
    administrador: "Administrador",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Compartir Acceso a Ficha
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current access list */}
          {sharedAccess.length > 0 && (
            <div className="space-y-2">
              <Label>Accesos actuales</Label>
              <div className="space-y-2">
                {sharedAccess.map((access) => (
                  <div
                    key={access.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {access.profile?.full_name || "Usuario"}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {access.access_type === "full" ? "Completo" : "Lectura"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRevoke(access.id)}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add new access */}
          <div className="space-y-4">
            <Label>Agregar acceso</Label>
            <div className="flex gap-2">
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleccionar usuario" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No hay usuarios disponibles
                    </div>
                  ) : (
                    profiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.full_name} ({roleLabels[p.role] || p.role})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Select value={accessType} onValueChange={setAccessType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Lectura</SelectItem>
                  <SelectItem value="full">Completo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleGrant}
              disabled={!selectedProfile || loading}
              className="w-full"
            >
              Otorgar Acceso
            </Button>
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
