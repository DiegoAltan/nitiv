import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, TrendingUp, Download, Calendar, FileSpreadsheet, FileText, Users, Search, Grid3X3, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { exportToCSV, exportToHTML, getReportData } from "@/utils/exportReport";
import { toast } from "sonner";
import { useReportsData } from "@/hooks/useReportsData";
import { ReportsSummaryCards } from "@/components/reports/ReportsSummaryCards";
import { CourseReportCard } from "@/components/reports/CourseReportCard";
import { StudentReportCard } from "@/components/reports/StudentReportCard";
import { CourseDetailPanel } from "@/components/reports/CourseDetailPanel";
import { AdvancedFilters, ReportFilters } from "@/components/reports/AdvancedFilters";
import { HistoricalComparison } from "@/components/reports/HistoricalComparison";
import { ExportReportDialog } from "@/components/reports/ExportReportDialog";
import { AIAnalysisCard } from "@/components/ai/AIAnalysisCard";
import { ClimateStats } from "@/components/climate/ClimateStats";
import { useClassroomClimate } from "@/hooks/useClassroomClimate";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReportFilters>({
    period: "week",
    dateFrom: "",
    dateTo: "",
    wellbeingLevel: "all",
    alertStatus: "all",
    courseId: "all",
  });
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [comparisonPeriod, setComparisonPeriod] = useState("previous-week");
  
  const { 
    loading, 
    wellbeingByCourse, 
    emotionDistribution, 
    weeklyTrend, 
    monthlyTrend,
    courses, 
    students,
    selectedCourseData,
    stats 
  } = useReportsData(filters.courseId);

  // Filter students based on filters
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.course.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesWellbeing = filters.wellbeingLevel === "all" || 
      (filters.wellbeingLevel === "critical" && s.avgWellbeing <= 2) ||
      (filters.wellbeingLevel === "low" && s.avgWellbeing > 2 && s.avgWellbeing <= 3) ||
      (filters.wellbeingLevel === "medium" && s.avgWellbeing > 3 && s.avgWellbeing <= 4) ||
      (filters.wellbeingLevel === "high" && s.avgWellbeing > 4);
    
    const matchesAlerts = filters.alertStatus === "all" ||
      (filters.alertStatus === "with-alerts" && s.hasAlert) ||
      (filters.alertStatus === "without-alerts" && !s.hasAlert);
    
    return matchesSearch && matchesWellbeing && matchesAlerts;
  });

  // Mock comparison data - in production, this would come from the hook
  const comparisonData = {
    current: {
      wellbeing: stats.averageWellbeing,
      participation: stats.participation,
      alerts: stats.activeAlerts,
      records: stats.totalRecords,
    },
    previous: {
      wellbeing: stats.averageWellbeing * 0.95,
      participation: stats.participation * 0.9,
      alerts: Math.max(0, stats.activeAlerts - 2),
      records: Math.floor(stats.totalRecords * 0.85),
    },
    periodLabel: comparisonPeriod === "previous-week" ? "Comparando con la semana anterior" :
      comparisonPeriod === "previous-month" ? "Comparando con el mes anterior" :
      comparisonPeriod === "previous-quarter" ? "Comparando con el trimestre anterior" :
      "Comparando con el mismo mes del año anterior",
  };

  const handleExportCSV = () => {
    const data = getReportData(filters.period, weeklyTrend, wellbeingByCourse.map(c => ({ name: c.course, bienestar: c.bienestar, evaluacion: c.evaluacion })), emotionDistribution);
    exportToCSV(data);
    toast.success("Reporte CSV descargado correctamente");
  };

  const handleExportHTML = () => {
    const data = getReportData(filters.period, weeklyTrend, wellbeingByCourse.map(c => ({ name: c.course, bienestar: c.bienestar, evaluacion: c.evaluacion })), emotionDistribution);
    exportToHTML(data);
    toast.success("Reporte HTML descargado correctamente");
  };

  const handleStudentClick = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };

  const handleCourseSelect = (courseId: string) => {
    setFilters(prev => ({ ...prev, courseId }));
  };

  if (loading) {
    return (
      <AppLayout title="Reportes" subtitle="Cargando datos...">
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Reportes" subtitle="Análisis detallado del bienestar escolar">
      <div className="space-y-6">
        {/* Header with Advanced Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <AdvancedFilters 
            filters={filters} 
            onFiltersChange={setFilters} 
            courses={courses.map(c => ({ id: c.id, name: c.name }))} 
          />
          <div className="flex items-center gap-2">
            <ExportReportDialog 
              type="general" 
              data={{ stats, courses }} 
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Exportar Rápido
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  CSV (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportHTML}>
                  <FileText className="w-4 h-4 mr-2" />
                  HTML (Word)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Summary Cards */}
        <ReportsSummaryCards stats={stats} />

        {/* AI Analysis for Reports */}
        <AIAnalysisCard
          title="Análisis Institucional IA"
          analysisType="reports"
          dashboardData={{
            averageWellbeing: stats.averageWellbeing,
            totalStudents: stats.totalStudents,
            participation: stats.participation,
            averageDiscrepancy: stats.averageDiscrepancy,
            totalRecords: stats.totalRecords,
            activeAlerts: stats.activeAlerts,
            lowWellbeingCount: stats.lowWellbeingCount,
            coursesCount: courses.length,
          }}
        />

        {/* Historical Comparison */}
        <HistoricalComparison 
          comparisonPeriod={comparisonPeriod}
          onPeriodChange={setComparisonPeriod}
          data={comparisonData}
        />

        {/* Main Content */}
        <Tabs defaultValue="cursos" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="cursos" className="gap-2">
              <Grid3X3 className="w-4 h-4" />
              Por Curso
            </TabsTrigger>
            <TabsTrigger value="estudiantes" className="gap-2">
              <Users className="w-4 h-4" />
              Por Estudiante
            </TabsTrigger>
            <TabsTrigger value="tendencias" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Tendencias
            </TabsTrigger>
            <TabsTrigger value="emociones" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Emociones
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="cursos">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className={selectedCourseData ? "lg:w-1/2" : "w-full"}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map(course => (
                    <CourseReportCard
                      key={course.id}
                      course={course}
                      isSelected={selectedCourseData?.id === course.id}
                      onClick={() => handleCourseSelect(course.id)}
                    />
                  ))}
                </div>
              </div>
              <AnimatePresence>
                {selectedCourseData && (
                  <div className="lg:w-1/2">
                    <CourseDetailPanel
                      course={selectedCourseData}
                      onClose={() => handleCourseSelect("all")}
                      onStudentClick={handleStudentClick}
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="estudiantes">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar estudiante..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-1">
                  <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("grid")}>
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("list")}>
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
                {filteredStudents.slice(0, 30).map(student => (
                  <StudentReportCard
                    key={student.id}
                    student={student}
                    compact={viewMode === "list"}
                    onClick={() => handleStudentClick(student.id)}
                  />
                ))}
              </div>
              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No se encontraron estudiantes con los filtros aplicados
                </div>
              )}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="tendencias">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-lg font-display">Tendencia Semanal</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Legend />
                      <Line type="monotone" dataKey="estudiante" name="Autoevaluación" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                      <Line type="monotone" dataKey="docente" name="Evaluación Docente" stroke="hsl(var(--secondary-foreground))" strokeWidth={2} dot={{ fill: "hsl(var(--secondary-foreground))" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-lg font-display">Tendencia Mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Legend />
                      <Area type="monotone" dataKey="estudiante" name="Autoevaluación" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                      <Area type="monotone" dataKey="docente" name="Evaluación Docente" stroke="hsl(var(--secondary-foreground))" fill="hsl(var(--secondary) / 0.3)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="card-elevated lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-display">Comparativa por Curso</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={wellbeingByCourse}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="course" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Legend />
                      <Bar dataKey="bienestar" name="Autoevaluación" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="evaluacion" name="Evaluación Docente" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Emotions Tab */}
          <TabsContent value="emociones">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-lg font-display">Distribución de Emociones</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={emotionDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name }) => name}>
                        {emotionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-lg font-display">Frecuencia de Emociones</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={emotionDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Bar dataKey="value" name="Frecuencia" radius={[0, 4, 4, 0]}>
                        {emotionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
