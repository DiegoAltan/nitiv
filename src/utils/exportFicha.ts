import { CaseRecord } from "@/hooks/useCaseRecords";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const recordTypeLabels: Record<string, string> = {
  conducta: "Conducta",
  atencion: "Atención",
  cita: "Cita",
  observacion: "Observación",
  seguimiento: "Seguimiento",
};

export function exportFichaToHTML(records: CaseRecord[], studentName: string): void {
  const now = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ficha de ${studentName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #1e40af;
      margin: 0 0 10px 0;
    }
    .header p {
      color: #6b7280;
      margin: 0;
    }
    .record {
      margin-bottom: 25px;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #f9fafb;
    }
    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .record-type {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .type-conducta { background: #fef3c7; color: #92400e; }
    .type-atencion { background: #dbeafe; color: #1e40af; }
    .type-cita { background: #f3e8ff; color: #7c3aed; }
    .type-observacion { background: #e0e7ff; color: #3730a3; }
    .type-seguimiento { background: #d1fae5; color: #065f46; }
    .record-date {
      color: #6b7280;
      font-size: 14px;
    }
    .record-title {
      font-weight: 600;
      font-size: 16px;
      margin: 0 0 8px 0;
      color: #111827;
    }
    .record-description {
      color: #4b5563;
      margin: 0;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
    }
    @media print {
      body { padding: 20px; }
      .record { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Ficha de Seguimiento</h1>
    <p><strong>Estudiante:</strong> ${studentName}</p>
    <p><strong>Fecha de exportación:</strong> ${now}</p>
    <p><strong>Total de registros:</strong> ${records.length}</p>
  </div>

  ${records.map(record => `
    <div class="record">
      <div class="record-header">
        <span class="record-type type-${record.record_type}">
          ${recordTypeLabels[record.record_type] || record.record_type}
        </span>
        <span class="record-date">
          ${format(new Date(record.date_recorded), "d 'de' MMMM 'de' yyyy", { locale: es })}
        </span>
      </div>
      <h3 class="record-title">${record.title}</h3>
      ${record.description ? `<p class="record-description">${record.description}</p>` : ''}
    </div>
  `).join('')}

  <div class="footer">
    <p>Documento generado automáticamente por el Sistema de Bienestar Estudiantil</p>
    <p>Este documento es confidencial y está destinado únicamente para uso interno</p>
  </div>
</body>
</html>
  `.trim();

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ficha_${studentName.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyy-MM-dd')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportFichaToCSV(records: CaseRecord[], studentName: string): void {
  const headers = ['Fecha', 'Tipo', 'Título', 'Descripción'];
  const rows = records.map(record => [
    format(new Date(record.date_recorded), 'yyyy-MM-dd'),
    recordTypeLabels[record.record_type] || record.record_type,
    `"${record.title.replace(/"/g, '""')}"`,
    `"${(record.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ficha_${studentName.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
