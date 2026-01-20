import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Search } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SeverityLevel } from "@/hooks/useCaseRecords";
import { toast } from "sonner";

interface CreateRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface StudentOption {
  id: string;
  full_name: string;
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

export function CreateRecordDialog({ open, onOpenChange, onSuccess }: CreateRecordDialogProps) {
  const { profile } = useAuth();
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentOption[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [showStudentList, setShowStudentList] = useState(false);
  
  const [recordType, setRecordType] = useState("observacion");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [severityLevel, setSeverityLevel] = useState<SeverityLevel>("moderada");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch students with role "estudiante"
  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      // Get user_ids with student role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "estudiante");

      if (roleData && roleData.length > 0) {
        const userIds = roleData.map(r => r.user_id);
        
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("user_id", userIds)
          .order("full_name");

        setStudents(profilesData || []);
        setFilteredStudents(profilesData || []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Filter students based on search
  useEffect(() => {
    if (studentSearch.trim()) {
      const filtered = students.filter(s => 
        s.full_name.toLowerCase().includes(studentSearch.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [studentSearch, students]);

  const resetForm = () => {
    setSelectedStudent(null);
    setStudentSearch("");
    setRecordType("observacion");
    setTitle("");
    setDescription("");
    setDate(new Date());
    setSeverityLevel("moderada");
    setTags([]);
    setTagInput("");
    setShowStudentList(false);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

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

  const handleSelectStudent = (student: StudentOption) => {
    setSelectedStudent(student);
    setStudentSearch(student.full_name);
    setShowStudentList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedStudent || !profile?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("student_case_records")
        .insert({
          student_id: selectedStudent.id,
          record_type: recordType,
          title: title.trim(),
          description: description.trim() || null,
          date_recorded: format(date, "yyyy-MM-dd"),
          created_by: profile.id,
          severity_level: severityLevel,
          tags,
        });

      if (error) throw error;

      toast.success("Registro creado exitosamente");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating record:", error);
      toast.error("Error al crear el registro");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Registro de Caso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student selector */}
          <div className="space-y-2">
            <Label htmlFor="student">Estudiante *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="student"
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  setSelectedStudent(null);
                  setShowStudentList(true);
                }}
                onFocus={() => setShowStudentList(true)}
                placeholder="Buscar estudiante..."
                className="pl-9"
                autoComplete="off"
              />
              {showStudentList && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {loadingStudents ? (
                    <div className="p-3 text-center text-muted-foreground text-sm">
                      Cargando estudiantes...
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="p-3 text-center text-muted-foreground text-sm">
                      No se encontraron estudiantes
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-muted/50 flex items-center gap-2"
                        onClick={() => handleSelectStudent(student)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                          {student.full_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <span>{student.full_name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {selectedStudent && (
              <Badge variant="secondary" className="gap-1">
                {selectedStudent.full_name}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentSearch("");
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>

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
            <Label htmlFor="title">Título *</Label>
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
            <Button type="submit" disabled={saving || !title.trim() || !selectedStudent}>
              {saving ? "Guardando..." : "Crear Registro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
