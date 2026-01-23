import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CreateActivityData } from "@/hooks/useActivities";
import { cn } from "@/lib/utils";
import { PhotoUpload } from "./PhotoUpload";

interface CreateActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateActivityData & { photo_urls?: string[] }) => void;
  isLoading?: boolean;
}

const organizerOptions = [
  "Inspector General",
  "Dupla Psicosocial",
  "Orientador",
  "Administración",
  "Profesional Externo",
];

export function CreateActivityDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateActivityDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [courseId, setCourseId] = useState<string>("");
  const [activityType, setActivityType] = useState<"interna" | "externa" | "conjunta">("interna");
  const [organizers, setOrganizers] = useState<string[]>([]);
  const [isUpcoming, setIsUpcoming] = useState(true);
  const [photos, setPhotos] = useState<string[]>([]);

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, name, level")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleAddOrganizer = (org: string) => {
    if (!organizers.includes(org)) {
      setOrganizers([...organizers, org]);
    }
  };

  const handleRemoveOrganizer = (org: string) => {
    setOrganizers(organizers.filter((o) => o !== org));
  };

  const handleSubmit = () => {
    if (!title || !date) return;

    onSubmit({
      title,
      description: description || undefined,
      activity_date: format(date, "yyyy-MM-dd"),
      activity_time: time || undefined,
      course_id: courseId || undefined,
      activity_type: activityType,
      organizers,
      is_upcoming: isUpcoming,
      photo_urls: photos.length > 0 ? photos : undefined,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setDate(undefined);
    setTime("");
    setCourseId("");
    setActivityType("interna");
    setOrganizers([]);
    setIsUpcoming(true);
    setPhotos([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Actividad</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nombre de la actividad *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Taller de Convivencia Escolar"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la actividad..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "d MMM yyyy", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Curso (opcional)</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Ninguno (todos los cursos)</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} - {course.level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de actividad</Label>
            <Select value={activityType} onValueChange={(v) => setActivityType(v as typeof activityType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interna">Interna (profesionales de la institución)</SelectItem>
                <SelectItem value="externa">Externa (profesionales externos)</SelectItem>
                <SelectItem value="conjunta">Conjunta (ambos)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Organizadores</Label>
            <Select onValueChange={handleAddOrganizer}>
              <SelectTrigger>
                <SelectValue placeholder="Agregar organizador" />
              </SelectTrigger>
              <SelectContent>
                {organizerOptions.map((org) => (
                  <SelectItem key={org} value={org} disabled={organizers.includes(org)}>
                    {org}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {organizers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {organizers.map((org) => (
                  <Badge key={org} variant="secondary" className="gap-1">
                    {org}
                    <button
                      onClick={() => handleRemoveOrganizer(org)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Fotografías</Label>
            <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>¿Es una actividad futura?</Label>
              <p className="text-xs text-muted-foreground">
                Las actividades futuras se mostrarán en "Próximamente"
              </p>
            </div>
            <Switch checked={isUpcoming} onCheckedChange={setIsUpcoming} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!title || !date || isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Actividad
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
