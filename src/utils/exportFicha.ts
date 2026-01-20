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

export function exportFichaToHTML(
  records: CaseRecord[], 
  studentName: string,
  options?: {
    institutionLogoUrl?: string;
    institutionName?: string;
  }
): void {
  const now = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });
  
  // App logo as base64 SVG (simple placeholder - replace with actual logo)
  const appLogoSvg = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#3b82f6"/>
    <path d="M12 20C12 15.58 15.58 12 20 12C24.42 12 28 15.58 28 20C28 24.42 24.42 28 20 28" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="20" cy="20" r="4" fill="white"/>
  </svg>`;
  
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
    .logos-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e5e7eb;
    }
    .app-logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .app-logo span {
      font-weight: 600;
      font-size: 14px;
      color: #3b82f6;
    }
    .institution-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 50px;
    }
    .institution-logo img {
      max-height: 50px;
      max-width: 150px;
      object-fit: contain;
    }
    .institution-logo-placeholder {
      width: 150px;
      height: 50px;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-size: 11px;
      text-align: center;
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
    .signatures-section {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
    }
    .signatures-title {
      font-weight: 600;
      font-size: 14px;
      color: #374151;
      margin-bottom: 40px;
      text-align: center;
    }
    .signatures-container {
      display: flex;
      justify-content: space-between;
      gap: 60px;
    }
    .signature-block {
      flex: 1;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #1a1a1a;
      margin-bottom: 8px;
      padding-top: 8px;
    }
    .signature-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .signature-name {
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
    }
    .signature-role {
      font-size: 11px;
      color: #9ca3af;
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
      .signatures-section { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="logos-container">
    <div class="app-logo">
      ${appLogoSvg}
      <span>Sistema de Bienestar</span>
    </div>
    <div class="institution-logo">
      ${options?.institutionLogoUrl 
        ? `<img src="${options.institutionLogoUrl}" alt="${options.institutionName || 'Logo Institución'}" />`
        : `<div class="institution-logo-placeholder">Logo<br/>Institución</div>`
      }
    </div>
  </div>

  <div class="header">
    <h1>Ficha de Seguimiento</h1>
    <p><strong>Estudiante:</strong> ${studentName}</p>
    ${options?.institutionName ? `<p><strong>Institución:</strong> ${options.institutionName}</p>` : ''}
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

  <div class="signatures-section">
    <p class="signatures-title">Firmas de Conformidad</p>
    <div class="signatures-container">
      <div class="signature-block">
        <div class="signature-line"></div>
        <p class="signature-label">Firma del Estudiante</p>
        <p class="signature-name">${studentName}</p>
        <p class="signature-role">Estudiante</p>
      </div>
      <div class="signature-block">
        <div class="signature-line"></div>
        <p class="signature-label">Firma del Profesional</p>
        <p class="signature-name">____________________</p>
        <p class="signature-role">Profesional Responsable</p>
      </div>
    </div>
  </div>

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
