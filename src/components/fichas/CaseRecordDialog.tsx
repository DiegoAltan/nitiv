import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { CaseRecord, SeverityLevel } from "@/hooks/useCaseRecords";

interface CaseRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { 
    record_type: string; 
    title: string; 
    description?: string; 
    date_recorded?: string;
    severity_level?: SeverityLevel;
    tags?: string[];
  }) => Promise<void>;
  initialData?: CaseRecord | null;
}

const recordTypes = [
  { value: "conducta", label: "Conducta" },
  { value: "atencion", label: "Atención" },
  { value: "cita", label: "Cita" },
  { value: "observacion", label: "Observación" },
  { value: "seguimiento", label: "Seguimiento" },
];

const severityLevels: { value: SeverityLevel; label: string; color: string }[] = [
  { value: "leve", label: "Leve", color: "bg-success/10 text-success" },
  { value: "moderada", label: "Moderada", color: "bg-warning/10 text-warning" },
  { value: "alta", label: "Alta", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" },
  { value: "critica", label: "Crítica", color: "bg-alert/10 text-alert" },
];

export function CaseRecordDialog({ open, onOpenChange, onSave, initialData }: CaseRecordDialogProps) {
  const [recordType, setRecordType] = useState("observacion");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [severityLevel, setSeverityLevel] = useState<SeverityLevel>("moderada");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setRecordType(initialData.record_type);
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setDate(new Date(initialData.date_recorded));
      setSeverityLevel(initialData.severity_level || "moderada");
      setTags(initialData.tags || []);
    } else {
      setRecordType("observacion");
      setTitle("");
      setDescription("");
      setDate(new Date());
      setSeverityLevel("moderada");
      setTags([]);
    }
    setTagInput("");
  }, [initialData, open]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      await onSave({
        record_type: recordType,
        title: title.trim(),
        description: description.trim() || undefined,
        date_recorded: format(date, "yyyy-MM-dd"),
        severity_level: severityLevel,
        tags,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Registro" : "Nuevo Registro"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="record_type">Tipo de registro</Label>
              <Select value={recordType} onValueChange={setRecordType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {recordTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Gravedad</Label>
              <Select value={severityLevel} onValueChange={(v) => setSeverityLevel(v as SeverityLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Nivel de gravedad" />
                </SelectTrigger>
                <SelectContent>
                  {severityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <span className={`px-2 py-0.5 rounded ${level.color}`}>
                        {level.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "d 'de' MMMM, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Reunión con apoderado"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalle del registro..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Etiquetas</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Escribe y presiona Enter"
                className="flex-1"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>
                Agregar
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? "Guardando..." : initialData ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}