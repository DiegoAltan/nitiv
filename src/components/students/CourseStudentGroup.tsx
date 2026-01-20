import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Users, Heart, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WellbeingScale } from "@/components/ui/WellbeingScale";
import { cn } from "@/lib/utils";

export interface StudentWithData {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  course?: string;
  lastWellbeing?: number;
  hasAlert?: boolean;
  fileStatus?: "abierta" | "restringida" | "confidencial";
}

interface CourseStudentGroupProps {
  courseName: string;
  students: StudentWithData[];
  showAlerts?: boolean;
}

export function CourseStudentGroup({ courseName, students, showAlerts = false }: CourseStudentGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  // Calculate course stats
  const totalStudents = students.length;
  const studentsWithAlerts = students.filter(s => s.hasAlert).length;
  const lowWellbeing = students.filter(s => (s.lastWellbeing || 0) <= 2).length;
  const mediumWellbeing = students.filter(s => s.lastWellbeing === 3).length;
  const highWellbeing = students.filter(s => (s.lastWellbeing || 0) >= 4).length;
  
  const avgWellbeing = students.length > 0 
    ? students.reduce((acc, s) => acc + (s.lastWellbeing || 0), 0) / students.length
    : 0;

  const wellbeingDistribution = {
    high: (highWellbeing / totalStudents) * 100,
    medium: (mediumWellbeing / totalStudents) * 100,
    low: (lowWellbeing / totalStudents) * 100,
  };

  return (
    <Card className="card-elevated overflow-hidden">
      <CardHeader
        className={cn(
          "cursor-pointer hover:bg-muted/50 transition-colors",
          expanded && "border-b"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">{courseName.replace(/[^0-9]/g, "")}</span>
            </div>
            <div>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                {courseName}
                {studentsWithAlerts > 0 && showAlerts && (
                  <Badge className="bg-alert text-alert-foreground">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {studentsWithAlerts}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{totalStudents} estudiantes</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Course Stats Summary */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4 text-primary" />
                <span className="font-medium">{avgWellbeing.toFixed(1)}</span>
                <span className="text-muted-foreground">promedio</span>
              </div>
              
              {/* Wellbeing Distribution Bar */}
              <div className="w-32 h-3 rounded-full bg-muted overflow-hidden flex">
                <div 
                  className="bg-success h-full transition-all" 
                  style={{ width: `${wellbeingDistribution.high}%` }}
                />
                <div 
                  className="bg-warning h-full transition-all" 
                  style={{ width: `${wellbeingDistribution.medium}%` }}
                />
                <div 
                  className="bg-alert h-full transition-all" 
                  style={{ width: `${wellbeingDistribution.low}%` }}
                />
              </div>
            </div>

            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="p-4 space-y-4">
              {/* Course Stats Detail */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold">{highWellbeing}</p>
                    <p className="text-xs text-muted-foreground">Bienestar alto</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-semibold">{mediumWellbeing}</p>
                    <p className="text-xs text-muted-foreground">Bienestar medio</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-alert/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-alert" />
                  </div>
                  <div>
                    <p className="font-semibold">{lowWellbeing}</p>
                    <p className="text-xs text-muted-foreground">Bienestar bajo</p>
                  </div>
                </div>
                {showAlerts && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-lg bg-alert/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-alert" />
                    </div>
                    <div>
                      <p className="font-semibold">{studentsWithAlerts}</p>
                      <p className="text-xs text-muted-foreground">Con alertas</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Student List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {students.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => navigate(`/students/${student.id}`)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all",
                      "bg-muted/30 hover:bg-muted/60 hover:shadow-md",
                      student.hasAlert && "border-l-4 border-l-alert"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-white font-semibold text-sm">
                        {student.full_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{student.full_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <WellbeingScale value={student.lastWellbeing || 0} readonly size="sm" />
                          {student.hasAlert && showAlerts && (
                            <Badge className="bg-alert text-alert-foreground text-xs h-5">
                              Alerta
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
