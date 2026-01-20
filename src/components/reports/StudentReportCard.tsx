import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Calendar, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface StudentReportCardProps {
  student: {
    id: string;
    name: string;
    course: string;
    avgWellbeing: number;
    recordCount: number;
    lastRecord: string | null;
    topEmotions: string[];
    hasAlert: boolean;
    trend: "up" | "down" | "stable";
  };
  onClick?: () => void;
  compact?: boolean;
}

function getWellbeingColor(level: number): string {
  if (level >= 4) return "text-success";
  if (level >= 3) return "text-warning";
  if (level > 0) return "text-alert";
  return "text-muted-foreground";
}

function getWellbeingBg(level: number): string {
  if (level >= 4) return "bg-success";
  if (level >= 3) return "bg-warning";
  if (level > 0) return "bg-alert";
  return "bg-muted";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-success" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-alert" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

export function StudentReportCard({ student, onClick, compact }: StudentReportCardProps) {
  if (compact) {
    return (
      <motion.div
        whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
        onClick={onClick}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {getInitials(student.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{student.name}</p>
            {student.hasAlert && (
              <AlertTriangle className="w-3 h-3 text-alert shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">{student.course}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white",
            getWellbeingBg(student.avgWellbeing)
          )}>
            {student.avgWellbeing || "-"}
          </div>
          <TrendIcon trend={student.trend} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="card-elevated cursor-pointer transition-all hover:shadow-lg"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold truncate">{student.name}</h4>
                {student.hasAlert && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                    <AlertTriangle className="w-3 h-3" />
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{student.course}</p>
              
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>{student.recordCount} registros</span>
                </div>
                {student.lastRecord && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {format(new Date(student.lastRecord), "d MMM", { locale: es })}
                    </span>
                  </div>
                )}
              </div>

              {student.topEmotions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {student.topEmotions.map((emotion) => (
                    <Badge key={emotion} variant="outline" className="text-xs h-5">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white",
                getWellbeingBg(student.avgWellbeing)
              )}>
                {student.avgWellbeing || "-"}
              </div>
              <div className="mt-1 flex items-center justify-center gap-1">
                <TrendIcon trend={student.trend} />
                <span className="text-xs text-muted-foreground">
                  {student.trend === "up" ? "Subiendo" : student.trend === "down" ? "Bajando" : "Estable"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
