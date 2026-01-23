import { useState } from "react";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export interface ActivityFiltersState {
  dateFrom?: Date;
  dateTo?: Date;
  activityType?: "interna" | "externa" | "conjunta";
  organizer?: string;
}

interface ActivityFiltersProps {
  filters: ActivityFiltersState;
  onFiltersChange: (filters: ActivityFiltersState) => void;
}

const organizerOptions = [
  "Inspector General",
  "Dupla Psicosocial",
  "Orientador",
  "Administración",
  "Profesional Externo",
];

export function ActivityFilters({ filters, onFiltersChange }: ActivityFiltersProps) {
  const [open, setOpen] = useState(false);
  
  const activeFiltersCount = [
    filters.dateFrom,
    filters.dateTo,
    filters.activityType,
    filters.organizer,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({});
  };

  const updateFilter = <K extends keyof ActivityFiltersState>(
    key: K,
    value: ActivityFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filtrar actividades</h4>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs">
                <X className="w-3 h-3 mr-1" />
                Limpiar
              </Button>
            )}
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Rango de fechas</label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal text-xs h-8",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {filters.dateFrom ? format(filters.dateFrom, "d MMM", { locale: es }) : "Desde"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => updateFilter("dateFrom", date)}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal text-xs h-8",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {filters.dateTo ? format(filters.dateTo, "d MMM", { locale: es }) : "Hasta"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => updateFilter("dateTo", date)}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Activity Type */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Tipo de actividad</label>
            <Select
              value={filters.activityType || ""}
              onValueChange={(v) => updateFilter("activityType", v as ActivityFiltersState["activityType"] || undefined)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                <SelectItem value="interna">Interna</SelectItem>
                <SelectItem value="externa">Externa</SelectItem>
                <SelectItem value="conjunta">Conjunta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Organizer */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Organizador</label>
            <Select
              value={filters.organizer || ""}
              onValueChange={(v) => updateFilter("organizer", v || undefined)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Todos los organizadores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los organizadores</SelectItem>
                {organizerOptions.map((org) => (
                  <SelectItem key={org} value={org}>
                    {org}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
