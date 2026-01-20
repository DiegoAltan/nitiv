import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  FileText, 
  Plus, 
  Calendar, 
  UserCheck, 
  AlertCircle,
  Clipboard,
  MessageSquare,
  Pencil,
  Trash2,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CaseRecord } from "@/hooks/useCaseRecords";
import { CaseRecordDialog } from "./CaseRecordDialog";
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

interface CaseRecordsListProps {
  records: CaseRecord[];
  loading: boolean;
  onAddRecord: (data: { record_type: string; title: string; description?: string; date_recorded?: string }) => Promise<CaseRecord | null>;
  onUpdateRecord: (id: string, data: Partial<CaseRecord>) => Promise<boolean>;
  onDeleteRecord: (id: string) => Promise<boolean>;
  onExport: () => void;
  studentName: string;
}

const recordTypeConfig: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  conducta: { label: "Conducta", icon: AlertCircle, color: "bg-warning/10 text-warning border-warning/30" },
  atencion: { label: "Atención", icon: UserCheck, color: "bg-primary/10 text-primary border-primary/30" },
  cita: { label: "Cita", icon: Calendar, color: "bg-secondary/10 text-secondary-foreground border-secondary/30" },
  observacion: { label: "Observación", icon: MessageSquare, color: "bg-accent/10 text-accent-foreground border-accent/30" },
  seguimiento: { label: "Seguimiento", icon: Clipboard, color: "bg-success/10 text-success border-success/30" },
};

export function CaseRecordsList({
  records,
  loading,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onExport,
  studentName,
}: CaseRecordsListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CaseRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const handleSave = async (data: { record_type: string; title: string; description?: string; date_recorded?: string }) => {
    if (editingRecord) {
      const success = await onUpdateRecord(editingRecord.id, data);
      if (success) {
        setDialogOpen(false);
        setEditingRecord(null);
      }
    } else {
      const result = await onAddRecord(data);
      if (result) {
        setDialogOpen(false);
      }
    }
  };

  const handleEdit = (record: CaseRecord) => {
    setEditingRecord(record);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (recordToDelete) {
      await onDeleteRecord(recordToDelete);
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  if (loading) {
    return (
      <Card className="card-elevated">
        <CardContent className="flex items-center justify-center py-12">
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
    <>
      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Ficha de {studentName}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm" onClick={() => { setEditingRecord(null); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Registro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay registros en la ficha</p>
              <p className="text-sm mt-1">Agrega el primer registro para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record, index) => {
                const config = recordTypeConfig[record.record_type] || recordTypeConfig.observacion;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={config.color}>
                              {config.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(record.date_recorded), "d 'de' MMMM, yyyy", { locale: es })}
                            </span>
                          </div>
                          <h4 className="font-medium mt-1">{record.title}</h4>
                          {record.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {record.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(record)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(record.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CaseRecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        initialData={editingRecord}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro será eliminado permanentemente de la ficha.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
