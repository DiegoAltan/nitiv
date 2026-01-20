import { motion } from "framer-motion";
import { Heart, TrendingUp, Calendar, Smile } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { WellbeingTrendChart } from "@/components/charts/WellbeingTrendChart";
import { WellbeingScale } from "@/components/ui/WellbeingScale";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Sample data - will be replaced with real data
const recentRecords = [
  { id: 1, date: "Hoy", level: 4, emotions: ["Tranquilo", "Motivado"] },
  { id: 2, date: "Ayer", level: 3, emotions: ["Cansado"] },
  { id: 3, date: "Hace 2 días", level: 5, emotions: ["Feliz", "Energético"] },
];

export function StudentDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const firstName = profile?.full_name?.split(" ")[0] || "Estudiante";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Message */}
      <motion.div variants={itemVariants}>
        <Card className="card-elevated bg-gradient-to-r from-primary/10 to-secondary/10 border-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-hero flex items-center justify-center">
                <Smile className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-display font-semibold">
                  ¡Hola, {firstName}!
                </h2>
                <p className="text-muted-foreground">
                  Recuerda registrar cómo te sientes hoy. Tu bienestar es importante.
                </p>
              </div>
              <Button 
                onClick={() => navigate("/wellbeing")}
                className="bg-gradient-hero hover:opacity-90"
              >
                Registrar mi bienestar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Personal Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Mi Bienestar Promedio"
          value="3.8"
          subtitle="Esta semana"
          icon={Heart}
          trend={{ value: 5, isPositive: true }}
          variant="primary"
        />
        <StatCard
          title="Días Registrados"
          value="12"
          subtitle="Este mes"
          icon={Calendar}
          variant="secondary"
        />
        <StatCard
          title="Racha Actual"
          value="5"
          subtitle="Días consecutivos"
          icon={TrendingUp}
          variant="default"
        />
      </motion.div>

      {/* Wellbeing Chart */}
      <motion.div variants={itemVariants}>
        <WellbeingTrendChart studentName="mi bienestar" />
      </motion.div>

      {/* Recent Records */}
      <motion.div variants={itemVariants}>
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg font-display">Mis registros recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRecords.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-muted-foreground w-24">
                      {record.date}
                    </div>
                    <WellbeingScale value={record.level} readonly size="sm" />
                  </div>
                  <div className="flex gap-2">
                    {record.emotions.map((emotion) => (
                      <span
                        key={emotion}
                        className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Supportive Message */}
      <motion.div variants={itemVariants}>
        <Card className="card-elevated border-primary/20">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              💚 Recuerda que siempre puedes hablar con tu profesor/a o con el equipo
              de apoyo si necesitas ayuda. ¡Estamos aquí para ti!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
