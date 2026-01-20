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
    const { courseData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Eres un psicólogo educacional experto analizando datos de bienestar estudiantil. 
Tu rol es proporcionar un análisis breve pero significativo de los datos de un curso escolar.
Responde SIEMPRE en español, de forma profesional pero accesible.
Limita tu respuesta a 3-4 oraciones concisas.
Enfócate en:
1. Estado general del bienestar del curso
2. Discrepancia entre autoevaluación y evaluación docente (si existe)
3. Una recomendación práctica
4. Patrones emocionales relevantes`;

    const userPrompt = `Analiza los siguientes datos del curso "${courseData.name}":
- Estudiantes: ${courseData.studentCount}
- Bienestar promedio (autoevaluación): ${courseData.avgWellbeing}/5
- Evaluación docente promedio: ${courseData.avgTeacherEval}/5
- Discrepancia: ${courseData.discrepancyLabel} (${courseData.discrepancyValue})
- Participación: ${courseData.participation}%
- Alertas activas: ${courseData.alertCount}
- Emociones más frecuentes: ${courseData.topEmotions?.join(", ") || "Sin datos"}

Proporciona un análisis breve y accionable.`;

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
    console.error("Error in analyze-course:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
