import { useState } from "react";
import { motion } from "framer-motion";
import { format, isWithinInterval, parseISO } from "date-fns";
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
  Download,
  Filter,
  X
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

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
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

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

  const clearFilters = () => {
    setTypeFilter("all");
    setDateRange(undefined);
  };

  // Apply filters
  const filteredRecords = records.filter((record) => {
    // Type filter
    if (typeFilter !== "all" && record.record_type !== typeFilter) {
      return false;
    }

    // Date range filter
    if (dateRange?.from) {
      const recordDate = parseISO(record.date_recorded);
      if (dateRange.to) {
        if (!isWithinInterval(recordDate, { start: dateRange.from, end: dateRange.to })) {
          return false;
        }
      } else {
        if (recordDate < dateRange.from) {
          return false;
        }
      }
    }

    return true;
  });

  const hasActiveFilters = typeFilter !== "all" || dateRange?.from;

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
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Ficha de {studentName}
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={showFilters ? "secondary" : "outline"} 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 px-1.5">
                  {(typeFilter !== "all" ? 1 : 0) + (dateRange?.from ? 1 : 0)}
                </Badge>
              )}
            </Button>
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

        {/* Filters section */}
        {showFilters && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Tipo de registro</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {Object.entries(recordTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Rango de fechas</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "d MMM", { locale: es })} - {format(dateRange.to, "d MMM yyyy", { locale: es })}
                          </>
                        ) : (
                          format(dateRange.from, "d 'de' MMMM, yyyy", { locale: es })
                        )
                      ) : (
                        "Seleccionar fechas"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Limpiar
                  </Button>
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <p className="text-sm text-muted-foreground mt-2">
                Mostrando {filteredRecords.length} de {records.length} registros
              </p>
            )}
          </div>
        )}

        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              {hasActiveFilters ? (
                <>
                  <p>No hay registros que coincidan con los filtros</p>
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Limpiar filtros
                  </Button>
                </>
              ) : (
                <>
                  <p>No hay registros en la ficha</p>
                  <p className="text-sm mt-1">Agrega el primer registro para comenzar</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record, index) => {
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
