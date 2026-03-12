import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dashboardData, analysisType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (analysisType) {
      case "executive":
        systemPrompt = `Eres un asesor ejecutivo experto en bienestar escolar. 
Tu rol es proporcionar análisis estratégico y recomendaciones accionables para la gestión institucional.
Responde SIEMPRE en español, de forma profesional y ejecutiva.
Limita tu respuesta a 4-5 oraciones concisas.
Estructura tu respuesta en:
1. Diagnóstico general del estado institucional
2. Áreas de fortaleza identificadas
3. Áreas de mejora prioritarias
4. Recomendaciones estratégicas de intervención`;

        userPrompt = `Analiza los siguientes indicadores institucionales:
- Bienestar General: ${dashboardData.overallWellbeing}/5
- Participación: ${dashboardData.participation}%
- Alertas Activas: ${dashboardData.activeAlerts}
- Total Estudiantes: ${dashboardData.totalStudents}
- Registros Totales: ${dashboardData.totalRecords}
- Tendencia: ${dashboardData.trend || "Sin datos"}
- Discrepancia Promedio: ${dashboardData.avgDiscrepancy || "N/A"}

Proporciona un análisis ejecutivo con recomendaciones de intervención.`;
        break;

      case "teacher":
        systemPrompt = `Eres un consultor pedagógico experto en bienestar estudiantil.
Tu rol es apoyar a docentes con análisis prácticos y sugerencias de intervención en el aula.
Responde SIEMPRE en español, de forma práctica y orientada a la acción.
Limita tu respuesta a 4-5 oraciones concisas.
Enfócate en:
1. Estado general del bienestar de los cursos
2. Identificación de patrones preocupantes
3. Sugerencias prácticas de intervención en el aula
4. Próximos pasos recomendados`;

        userPrompt = `Analiza los siguientes datos de mis cursos:
- Estudiantes a mi cargo: ${dashboardData.totalStudents}
- Bienestar promedio: ${dashboardData.avgWellbeing}/5
- Participación en registros: ${dashboardData.participation}%
- Alertas en mis cursos: ${dashboardData.alertCount}
- Evaluaciones realizadas: ${dashboardData.evaluationCount}
- Discrepancia con autoevaluación: ${dashboardData.discrepancy || "N/A"}
- Emociones frecuentes: ${dashboardData.topEmotions?.join(", ") || "Sin datos"}
- Clima de aula predominante: ${dashboardData.climateDominant || "Sin registros"}
- Conflictos reportados esta semana: ${dashboardData.climateConflicts ?? "Sin datos"}
- Energía predominante: ${dashboardData.climateEnergy || "Sin datos"}
- Participación de aula: ${dashboardData.climateParticipation || "Sin datos"}

Proporciona análisis y recomendaciones prácticas para mi rol docente, correlacionando el clima de aula con el bienestar estudiantil.`;
        break;

      case "dupla":
        systemPrompt = `Eres un especialista en intervención psicosocial escolar.
Tu rol es proporcionar análisis clínico-educativo y recomendaciones de intervención para equipos de convivencia escolar.
Responde SIEMPRE en español, de forma técnica pero accesible.
Limita tu respuesta a 5-6 oraciones.
Estructura tu análisis en:
1. Evaluación del clima socioemocional
2. Casos prioritarios que requieren atención
3. Patrones de riesgo identificados
4. Estrategias de intervención recomendadas
5. Acciones preventivas sugeridas`;

        userPrompt = `Analiza los siguientes datos psicosociales:
- Alertas activas: ${dashboardData.activeAlerts}
- Fichas en seguimiento: ${dashboardData.casesCount}
- Estudiantes en riesgo (bienestar ≤2): ${dashboardData.riskCount}
- Discrepancia alta detectada: ${dashboardData.highDiscrepancyCount} casos
- Bienestar institucional promedio: ${dashboardData.avgWellbeing}/5
- Emociones predominantes: ${dashboardData.topEmotions?.join(", ") || "Sin datos"}

Proporciona análisis psicosocial y recomendaciones de intervención prioritaria.`;
        break;

      case "reports":
        systemPrompt = `Eres un analista de datos educativos especializado en bienestar estudiantil.
Tu rol es interpretar datos y proporcionar insights accionables para la toma de decisiones.
Responde SIEMPRE en español, de forma analítica y precisa.
Limita tu respuesta a 5-6 oraciones.
Estructura tu análisis en:
1. Resumen ejecutivo de los indicadores
2. Tendencias identificadas
3. Anomalías o puntos de atención
4. Recomendaciones basadas en datos
5. Áreas que requieren monitoreo continuo`;

        userPrompt = `Analiza los siguientes datos del reporte institucional:
- Bienestar Promedio: ${dashboardData.averageWellbeing}/5
- Total Estudiantes: ${dashboardData.totalStudents}
- Participación: ${dashboardData.participation}%
- Discrepancia Promedio: ${dashboardData.averageDiscrepancy}
- Total Registros: ${dashboardData.totalRecords}
- Alertas Activas: ${dashboardData.activeAlerts}
- Estudiantes en Riesgo: ${dashboardData.lowWellbeingCount}
- Cursos Analizados: ${dashboardData.coursesCount}

Proporciona un análisis completo con insights y recomendaciones de intervención.`;
        break;

      default:
        systemPrompt = `Eres un asistente experto en bienestar estudiantil.
Proporciona análisis concisos y recomendaciones prácticas.
Responde SIEMPRE en español.`;
        userPrompt = `Analiza estos datos: ${JSON.stringify(dashboardData)}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de solicitudes excedido. Intenta de nuevo más tarde." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes para análisis de IA." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Error en el servicio de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "No se pudo generar el análisis.";

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-dashboard:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
