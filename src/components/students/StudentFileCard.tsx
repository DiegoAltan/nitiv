import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, UserPlus, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WellbeingScale } from "@/components/ui/WellbeingScale";
import { FileStatusDialog } from "@/components/dialogs/FileStatusDialog";
import { TeacherAccessDialog } from "@/components/dialogs/TeacherAccessDialog";
import { cn } from "@/lib/utils";

interface StudentFileCardProps {
  student: {
    id: string;
    full_name: string;
    email: string | null;
    lastWellbeing?: number;
    hasAlert?: boolean;
    fileStatus?: "abierta" | "restringida" | "confidencial";
    course?: string;
  };
  onStatusChanged: () => void;
  showActions?: boolean;
  index?: number;
}

export function StudentFileCard({
  student,
  onStatusChanged,
  showActions = true,
  index = 0,
}: StudentFileCardProps) {
  const navigate = useNavigate();
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confidencial":
        return "border-alert text-alert bg-alert/5";
      case "restringida":
        return "border-warning text-warning bg-warning/5";
      default:
        return "border-success text-success bg-success/5";
    }
  };

  const initials = student.full_name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card
          className={cn(
            "card-elevated hover:shadow-lg transition-all",
            student.hasAlert && "border-l-4 border-l-alert"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => navigate(`/students/${student.id}`)}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-white font-semibold">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold group-hover:text-primary transition-colors">
                    {student.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {student.course || "Sin curso asignado"}
                  </p>
                </div>
              </div>
              <ChevronRight
                className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate(`/students/${student.id}`)}
              />
            </div>

            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Bienestar:</span>
                <WellbeingScale value={student.lastWellbeing || 0} readonly size="sm" />
              </div>
              {student.hasAlert && (
                <Badge className="bg-alert text-alert-foreground text-xs">
                  Alerta
                </Badge>
              )}
            </div>

            {showActions && (
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <Badge
                  variant="outline"
                  className={cn("text-xs", getStatusColor(student.fileStatus || "abierta"))}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {student.fileStatus || "abierta"}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileDialogOpen(true);
                    }}
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Estado
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAccessDialogOpen(true);
                    }}
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    Permisos
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <FileStatusDialog
        open={fileDialogOpen}
        onOpenChange={setFileDialogOpen}
        studentId={student.id}
        studentName={student.full_name}
        currentStatus={student.fileStatus || "abierta"}
        onStatusChanged={onStatusChanged}
      />

      <TeacherAccessDialog
        open={accessDialogOpen}
        onOpenChange={setAccessDialogOpen}
        studentId={student.id}
        studentName={student.full_name}
        onAccessChanged={onStatusChanged}
      />
    </>
  );
}
