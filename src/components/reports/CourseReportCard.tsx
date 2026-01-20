import { motion } from "framer-motion";
import { ChevronRight, Users, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CourseReportCardProps {
  course: {
    id: string;
    name: string;
    level: string;
    studentCount: number;
    avgWellbeing: number;
    avgTeacherEval: number;
    discrepancy: number;
    participation: number;
    alertCount: number;
    topEmotions: { name: string; count: number }[];
  };
  onClick?: () => void;
  isSelected?: boolean;
}

function getWellbeingColor(level: number): string {
  if (level >= 4) return "text-success";
  if (level >= 3) return "text-warning";
  return "text-alert";
}

function getWellbeingBg(level: number): string {
  if (level >= 4) return "bg-success";
  if (level >= 3) return "bg-warning";
  return "bg-alert";
}

export function CourseReportCard({ course, onClick, isSelected }: CourseReportCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={cn(
          "card-elevated cursor-pointer transition-all hover:shadow-lg",
          isSelected && "ring-2 ring-primary"
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-display">{course.name}</CardTitle>
              {course.alertCount > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {course.alertCount}
                </Badge>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{course.studentCount} estudiantes</span>
            <span>•</span>
            <Activity className="w-4 h-4" />
            <span>{course.participation}% participación</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wellbeing Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Autoevaluación</p>
              <div className="flex items-center gap-2">
                <span className={cn("text-2xl font-bold", getWellbeingColor(course.avgWellbeing))}>
                  {course.avgWellbeing || "-"}
                </span>
                <div className="flex-1">
                  <Progress 
                    value={(course.avgWellbeing / 5) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Evaluación Docente</p>
              <div className="flex items-center gap-2">
                <span className={cn("text-2xl font-bold", getWellbeingColor(course.avgTeacherEval))}>
                  {course.avgTeacherEval || "-"}
                </span>
                <div className="flex-1">
                  <Progress 
                    value={(course.avgTeacherEval / 5) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Discrepancy indicator */}
          {course.discrepancy > 0 && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground">Discrepancia</span>
              <Badge 
                variant={course.discrepancy > 0.5 ? "destructive" : "secondary"}
                className="text-xs"
              >
                {course.discrepancy > 0.5 ? "Alta" : course.discrepancy > 0.2 ? "Moderada" : "Baja"}: {course.discrepancy}
              </Badge>
            </div>
          )}

          {/* Top emotions */}
          {course.topEmotions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Emociones frecuentes</p>
              <div className="flex flex-wrap gap-1.5">
                {course.topEmotions.map((emotion) => (
                  <Badge key={emotion.name} variant="outline" className="text-xs">
                    {emotion.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
