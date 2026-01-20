import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface ReportData {
  title: string;
  period: string;
  generatedAt: string;
  summary: {
    averageWellbeing: number;
    totalStudents: number;
    participationRate: number;
    discrepancyAverage: number;
  };
  weeklyTrend: Array<{ name: string; estudiante: number; docente: number }>;
  courseComparison: Array<{ name: string; bienestar: number; evaluacion: number }>;
  emotionDistribution: Array<{ name: string; value: number }>;
}

function generateCSV(data: ReportData): string {
  let csv = "";
  
  // Header
  csv += `Reporte de Bienestar Escolar\n`;
  csv += `Período: ${data.period}\n`;
  csv += `Generado: ${data.generatedAt}\n\n`;
  
  // Summary
  csv += `RESUMEN GENERAL\n`;
  csv += `Bienestar Promedio,${data.summary.averageWellbeing}\n`;
  csv += `Total Estudiantes,${data.summary.totalStudents}\n`;
  csv += `Tasa de Participación,${data.summary.participationRate}%\n`;
  csv += `Discrepancia Promedio,${data.summary.discrepancyAverage}\n\n`;
  
  // Weekly Trend
  csv += `TENDENCIA SEMANAL\n`;
  csv += `Día,Autoevaluación,Evaluación Docente\n`;
  data.weeklyTrend.forEach(row => {
    csv += `${row.name},${row.estudiante},${row.docente}\n`;
  });
  csv += `\n`;
  
  // Course Comparison
  csv += `COMPARATIVA POR CURSO\n`;
  csv += `Curso,Bienestar Estudiante,Evaluación Docente\n`;
  data.courseComparison.forEach(row => {
    csv += `${row.name},${row.bienestar},${row.evaluacion}\n`;
  });
  csv += `\n`;
  
  // Emotion Distribution
  csv += `DISTRIBUCIÓN DE EMOCIONES\n`;
  csv += `Emoción,Frecuencia (%)\n`;
  data.emotionDistribution.forEach(row => {
    csv += `${row.name},${row.value}\n`;
  });
  
  return csv;
}

function generateHTML(data: ReportData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    h1 { color: #8B5CF6; border-bottom: 2px solid #8B5CF6; padding-bottom: 10px; }
    h2 { color: #6366F1; margin-top: 30px; }
    .meta { color: #666; margin-bottom: 30px; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #8B5CF6; color: white; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
    .summary-card { background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; }
    .summary-value { font-size: 28px; font-weight: bold; color: #8B5CF6; }
    .summary-label { color: #666; margin-top: 5px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${data.title}</h1>
  <p class="meta">Período: ${data.period} | Generado: ${data.generatedAt}</p>
  
  <h2>Resumen General</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-value">${data.summary.averageWellbeing}</div>
      <div class="summary-label">Bienestar Promedio</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.totalStudents}</div>
      <div class="summary-label">Total Estudiantes</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.participationRate}%</div>
      <div class="summary-label">Tasa de Participación</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.discrepancyAverage}</div>
      <div class="summary-label">Discrepancia Promedio</div>
    </div>
  </div>
  
  <h2>Tendencia Semanal</h2>
  <table>
    <tr>
      <th>Día</th>
      <th>Autoevaluación Estudiante</th>
      <th>Evaluación Docente</th>
    </tr>
    ${data.weeklyTrend.map(row => `
      <tr>
        <td>${row.name}</td>
        <td>${row.estudiante}</td>
        <td>${row.docente}</td>
      </tr>
    `).join('')}
  </table>
  
  <h2>Comparativa por Curso</h2>
  <table>
    <tr>
      <th>Curso</th>
      <th>Bienestar Estudiante</th>
      <th>Evaluación Docente</th>
    </tr>
    ${data.courseComparison.map(row => `
      <tr>
        <td>${row.name}</td>
        <td>${row.bienestar}</td>
        <td>${row.evaluacion}</td>
      </tr>
    `).join('')}
  </table>
  
  <h2>Distribución de Emociones</h2>
  <table>
    <tr>
      <th>Emoción</th>
      <th>Frecuencia (%)</th>
    </tr>
    ${data.emotionDistribution.map(row => `
      <tr>
        <td>${row.name}</td>
        <td>${row.value}%</td>
      </tr>
    `).join('')}
  </table>
  
  <div class="footer">
    <p>Este reporte fue generado automáticamente por el Sistema de Bienestar Escolar.</p>
    <p>La información contenida es confidencial y debe ser tratada según las políticas de privacidad institucionales.</p>
  </div>
</body>
</html>
  `;
}

export function exportToCSV(data: ReportData): void {
  const csv = generateCSV(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `reporte-bienestar-${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportToHTML(data: ReportData): void {
  const html = generateHTML(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `reporte-bienestar-${format(new Date(), "yyyy-MM-dd")}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function getReportData(
  period: string,
  weeklyTrend: Array<{ name: string; estudiante: number; docente: number }>,
  courseComparison: Array<{ name: string; bienestar: number; evaluacion: number }>,
  emotionDistribution: Array<{ name: string; value: number }>
): ReportData {
  const periodLabels: Record<string, string> = {
    week: "Esta semana",
    month: "Este mes",
    quarter: "Este trimestre",
  };

  return {
    title: "Reporte de Bienestar Escolar",
    period: periodLabels[period] || period,
    generatedAt: format(new Date(), "d 'de' MMMM, yyyy - HH:mm", { locale: es }),
    summary: {
      averageWellbeing: 3.8,
      totalStudents: 847,
      participationRate: 92,
      discrepancyAverage: 0.3,
    },
    weeklyTrend,
    courseComparison,
    emotionDistribution,
  };
}
