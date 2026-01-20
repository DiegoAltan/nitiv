import { useState } from "react";
import { Shield, AlertCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FileAccessStatus = "abierta" | "restringida" | "confidencial";

interface FileStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  currentStatus: FileAccessStatus;
  onStatusChanged: () => void;
}

const statusDescriptions: Record<FileAccessStatus, string> = {
  abierta: "Acceso normal para docentes de curso. Sin restricciones especiales.",
  restringida: "Requiere autorización de la dupla psicosocial para acceso docente.",
  confidencial: "Solo acceso para dupla psicosocial. Docentes no pueden ver información.",
};

export function FileStatusDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  currentStatus,
  onStatusChanged,
}: FileStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<FileAccessStatus>(currentStatus);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (selectedStatus === currentStatus) {
      onOpenChange(false);
      return;
    }

    if ((selectedStatus === "restringida" || selectedStatus === "confidencial") && !reason.trim()) {
      toast.error("Debes proporcionar una razón para restringir o hacer confidencial la ficha");
      return;
    }

    setSaving(true);
    try {
      // Check if file record exists
      const { data: existing } = await supabase
        .from("student_files")
        .select("id")
        .eq("student_id", studentId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("student_files")
          .update({
            access_status: selectedStatus,
            restricted_reason: selectedStatus !== "abierta" ? reason : null,
          })
          .eq("student_id", studentId);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("student_files")
          .insert({
            student_id: studentId,
            access_status: selectedStatus,
            restricted_reason: selectedStatus !== "abierta" ? reason : null,
          });

        if (error) throw error;
      }

      toast.success(`Estado de ficha actualizado a "${selectedStatus}"`);
      onStatusChanged();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating file status:", error);
      toast.error("Error al actualizar el estado de la ficha");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Estado de Ficha
          </DialogTitle>
          <DialogDescription>
            Modificar el estado de acceso para {studentName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value as FileAccessStatus)}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-success/30 bg-success/5">
              <RadioGroupItem value="abierta" id="abierta" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="abierta" className="text-success font-medium cursor-pointer">
                  Abierta
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {statusDescriptions.abierta}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg border border-warning/30 bg-warning/5">
              <RadioGroupItem value="restringida" id="restringida" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="restringida" className="text-warning font-medium cursor-pointer">
                  Restringida
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {statusDescriptions.restringida}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg border border-alert/30 bg-alert/5">
              <RadioGroupItem value="confidencial" id="confidencial" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="confidencial" className="text-alert font-medium cursor-pointer">
                  Confidencial
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {statusDescriptions.confidencial}
                </p>
              </div>
            </div>
          </RadioGroup>

          {(selectedStatus === "restringida" || selectedStatus === "confidencial") && (
            <div className="space-y-2">
              <Label htmlFor="reason" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-warning" />
                Razón del cambio (obligatorio)
              </Label>
              <Textarea
                id="reason"
                placeholder="Describe brevemente la razón de este cambio de estado..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                Esta información quedará registrada en el historial de la ficha.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
