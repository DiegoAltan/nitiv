import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Users, AlertTriangle, Heart, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { WellbeingScale } from "@/components/ui/WellbeingScale";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  course?: string;
  lastWellbeing?: number;
  hasAlert?: boolean;
}

const mockStudents: Student[] = [
  { id: "1", full_name: "Ana Martínez García", email: "ana@school.edu", avatar_url: null, course: "8°A", lastWellbeing: 4, hasAlert: false },
  { id: "2", full_name: "Carlos López Pérez", email: "carlos@school.edu", avatar_url: null, course: "8°A", lastWellbeing: 2, hasAlert: true },
  { id: "3", full_name: "María González Ruiz", email: "maria@school.edu", avatar_url: null, course: "7°B", lastWellbeing: 5, hasAlert: false },
  { id: "4", full_name: "Pedro Sánchez Torres", email: "pedro@school.edu", avatar_url: null, course: "8°B", lastWellbeing: 3, hasAlert: false },
  { id: "5", full_name: "Laura Torres Díaz", email: "laura@school.edu", avatar_url: null, course: "7°A", lastWellbeing: 1, hasAlert: true },
  { id: "6", full_name: "Diego Ramírez Vega", email: "diego@school.edu", avatar_url: null, course: "6°A", lastWellbeing: 4, hasAlert: false },
  { id: "7", full_name: "Sofía Herrera Castro", email: "sofia@school.edu", avatar_url: null, course: "8°A", lastWellbeing: 3, hasAlert: true },
  { id: "8", full_name: "Andrés Morales Jiménez", email: "andres@school.edu", avatar_url: null, course: "7°B", lastWellbeing: 5, hasAlert: false },
];

const courses = ["Todos", "6°A", "6°B", "7°A", "7°B", "8°A", "8°B"];
const wellbeingFilters = ["Todos", "Bajo (1-2)", "Medio (3)", "Alto (4-5)"];
const alertFilters = ["Todos", "Con alertas", "Sin alertas"];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("Todos");
  const [wellbeingFilter, setWellbeingFilter] = useState("Todos");
  const [alertFilter, setAlertFilter] = useState("Todos");

  const filteredStudents = students.filter((student) => {
    // Search filter
    const matchesSearch = student.full_name.toLowerCase().includes(searchQuery.toLowerCase());

    // Course filter
    const matchesCourse = courseFilter === "Todos" || student.course === courseFilter;

    // Wellbeing filter
    let matchesWellbeing = true;
    if (wellbeingFilter === "Bajo (1-2)") {
      matchesWellbeing = (student.lastWellbeing || 0) <= 2;
    } else if (wellbeingFilter === "Medio (3)") {
      matchesWellbeing = student.lastWellbeing === 3;
    } else if (wellbeingFilter === "Alto (4-5)") {
      matchesWellbeing = (student.lastWellbeing || 0) >= 4;
    }

    // Alert filter
    let matchesAlert = true;
    if (alertFilter === "Con alertas") {
      matchesAlert = student.hasAlert === true;
    } else if (alertFilter === "Sin alertas") {
      matchesAlert = student.hasAlert === false;
    }

    return matchesSearch && matchesCourse && matchesWellbeing && matchesAlert;
  });

  const studentsWithAlerts = students.filter((s) => s.hasAlert).length;
  const lowWellbeingCount = students.filter((s) => (s.lastWellbeing || 0) <= 2).length;

  return (
    <AppLayout title="Estudiantes" subtitle="Listado y seguimiento de estudiantes">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-muted-foreground">Total estudiantes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowWellbeingCount}</p>
                <p className="text-sm text-muted-foreground">Bienestar bajo</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-alert/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-alert" />
              </div>
              <div>
                <p className="text-2xl font-bold">{studentsWithAlerts}</p>
                <p className="text-sm text-muted-foreground">Con alertas activas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar estudiante por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Curso" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course} value={course}>
                  {course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={wellbeingFilter} onValueChange={setWellbeingFilter}>
            <SelectTrigger className="w-full lg:w-44">
              <SelectValue placeholder="Bienestar" />
            </SelectTrigger>
            <SelectContent>
              {wellbeingFilters.map((filter) => (
                <SelectItem key={filter} value={filter}>
                  {filter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={alertFilter} onValueChange={setAlertFilter}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Alertas" />
            </SelectTrigger>
            <SelectContent>
              {alertFilters.map((filter) => (
                <SelectItem key={filter} value={filter}>
                  {filter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredStudents.length} de {students.length} estudiantes
        </p>

        {/* Student List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  "card-elevated hover:shadow-lg transition-all cursor-pointer group",
                  student.hasAlert && "border-l-4 border-l-alert"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-white font-semibold">
                        {student.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <p className="font-semibold">{student.full_name}</p>
                        <p className="text-sm text-muted-foreground">{student.course}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

                  <div className="flex items-center justify-between">
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
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <Card className="card-elevated">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No se encontraron estudiantes</h3>
              <p className="text-sm text-muted-foreground">
                Intenta ajustar los filtros de búsqueda
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
