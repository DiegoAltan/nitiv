import { useState } from "react";
import { Calendar, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export interface ReportFilters {
  period: string;
  dateFrom: string;
  dateTo: string;
  wellbeingLevel: string;
  alertStatus: string;
  courseId: string;
}

interface AdvancedFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  courses: Array<{ id: string; name: string }>;
}

export function AdvancedFilters({ filters, onFiltersChange, courses }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = [
    filters.dateFrom,
    filters.dateTo,
    filters.wellbeingLevel !== "all",
    filters.alertStatus !== "all",
  ].filter(Boolean).length;

  const handleChange = (key: keyof ReportFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      period: "week",
      dateFrom: "",
      dateTo: "",
      wellbeingLevel: "all",
      alertStatus: "all",
      courseId: "all",
    });
  };

  const periodOptions = [
    { value: "week", label: "Esta semana" },
    { value: "month", label: "Este mes" },
    { value: "quarter", label: "Este trimestre" },
    { value: "custom", label: "Personalizado" },
  ];

  const wellbeingOptions = [
    { value: "all", label: "Todos los niveles" },
    { value: "critical", label: "Crítico (1-2)" },
    { value: "low", label: "Bajo (2-3)" },
    { value: "medium", label: "Medio (3-4)" },
    { value: "high", label: "Alto (4-5)" },
  ];

  const alertOptions = [
    { value: "all", label: "Todos" },
    { value: "with-alerts", label: "Con alertas activas" },
    { value: "without-alerts", label: "Sin alertas" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Period Select */}
      <Select value={filters.period} onValueChange={(v) => handleChange("period", v)}>
        <SelectTrigger className="w-40">
          <Calendar className="w-4 h-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {periodOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Course Select */}
      <Select value={filters.courseId} onValueChange={(v) => handleChange("courseId", v)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Todos los cursos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los cursos</SelectItem>
          {courses.map(course => (
            <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Advanced Filters Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
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
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtros Avanzados</h4>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                  Limpiar
                </Button>
              )}
            </div>

            {/* Date Range */}
            {filters.period === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Desde</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleChange("dateFrom", e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Hasta</Label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleChange("dateTo", e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
            )}

            {/* Wellbeing Level */}
            <div className="space-y-1.5">
              <Label className="text-xs">Nivel de Bienestar</Label>
              <Select value={filters.wellbeingLevel} onValueChange={(v) => handleChange("wellbeingLevel", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {wellbeingOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Alert Status */}
            <div className="space-y-1.5">
              <Label className="text-xs">Estado de Alertas</Label>
              <Select value={filters.alertStatus} onValueChange={(v) => handleChange("alertStatus", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {alertOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.wellbeingLevel !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {wellbeingOptions.find(o => o.value === filters.wellbeingLevel)?.label}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleChange("wellbeingLevel", "all")} />
            </Badge>
          )}
          {filters.alertStatus !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {alertOptions.find(o => o.value === filters.alertStatus)?.label}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleChange("alertStatus", "all")} />
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Desde: {filters.dateFrom}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleChange("dateFrom", "")} />
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Hasta: {filters.dateTo}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleChange("dateTo", "")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
