import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ChevronDown } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type AssessmentLevel = "low" | "medium" | "high" | null;

interface StudentAssessment {
  id: number;
  name: string;
  course: string;
  level: AssessmentLevel;
  observation: string;
}

const initialStudents: StudentAssessment[] = [
  { id: 1, name: "Ana Martínez", course: "8°A", level: null, observation: "" },
  { id: 2, name: "Carlos López", course: "8°A", level: null, observation: "" },
  { id: 3, name: "María González", course: "8°A", level: null, observation: "" },
  { id: 4, name: "Pedro Sánchez", course: "8°A", level: null, observation: "" },
  { id: 5, name: "Laura Torres", course: "8°A", level: null, observation: "" },
];

const levelConfig = {
  low: { label: "Bajo", className: "bg-alert-light text-alert border-alert" },
  medium: { label: "Medio", className: "bg-warning-light text-warning border-warning" },
  high: { label: "Alto", className: "bg-success-light text-success border-success" },
};

const TeacherAssessment = () => {
  const [students, setStudents] = useState(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);

  const handleLevelChange = (studentId: number, level: AssessmentLevel) => {
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, level } : s
    ));
  };

  const handleObservationChange = (studentId: number, observation: string) => {
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, observation: observation.slice(0, 200) } : s
    ));
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const assessedCount = students.filter(s => s.level !== null).length;

  return (
    <AppLayout title="Evaluación Docente" subtitle="Registro socioemocional por estudiante">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress */}
        <Card className="card-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold">Progreso de evaluación</h3>
                <p className="text-sm text-muted-foreground">8°A - Semana del 13 de enero</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">{assessedCount}</span>
                <span className="text-muted-foreground">/{students.length}</span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(assessedCount / students.length) * 100}%` }}
                className="h-full bg-gradient-hero rounded-full"
                transition={{ duration: 0.5 }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar estudiante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select defaultValue="8a">
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8a">8°A</SelectItem>
              <SelectItem value="8b">8°B</SelectItem>
              <SelectItem value="7a">7°A</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>

        {/* Student List */}
        <div className="space-y-3">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="card-elevated overflow-hidden">
                <CardContent className="p-0">
                  {/* Main row */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {student.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.course}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Level buttons */}
                      <div className="flex gap-2">
                        {(["low", "medium", "high"] as const).map((level) => (
                          <button
                            key={level}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLevelChange(student.id, level);
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all",
                              student.level === level
                                ? levelConfig[level].className
                                : "bg-transparent border-border text-muted-foreground hover:border-primary/30"
                            )}
                          >
                            {levelConfig[level].label}
                          </button>
                        ))}
                      </div>

                      <ChevronDown
                        className={cn(
                          "w-5 h-5 text-muted-foreground transition-transform",
                          expandedStudent === student.id && "rotate-180"
                        )}
                      />
                    </div>
                  </div>

                  {/* Expanded content */}
                  {expandedStudent === student.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 space-y-3">
                        <label className="text-sm font-medium">
                          Observaciones <span className="text-muted-foreground font-normal">(opcional)</span>
                        </label>
                        <textarea
                          value={student.observation}
                          onChange={(e) => handleObservationChange(student.id, e.target.value)}
                          placeholder="Agregar observación..."
                          className="w-full p-3 text-sm rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                          rows={2}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {student.observation.length}/200 caracteres
                        </p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button 
            className="bg-gradient-hero hover:opacity-90"
            size="lg"
            disabled={assessedCount < students.length}
          >
            Guardar evaluaciones ({assessedCount}/{students.length})
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default TeacherAssessment;
