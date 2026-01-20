import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, BarChart3, AlertTriangle, FileText, Activity, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ReportsSummaryCardsProps {
  stats: {
    averageWellbeing: number;
    totalStudents: number;
    participation: number;
    averageDiscrepancy: number;
    totalRecords: number;
    activeAlerts: number;
    lowWellbeingCount: number;
  };
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

export function ReportsSummaryCards({ stats }: ReportsSummaryCardsProps) {
  const cards = [
    {
      title: "Bienestar Promedio",
      value: stats.averageWellbeing || "-",
      subtitle: "de 5.0",
      icon: TrendingUp,
      color: "primary",
      bgClass: "bg-primary/10",
      iconClass: "text-primary",
    },
    {
      title: "Estudiantes Registrados",
      value: stats.totalStudents,
      subtitle: "en el sistema",
      icon: Users,
      color: "secondary",
      bgClass: "bg-secondary",
      iconClass: "text-secondary-foreground",
    },
    {
      title: "Participación",
      value: `${stats.participation}%`,
      subtitle: "con registros",
      icon: Activity,
      color: "success",
      bgClass: "bg-success/10",
      iconClass: "text-success",
    },
    {
      title: "Total Registros",
      value: stats.totalRecords,
      subtitle: "autoevaluaciones",
      icon: FileText,
      color: "accent",
      bgClass: "bg-accent",
      iconClass: "text-accent-foreground",
    },
    {
      title: "Alertas Activas",
      value: stats.activeAlerts,
      subtitle: "pendientes",
      icon: AlertTriangle,
      color: "warning",
      bgClass: "bg-warning/10",
      iconClass: "text-warning",
    },
    {
      title: "Bienestar Bajo",
      value: stats.lowWellbeingCount,
      subtitle: "estudiantes ≤2",
      icon: TrendingDown,
      color: "alert",
      bgClass: "bg-alert/10",
      iconClass: "text-alert",
    },
    {
      title: "Discrepancia",
      value: stats.averageDiscrepancy <= 0.5 ? "Baja" : stats.averageDiscrepancy <= 1 ? "Media" : "Alta",
      subtitle: `±${Math.round(stats.averageDiscrepancy * 10) / 10} pts`,
      icon: Target,
      color: "muted",
      bgClass: stats.averageDiscrepancy <= 0.5 ? "bg-success/10" : stats.averageDiscrepancy <= 1 ? "bg-warning/10" : "bg-alert/10",
      iconClass: stats.averageDiscrepancy <= 0.5 ? "text-success" : stats.averageDiscrepancy <= 1 ? "text-warning" : "text-alert",
    },
    {
      title: "Cobertura",
      value: stats.totalStudents > 0 ? `${Math.round((stats.totalRecords / stats.totalStudents) * 10) / 10}` : "-",
      subtitle: "registros/estudiante",
      icon: BarChart3,
      color: "primary",
      bgClass: "bg-primary/10",
      iconClass: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="card-elevated hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground truncate">{card.title}</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.subtitle}</p>
                </div>
                <div className={cn("p-2 rounded-xl shrink-0", card.bgClass)}>
                  <card.icon className={cn("w-4 h-4 md:w-5 md:h-5", card.iconClass)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
