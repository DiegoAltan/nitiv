import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Users, 
  AlertTriangle, 
  Heart, 
  ChevronRight,
  LayoutGrid,
  List,
  Shield
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WellbeingScale } from "@/components/ui/WellbeingScale";
import { cn } from "@/lib/utils";
import { useStudentData, StudentWithData } from "@/hooks/useStudentData";
import { useAuth } from "@/contexts/AuthContext";
import { CourseStudentGroup } from "@/components/students/CourseStudentGroup";
import { AccessManagementPanel } from "@/components/access/AccessManagementPanel";

const wellbeingFilters = ["Todos", "Bajo (1-2)", "Medio (3)", "Alto (4-5)"];
const alertFilters = ["Todos", "Con alertas", "Sin alertas"];

export default function StudentsPage() {
  const navigate = useNavigate();
  const { students: studentsData, loading } = useStudentData();
  const { hasPsychosocialAccess, isTeacher } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("Todos");
  const [wellbeingFilter, setWellbeingFilter] = useState("Todos");
  const [alertFilter, setAlertFilter] = useState("Todos");
  const [viewMode, setViewMode] = useState<"courses" | "list">("courses");
  const [activeTab, setActiveTab] = useState<"students" | "access">("students");

  // Get unique courses
  const uniqueCourses = useMemo(() => {
    const courses = new Set(studentsData.map(s => s.course).filter(Boolean));
    return ["Todos", ...Array.from(courses).sort()];
  }, [studentsData]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return studentsData.filter((student) => {
      const matchesSearch = student.full_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = courseFilter === "Todos" || student.course === courseFilter;
      
      let matchesWellbeing = true;
      if (wellbeingFilter === "Bajo (1-2)") {
        matchesWellbeing = (student.lastWellbeing || 0) <= 2;
      } else if (wellbeingFilter === "Medio (3)") {
        matchesWellbeing = student.lastWellbeing === 3;
      } else if (wellbeingFilter === "Alto (4-5)") {
        matchesWellbeing = (student.lastWellbeing || 0) >= 4;
      }

      let matchesAlert = true;
      if (alertFilter === "Con alertas") {
        matchesAlert = student.hasAlert === true;
      } else if (alertFilter === "Sin alertas") {
        matchesAlert = student.hasAlert === false;
      }

      return matchesSearch && matchesCourse && matchesWellbeing && matchesAlert;
    });
  }, [studentsData, searchQuery, courseFilter, wellbeingFilter, alertFilter]);

  // Group students by course
  const studentsByCourse = useMemo(() => {
    const grouped: Record<string, StudentWithData[]> = {};
    filteredStudents.forEach(student => {
      const course = student.course || "Sin curso";
      if (!grouped[course]) {
        grouped[course] = [];
      }
      grouped[course].push(student);
    });
    // Sort courses
    const sortedEntries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    return sortedEntries;
  }, [filteredStudents]);

  // Stats
  const studentsWithAlerts = studentsData.filter((s) => s.hasAlert).length;
  const lowWellbeingCount = studentsData.filter((s) => (s.lastWellbeing || 0) <= 2).length;
  const avgWellbeing = studentsData.length > 0 
    ? (studentsData.reduce((acc, s) => acc + (s.lastWellbeing || 0), 0) / studentsData.length).toFixed(1)
    : "0";

  if (loading) {
    return (
      <AppLayout title="Estudiantes" subtitle="Cargando...">
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Estudiantes" subtitle="Listado y seguimiento de estudiantes">
      <div className="space-y-6">
        {/* Tabs for psychosocial access */}
        {hasPsychosocialAccess && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "students" | "access")}>
            <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
              <TabsTrigger value="students" className="rounded-lg">
                <Users className="w-4 h-4 mr-2" />
                Estudiantes
              </TabsTrigger>
              <TabsTrigger value="access" className="rounded-lg">
                <Shield className="w-4 h-4 mr-2" />
                Gestión de Accesos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="access" className="mt-0">
              <AccessManagementPanel />
            </TabsContent>

            <TabsContent value="students" className="mt-0">
              <StudentsContent
                studentsData={studentsData}
                filteredStudents={filteredStudents}
                studentsByCourse={studentsByCourse}
                studentsWithAlerts={studentsWithAlerts}
                lowWellbeingCount={lowWellbeingCount}
                avgWellbeing={avgWellbeing}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                courseFilter={courseFilter}
                setCourseFilter={setCourseFilter}
                wellbeingFilter={wellbeingFilter}
                setWellbeingFilter={setWellbeingFilter}
                alertFilter={alertFilter}
                setAlertFilter={setAlertFilter}
                viewMode={viewMode}
                setViewMode={setViewMode}
                uniqueCourses={uniqueCourses}
                navigate={navigate}
                showAlerts={hasPsychosocialAccess}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* For non-psychosocial access (teachers) */}
        {!hasPsychosocialAccess && (
          <StudentsContent
            studentsData={studentsData}
            filteredStudents={filteredStudents}
            studentsByCourse={studentsByCourse}
            studentsWithAlerts={studentsWithAlerts}
            lowWellbeingCount={lowWellbeingCount}
            avgWellbeing={avgWellbeing}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
            wellbeingFilter={wellbeingFilter}
            setWellbeingFilter={setWellbeingFilter}
            alertFilter={alertFilter}
            setAlertFilter={setAlertFilter}
            viewMode={viewMode}
            setViewMode={setViewMode}
            uniqueCourses={uniqueCourses}
            navigate={navigate}
            showAlerts={false}
          />
        )}
      </div>
    </AppLayout>
  );
}

interface StudentsContentProps {
  studentsData: StudentWithData[];
  filteredStudents: StudentWithData[];
  studentsByCourse: [string, StudentWithData[]][];
  studentsWithAlerts: number;
  lowWellbeingCount: number;
  avgWellbeing: string;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  courseFilter: string;
  setCourseFilter: (v: string) => void;
  wellbeingFilter: string;
  setWellbeingFilter: (v: string) => void;
  alertFilter: string;
  setAlertFilter: (v: string) => void;
  viewMode: "courses" | "list";
  setViewMode: (v: "courses" | "list") => void;
  uniqueCourses: string[];
  navigate: ReturnType<typeof useNavigate>;
  showAlerts: boolean;
}

function StudentsContent({
  studentsData,
  filteredStudents,
  studentsByCourse,
  studentsWithAlerts,
  lowWellbeingCount,
  avgWellbeing,
  searchQuery,
  setSearchQuery,
  courseFilter,
  setCourseFilter,
  wellbeingFilter,
  setWellbeingFilter,
  alertFilter,
  setAlertFilter,
  viewMode,
  setViewMode,
  uniqueCourses,
  navigate,
  showAlerts,
}: StudentsContentProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{studentsData.length}</p>
              <p className="text-sm text-muted-foreground">Total estudiantes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgWellbeing}</p>
              <p className="text-sm text-muted-foreground">Bienestar promedio</p>
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
        {showAlerts && (
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
        )}
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
            {uniqueCourses.map((course) => (
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
        {showAlerts && (
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
        )}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === "courses" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("courses")}
            className="rounded-md"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="rounded-md"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Mostrando {filteredStudents.length} de {studentsData.length} estudiantes
        {viewMode === "courses" && ` en ${studentsByCourse.length} cursos`}
      </p>

      {/* Course View */}
      {viewMode === "courses" && (
        <div className="space-y-4">
          {studentsByCourse.map(([course, students]) => (
            <CourseStudentGroup
              key={course}
              courseName={course}
              students={students}
              showAlerts={showAlerts}
            />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                onClick={() => navigate(`/students/${student.id}`)}
                className={cn(
                  "card-elevated hover:shadow-lg transition-all cursor-pointer group",
                  student.hasAlert && showAlerts && "border-l-4 border-l-alert"
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
                    {student.hasAlert && showAlerts && (
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
      )}

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
  );
}
