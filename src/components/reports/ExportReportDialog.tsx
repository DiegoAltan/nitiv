import { useState } from "react";
import { Download, FileSpreadsheet, FileText, File, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExportReportDialogProps {
  type: "general" | "course" | "student";
  targetName?: string;
  targetId?: string;
  data: any;
}

type ExportFormat = "csv" | "html" | "excel";

export function ExportReportDialog({ type, targetName, targetId, data }: ExportReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const typeLabels = {
    general: "Reporte General",
    course: `Reporte de ${targetName || "Curso"}`,
    student: `Reporte de ${targetName || "Estudiante"}`,
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const dateStr = new Date().toISOString().split("T")[0];
      
      let content = "";
      let mimeType = "";
      let filename = "";

      if (format === "csv") {
        content = generateCSVContent(data, type, includeDetails);
        mimeType = "text/csv;charset=utf-8;";
        filename = `reporte-${type}-${targetId || "general"}-${dateStr}.csv`;
      } else if (format === "html") {
        content = generateHTMLContent(data, type, targetName, includeCharts, includeDetails);
        mimeType = "text/html;charset=utf-8;";
        filename = `reporte-${type}-${targetId || "general"}-${dateStr}.html`;
      } else {
        content = generateExcelHTMLContent(data, type, targetName, includeDetails);
        mimeType = "application/vnd.ms-excel;charset=utf-8;";
        filename = `reporte-${type}-${targetId || "general"}-${dateStr}.xls`;
      }

      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success("Reporte exportado correctamente");
      setIsOpen(false);
    } catch (error) {
      toast.error("Error al exportar el reporte");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{typeLabels[type]}</DialogTitle>
          <DialogDescription>
            Selecciona el formato y las opciones de exportación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Formato de exportación</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <div className="grid grid-cols-3 gap-3">
                <label className={cn(
                  "flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-colors",
                  format === "csv" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                )}>
                  <RadioGroupItem value="csv" className="sr-only" />
                  <FileSpreadsheet className="w-6 h-6 mb-2 text-success" />
                  <span className="text-sm font-medium">CSV</span>
                  <span className="text-xs text-muted-foreground">Excel</span>
                </label>
                <label className={cn(
                  "flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-colors",
                  format === "html" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                )}>
                  <RadioGroupItem value="html" className="sr-only" />
                  <FileText className="w-6 h-6 mb-2 text-primary" />
                  <span className="text-sm font-medium">HTML</span>
                  <span className="text-xs text-muted-foreground">Web/Word</span>
                </label>
                <label className={cn(
                  "flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-colors",
                  format === "excel" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                )}>
                  <RadioGroupItem value="excel" className="sr-only" />
                  <File className="w-6 h-6 mb-2 text-chart-2" />
                  <span className="text-sm font-medium">XLS</span>
                  <span className="text-xs text-muted-foreground">Excel Nativo</span>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>Opciones de contenido</Label>
            <div className="space-y-2">
              {format === "html" && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="charts" 
                    checked={includeCharts} 
                    onCheckedChange={(c) => setIncludeCharts(!!c)} 
                  />
                  <label htmlFor="charts" className="text-sm cursor-pointer">
                    Incluir representación visual de gráficos
                  </label>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="details" 
                  checked={includeDetails} 
                  onCheckedChange={(c) => setIncludeDetails(!!c)} 
                />
                <label htmlFor="details" className="text-sm cursor-pointer">
                  Incluir detalles completos
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="gap-2">
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Descargar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// CSV Generation
function generateCSVContent(data: any, type: string, includeDetails: boolean): string {
  let csv = "";
  const now = new Date().toLocaleString("es-CL");
  
  if (type === "general") {
    csv += `Reporte General de Bienestar\n`;
    csv += `Generado: ${now}\n\n`;
    csv += `RESUMEN\n`;
    csv += `Bienestar Promedio,${data.stats?.averageWellbeing || 0}\n`;
    csv += `Total Estudiantes,${data.stats?.totalStudents || 0}\n`;
    csv += `Participación,${data.stats?.participation || 0}%\n`;
    csv += `Alertas Activas,${data.stats?.activeAlerts || 0}\n\n`;
    
    if (includeDetails && data.courses) {
      csv += `DETALLE POR CURSO\n`;
      csv += `Curso,Estudiantes,Bienestar Prom.,Participación,Alertas\n`;
      data.courses.forEach((c: any) => {
        csv += `${c.name},${c.studentCount},${c.avgWellbeing},${c.participation}%,${c.alertCount}\n`;
      });
    }
  } else if (type === "course") {
    csv += `Reporte de Curso: ${data.name}\n`;
    csv += `Generado: ${now}\n\n`;
    csv += `RESUMEN\n`;
    csv += `Estudiantes,${data.studentCount}\n`;
    csv += `Bienestar Promedio,${data.avgWellbeing}\n`;
    csv += `Evaluación Docente,${data.avgTeacherEval}\n`;
    csv += `Participación,${data.participation}%\n`;
    csv += `Alertas,${data.alertCount}\n\n`;
    
    if (includeDetails && data.students) {
      csv += `ESTUDIANTES\n`;
      csv += `Nombre,Bienestar Prom.,Registros,Tendencia,Alerta\n`;
      data.students.forEach((s: any) => {
        csv += `${s.name},${s.avgWellbeing},${s.recordCount},${s.trend},${s.hasAlert ? "Sí" : "No"}\n`;
      });
    }
  } else if (type === "student") {
    csv += `Reporte Individual: ${data.name}\n`;
    csv += `Curso: ${data.course}\n`;
    csv += `Generado: ${now}\n\n`;
    csv += `RESUMEN\n`;
    csv += `Bienestar Promedio,${data.avgWellbeing}\n`;
    csv += `Total Registros,${data.recordCount}\n`;
    csv += `Tendencia,${data.trend === "up" ? "Mejorando" : data.trend === "down" ? "Disminuyendo" : "Estable"}\n`;
    csv += `Alerta Activa,${data.hasAlert ? "Sí" : "No"}\n`;
    csv += `Emociones Frecuentes,${data.topEmotions?.join("; ") || "-"}\n`;
  }
  
  return csv;
}

// HTML Generation
function generateHTMLContent(data: any, type: string, targetName: string | undefined, includeCharts: boolean, includeDetails: boolean): string {
  const now = new Date().toLocaleString("es-CL");
  const title = type === "general" ? "Reporte General de Bienestar" : type === "course" ? `Reporte de Curso: ${targetName}` : `Reporte Individual: ${targetName}`;
  
  let content = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; font-family: 'Segoe UI', system-ui, sans-serif; }
    body { margin: 40px; color: #333; line-height: 1.5; }
    h1 { color: #8B5CF6; border-bottom: 3px solid #8B5CF6; padding-bottom: 12px; margin-bottom: 8px; }
    h2 { color: #6366F1; margin-top: 32px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
    .meta { color: #666; margin-bottom: 24px; font-size: 14px; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin: 24px 0; }
    .summary-card { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0; }
    .summary-value { font-size: 32px; font-weight: 700; color: #8B5CF6; }
    .summary-label { color: #64748b; margin-top: 4px; font-size: 13px; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #e2e8f0; padding: 12px 16px; text-align: left; }
    th { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; font-weight: 600; }
    tr:nth-child(even) { background-color: #f8fafc; }
    tr:hover { background-color: #f1f5f9; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #dc2626; }
    .chart-placeholder { background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 40px; text-align: center; color: #94a3b8; margin: 16px 0; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">Generado: ${now}</p>
`;

  if (type === "general" && data.stats) {
    content += `
  <h2>Resumen General</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-value">${data.stats.averageWellbeing || "-"}</div>
      <div class="summary-label">Bienestar Promedio</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.stats.totalStudents}</div>
      <div class="summary-label">Total Estudiantes</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.stats.participation}%</div>
      <div class="summary-label">Participación</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.stats.activeAlerts}</div>
      <div class="summary-label">Alertas Activas</div>
    </div>
  </div>`;
    
    if (includeDetails && data.courses) {
      content += `
  <h2>Detalle por Curso</h2>
  <table>
    <tr>
      <th>Curso</th>
      <th>Estudiantes</th>
      <th>Bienestar Prom.</th>
      <th>Participación</th>
      <th>Alertas</th>
    </tr>
    ${data.courses.map((c: any) => `
    <tr>
      <td>${c.name}</td>
      <td>${c.studentCount}</td>
      <td>${c.avgWellbeing}</td>
      <td>${c.participation}%</td>
      <td>${c.alertCount > 0 ? `<span class="badge badge-danger">${c.alertCount}</span>` : '<span class="badge badge-success">0</span>'}</td>
    </tr>`).join('')}
  </table>`;
    }
  } else if (type === "course") {
    content += `
  <h2>Información del Curso</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-value">${data.avgWellbeing}</div>
      <div class="summary-label">Bienestar Promedio</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.studentCount}</div>
      <div class="summary-label">Estudiantes</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.participation}%</div>
      <div class="summary-label">Participación</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.alertCount}</div>
      <div class="summary-label">Alertas</div>
    </div>
  </div>`;
    
    if (includeDetails && data.students) {
      content += `
  <h2>Estudiantes del Curso</h2>
  <table>
    <tr>
      <th>Nombre</th>
      <th>Bienestar Prom.</th>
      <th>Registros</th>
      <th>Tendencia</th>
      <th>Alerta</th>
    </tr>
    ${data.students.map((s: any) => `
    <tr>
      <td>${s.name}</td>
      <td>${s.avgWellbeing}</td>
      <td>${s.recordCount}</td>
      <td>${s.trend === "up" ? "↑ Mejorando" : s.trend === "down" ? "↓ Disminuyendo" : "→ Estable"}</td>
      <td>${s.hasAlert ? '<span class="badge badge-danger">Sí</span>' : '<span class="badge badge-success">No</span>'}</td>
    </tr>`).join('')}
  </table>`;
    }
  } else if (type === "student") {
    content += `
  <h2>Información del Estudiante</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-value">${data.avgWellbeing}</div>
      <div class="summary-label">Bienestar Promedio</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.recordCount}</div>
      <div class="summary-label">Total Registros</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.trend === "up" ? "↑" : data.trend === "down" ? "↓" : "→"}</div>
      <div class="summary-label">Tendencia</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.hasAlert ? "⚠️" : "✓"}</div>
      <div class="summary-label">Estado</div>
    </div>
  </div>
  <p><strong>Curso:</strong> ${data.course}</p>
  <p><strong>Emociones frecuentes:</strong> ${data.topEmotions?.join(", ") || "Sin datos"}</p>`;
  }

  content += `
  <div class="footer">
    <p>Este reporte fue generado automáticamente por el Sistema de Bienestar Escolar.</p>
    <p>La información es confidencial y debe tratarse según las políticas de privacidad institucionales.</p>
  </div>
</body>
</html>`;
  
  return content;
}

// Excel HTML Generation
function generateExcelHTMLContent(data: any, type: string, targetName: string | undefined, includeDetails: boolean): string {
  const now = new Date().toLocaleString("es-CL");
  const title = type === "general" ? "Reporte General" : type === "course" ? `Curso: ${targetName}` : `Estudiante: ${targetName}`;
  
  let content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="UTF-8"><style>
td, th { border: 1px solid #ccc; padding: 8px; }
th { background: #8B5CF6; color: white; font-weight: bold; }
.header { font-size: 18px; font-weight: bold; background: #f3f4f6; }
</style></head>
<body>
<table>
  <tr><td class="header" colspan="5">${title}</td></tr>
  <tr><td colspan="5">Generado: ${now}</td></tr>
  <tr><td colspan="5"></td></tr>`;

  if (type === "general" && data.stats) {
    content += `
  <tr><th>Métrica</th><th>Valor</th></tr>
  <tr><td>Bienestar Promedio</td><td>${data.stats.averageWellbeing}</td></tr>
  <tr><td>Total Estudiantes</td><td>${data.stats.totalStudents}</td></tr>
  <tr><td>Participación</td><td>${data.stats.participation}%</td></tr>
  <tr><td>Alertas Activas</td><td>${data.stats.activeAlerts}</td></tr>
  <tr><td colspan="5"></td></tr>`;
    
    if (includeDetails && data.courses) {
      content += `
  <tr><th>Curso</th><th>Estudiantes</th><th>Bienestar</th><th>Participación</th><th>Alertas</th></tr>
  ${data.courses.map((c: any) => `<tr><td>${c.name}</td><td>${c.studentCount}</td><td>${c.avgWellbeing}</td><td>${c.participation}%</td><td>${c.alertCount}</td></tr>`).join('')}`;
    }
  } else if (type === "course") {
    content += `
  <tr><th>Métrica</th><th>Valor</th></tr>
  <tr><td>Bienestar Promedio</td><td>${data.avgWellbeing}</td></tr>
  <tr><td>Estudiantes</td><td>${data.studentCount}</td></tr>
  <tr><td>Participación</td><td>${data.participation}%</td></tr>
  <tr><td>Alertas</td><td>${data.alertCount}</td></tr>
  <tr><td colspan="5"></td></tr>`;
    
    if (includeDetails && data.students) {
      content += `
  <tr><th>Nombre</th><th>Bienestar</th><th>Registros</th><th>Tendencia</th><th>Alerta</th></tr>
  ${data.students.map((s: any) => `<tr><td>${s.name}</td><td>${s.avgWellbeing}</td><td>${s.recordCount}</td><td>${s.trend}</td><td>${s.hasAlert ? "Sí" : "No"}</td></tr>`).join('')}`;
    }
  } else if (type === "student") {
    content += `
  <tr><th>Métrica</th><th>Valor</th></tr>
  <tr><td>Bienestar Promedio</td><td>${data.avgWellbeing}</td></tr>
  <tr><td>Total Registros</td><td>${data.recordCount}</td></tr>
  <tr><td>Curso</td><td>${data.course}</td></tr>
  <tr><td>Tendencia</td><td>${data.trend}</td></tr>
  <tr><td>Alerta Activa</td><td>${data.hasAlert ? "Sí" : "No"}</td></tr>
  <tr><td>Emociones Frecuentes</td><td>${data.topEmotions?.join(", ") || "-"}</td></tr>`;
  }

  content += `</table></body></html>`;
  return content;
}
