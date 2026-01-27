import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, RefreshCw, Brain, Lightbulb, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AIAnalysisCardProps {
  title?: string;
  analysisType: "executive" | "teacher" | "dupla" | "reports";
  dashboardData: Record<string, any>;
  autoFetch?: boolean;
  compact?: boolean;
  className?: string;
}

export function AIAnalysisCard({
  title = "Análisis Inteligente",
  analysisType,
  dashboardData,
  autoFetch = true,
  compact = false,
  className,
}: AIAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-dashboard', {
        body: {
          dashboardData,
          analysisType,
        }
      });

      if (fnError) throw fnError;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setAnalysis(data.analysis);
    } catch (err: any) {
      console.error("Error fetching AI analysis:", err);
      const errorMessage = err.message || "No se pudo obtener el análisis";
      setError(errorMessage);
      
      if (errorMessage.includes("429")) {
        toast.error("Límite de solicitudes excedido. Intenta más tarde.");
      } else if (errorMessage.includes("402")) {
        toast.error("Créditos de IA insuficientes.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && Object.keys(dashboardData).length > 0) {
      fetchAnalysis();
    }
  }, [autoFetch]);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20",
          className
        )}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <h4 className="font-medium text-primary text-sm">{title}</h4>
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary ml-auto" />}
          {!isLoading && analysis && (
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 ml-auto"
              onClick={fetchAnalysis}
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        {analysis ? (
          <p className="text-sm text-foreground/90 leading-relaxed">{analysis}</p>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analizando datos...
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {error}
            <Button variant="link" size="sm" className="h-auto p-0" onClick={fetchAnalysis}>
              Reintentar
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={fetchAnalysis} className="gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Generar análisis
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <Card className={cn("card-elevated overflow-hidden", className)}>
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 rounded-xl bg-primary/20">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="font-display">{title}</span>
            <p className="text-xs text-muted-foreground font-normal mt-0.5">
              Análisis automatizado con IA
            </p>
          </div>
          {!isLoading && analysis && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={fetchAnalysis}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {analysis ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
              <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {analysis}
              </p>
            </div>
          </motion.div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <Loader2 className="w-12 h-12 animate-spin text-primary absolute top-0 left-0" />
            </div>
            <p className="text-sm text-muted-foreground">Analizando datos con IA...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-sm text-destructive text-center">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchAnalysis} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Obtén recomendaciones basadas en los datos actuales
            </p>
            <Button onClick={fetchAnalysis} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generar Análisis IA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
