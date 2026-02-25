import { NextResponse } from "next/server";
import { getDashboardStats, getAiSystems, getAssessments, getComplianceItems, getDocuments } from "@/app/actions";
import type { AiSystem, RiskAssessment, ComplianceItem, AppDocument } from "@/types";

export async function GET() {
  try {
    const [stats, systems, assessments, complianceItems, docs] = await Promise.all([
      getDashboardStats(),
      getAiSystems(),
      getAssessments(),
      getComplianceItems(),
      getDocuments(),
    ]);

    // Build risk map
    const riskMap = new Map<string, string>();
    (assessments as RiskAssessment[]).forEach((a) => {
      if (!riskMap.has(a.aiSystemId)) riskMap.set(a.aiSystemId, a.riskLevel);
    });

    const riskLabels: Record<string, string> = {
      unacceptable: "Inaceptable / Unacceptable",
      high: "Alto / High",
      limited: "Limitado / Limited",
      minimal: "Mínimo / Minimal",
    };

    const statusLabels: Record<string, string> = {
      completed: "Completado / Completed",
      in_progress: "En progreso / In progress",
      pending: "Pendiente / Pending",
      not_applicable: "N/A",
    };

    const date = new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Generate HTML for PDF-like report (rendered as downloadable HTML that can be printed to PDF)
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe de Compliance EU AI Act - Audlex</title>
  <style>
    @media print { body { margin: 0; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a2e; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 28px; color: #4f46e5; margin-bottom: 4px; }
    h2 { font-size: 20px; color: #312e81; margin-top: 32px; margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; }
    h3 { font-size: 16px; margin-top: 16px; margin-bottom: 8px; }
    .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; }
    .kpi { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
    .kpi-value { font-size: 28px; font-weight: 700; color: #4f46e5; }
    .kpi-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; color: #374151; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .badge-high { background: #fef3c7; color: #92400e; }
    .badge-unacceptable { background: #fecaca; color: #991b1b; }
    .badge-limited { background: #fef9c3; color: #854d0e; }
    .badge-minimal { background: #dcfce7; color: #166534; }
    .badge-unclassified { background: #f1f5f9; color: #64748b; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
    .compliance-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin-top: 4px; }
    .compliance-fill { height: 100%; background: #4f46e5; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Informe de Compliance EU AI Act</h1>
  <p class="subtitle">EU AI Act Compliance Report &mdash; ${date}</p>

  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-value">${stats.totalSystems}</div>
      <div class="kpi-label">Sistemas IA<br>AI Systems</div>
    </div>
    <div class="kpi">
      <div class="kpi-value">${stats.classifiedSystems}</div>
      <div class="kpi-label">Clasificados<br>Classified</div>
    </div>
    <div class="kpi">
      <div class="kpi-value">${stats.complianceScore}%</div>
      <div class="kpi-label">Score Compliance</div>
    </div>
    <div class="kpi">
      <div class="kpi-value">${stats.totalDocuments}</div>
      <div class="kpi-label">Documentos<br>Documents</div>
    </div>
  </div>

  <h2>Inventario de Sistemas / AI Systems Inventory</h2>
  <table>
    <thead>
      <tr>
        <th>Sistema / System</th>
        <th>Categoría / Category</th>
        <th>Proveedor / Provider</th>
        <th>Riesgo / Risk</th>
        <th>Estado / Status</th>
      </tr>
    </thead>
    <tbody>
      ${(systems as AiSystem[]).map((s) => {
        const risk = riskMap.get(s.id) || "unclassified";
        return `<tr>
          <td><strong>${escapeHtml(s.name)}</strong><br><span style="color:#6b7280;font-size:11px">${escapeHtml(s.purpose || "")}</span></td>
          <td>${escapeHtml(s.category)}</td>
          <td>${escapeHtml(s.provider || "—")}</td>
          <td><span class="badge badge-${risk}">${riskLabels[risk] || risk}</span></td>
          <td>${s.status}</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>

  <h2>Requisitos de Compliance / Compliance Requirements</h2>
  ${(systems as AiSystem[]).map((s) => {
    const items = (complianceItems as ComplianceItem[]).filter((c) => c.aiSystemId === s.id);
    if (!items.length) return "";
    const completed = items.filter((c) => c.status === "completed").length;
    const pct = Math.round((completed / items.length) * 100);
    return `<h3>${escapeHtml(s.name)} — ${completed}/${items.length} (${pct}%)</h3>
    <div class="compliance-bar"><div class="compliance-fill" style="width:${pct}%"></div></div>
    <table>
      <thead><tr><th>Artículo / Article</th><th>Requisito / Requirement</th><th>Estado / Status</th></tr></thead>
      <tbody>
        ${items.map((c) => `<tr>
          <td>${escapeHtml(c.article)}</td>
          <td>${escapeHtml(c.requirement)}</td>
          <td>${statusLabels[c.status] || c.status}</td>
        </tr>`).join("")}
      </tbody>
    </table>`;
  }).join("")}

  <h2>Documentos Generados / Generated Documents</h2>
  <table>
    <thead><tr><th>Documento / Document</th><th>Tipo / Type</th><th>Estado / Status</th><th>Fecha / Date</th></tr></thead>
    <tbody>
      ${(docs as AppDocument[]).map((d) => `<tr>
        <td>${escapeHtml(d.title)}</td>
        <td>${d.type}</td>
        <td>${statusLabels[d.status] || d.status}</td>
        <td>${new Date(d.createdAt).toLocaleDateString("es-ES")}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <div class="footer">
    <p>Generado por Audlex &mdash; Generated by Audlex</p>
    <p>${date}</p>
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Error generating report / Error generando informe" },
      { status: 500 }
    );
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
