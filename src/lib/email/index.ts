import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || process.env.EMAIL_FROM || "Audlex <noreply@audlex.com>";

type Locale = "es" | "en";
function m(locale: Locale, es: string, en: string) { return locale === "en" ? en : es; }

// ─── Email templates ──────────────────────────────────────────────

function baseLayout(content: string, locale: Locale = "es") {
  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .logo { font-size: 20px; font-weight: 700; color: #2563eb; margin-bottom: 24px; }
    h1 { font-size: 22px; color: #18181b; margin: 0 0 8px; }
    p { font-size: 14px; color: #52525b; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #2563eb; color: white !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; }
    .btn:hover { background: #1d4ed8; }
    .footer { text-align: center; padding: 24px 0; font-size: 12px; color: #a1a1aa; }
    .highlight { background: #eff6ff; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .highlight strong { color: #2563eb; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-high { background: #fef2f2; color: #dc2626; }
    .badge-limited { background: #fffbeb; color: #d97706; }
    .badge-minimal { background: #f0fdf4; color: #16a34a; }
    .badge-prohibited { background: #18181b; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">🛡️ Audlex</div>
      ${content}
    </div>
    <div class="footer">
      <p>Audlex — ${m(locale, "Compliance con el EU AI Act", "EU AI Act Compliance")}</p>
      <p>${m(locale, "Este es un email automático, no responda directamente.", "This is an automated email, please do not reply directly.")}</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Send functions ───────────────────────────────────────────────

export async function sendWelcomeEmail({
  to,
  name,
  locale = "es",
}: {
  to: string;
  name: string;
  locale?: Locale;
}) {
  const en = locale === "en";
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: en
      ? "Welcome to Audlex — Start your EU AI Act compliance"
      : "Bienvenido a Audlex — Empieza tu compliance con el EU AI Act",
    html: baseLayout(en ? `
      <h1>Welcome, ${name}!</h1>
      <p>Thank you for signing up to Audlex. You're one step away from ensuring compliance with the European AI Regulation.</p>
      <div class="highlight">
        <strong>Where to start?</strong>
        <p style="margin-top:8px">1. Register your first AI system<br/>2. Classify its risk level<br/>3. Generate the required documentation</p>
      </div>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Go to Dashboard</a></p>
      <p>If you have any questions, reply to this email or check our documentation.</p>
    ` : `
      <h1>¡Bienvenido, ${name}!</h1>
      <p>Gracias por registrarte en Audlex. Estás a un paso de asegurar el cumplimiento con el Reglamento Europeo de Inteligencia Artificial.</p>
      <div class="highlight">
        <strong>¿Por dónde empezar?</strong>
        <p style="margin-top:8px">1. Registra tu primer sistema de IA<br/>2. Clasifica su nivel de riesgo<br/>3. Genera la documentación necesaria</p>
      </div>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Ir al Dashboard</a></p>
      <p>Si tienes alguna duda, responde a este email o consulta nuestra documentación.</p>
    `, locale),
  });
}

export async function sendClassificationCompleteEmail({
  to,
  systemName,
  riskLevel,
  obligationCount,
  locale = "es",
}: {
  to: string;
  systemName: string;
  riskLevel: string;
  obligationCount: number;
  locale?: Locale;
}) {
  const en = locale === "en";
  const riskLabels: Record<string, Record<Locale, string>> = {
    prohibited: { es: "Prohibido", en: "Prohibited" },
    high: { es: "Alto", en: "High" },
    limited: { es: "Limitado", en: "Limited" },
    minimal: { es: "Mínimo", en: "Minimal" },
  };

  const badgeClass: Record<string, string> = {
    prohibited: "badge-prohibited",
    high: "badge-high",
    limited: "badge-limited",
    minimal: "badge-minimal",
  };

  const label = riskLabels[riskLevel]?.[locale] || riskLevel;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: en
      ? `Classification complete: ${systemName} — ${label} Risk`
      : `Clasificación completada: ${systemName} — Riesgo ${label}`,
    html: baseLayout(en ? `
      <h1>Classification complete</h1>
      <p>The AI system <strong>${systemName}</strong> has been classified:</p>
      <div class="highlight">
        <p style="margin:0">Risk level: <span class="badge ${badgeClass[riskLevel] || "badge-limited"}">${label}</span></p>
        <p style="margin:8px 0 0">Obligations identified: <strong>${obligationCount}</strong></p>
      </div>
      <p>The next step is to generate the required compliance documentation.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/documentacion" class="btn">Generate documentation</a></p>
    ` : `
      <h1>Clasificación completada</h1>
      <p>El sistema de IA <strong>${systemName}</strong> ha sido clasificado:</p>
      <div class="highlight">
        <p style="margin:0">Nivel de riesgo: <span class="badge ${badgeClass[riskLevel] || "badge-limited"}">${label}</span></p>
        <p style="margin:8px 0 0">Obligaciones identificadas: <strong>${obligationCount}</strong></p>
      </div>
      <p>El siguiente paso es generar la documentación de compliance requerida.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/documentacion" class="btn">Generar documentación</a></p>
    `, locale),
  });
}

export async function sendDocumentGeneratedEmail({
  to,
  documentTitle,
  systemName,
  locale = "es",
}: {
  to: string;
  documentTitle: string;
  systemName: string;
  locale?: Locale;
}) {
  const en = locale === "en";
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: en
      ? `Document generated: ${documentTitle}`
      : `Documento generado: ${documentTitle}`,
    html: baseLayout(en ? `
      <h1>Document generated</h1>
      <p>A new compliance document has been generated:</p>
      <div class="highlight">
        <p style="margin:0"><strong>${documentTitle}</strong></p>
        <p style="margin:4px 0 0">System: ${systemName}</p>
      </div>
      <p>You can review, download or edit it from the documentation section.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/documentacion" class="btn">View documents</a></p>
    ` : `
      <h1>Documento generado</h1>
      <p>Se ha generado un nuevo documento de compliance:</p>
      <div class="highlight">
        <p style="margin:0"><strong>${documentTitle}</strong></p>
        <p style="margin:4px 0 0">Sistema: ${systemName}</p>
      </div>
      <p>Puedes revisarlo, descargarlo o editarlo desde la sección de documentación.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/documentacion" class="btn">Ver documentos</a></p>
    `, locale),
  });
}

export async function sendDeadlineReminderEmail({
  to,
  name,
  daysRemaining,
  pendingSystemsCount,
  pendingDocumentsCount,
  locale = "es",
}: {
  to: string;
  name: string;
  daysRemaining: number;
  pendingSystemsCount: number;
  pendingDocumentsCount: number;
  locale?: Locale;
}) {
  const en = locale === "en";
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: en
      ? `⚠️ ${daysRemaining} days until the EU AI Act deadline`
      : `⚠️ Quedan ${daysRemaining} días para la fecha límite del EU AI Act`,
    html: baseLayout(en ? `
      <h1>Deadline reminder</h1>
      <p>Hi ${name},</p>
      <p>There are <strong style="color:#d97706">${daysRemaining} days</strong> left until the EU AI Act deadline (2 August 2026).</p>
      <div class="highlight">
        <p style="margin:0">Unclassified systems: <strong>${pendingSystemsCount}</strong></p>
        <p style="margin:4px 0 0">Pending documents: <strong>${pendingDocumentsCount}</strong></p>
      </div>
      <p>We recommend completing your compliance as soon as possible to avoid potential penalties.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Go to Dashboard</a></p>
    ` : `
      <h1>Recordatorio de plazo</h1>
      <p>Hola ${name},</p>
      <p>Quedan <strong style="color:#d97706">${daysRemaining} días</strong> para la fecha límite del EU AI Act (2 de agosto de 2026).</p>
      <div class="highlight">
        <p style="margin:0">Sistemas sin clasificar: <strong>${pendingSystemsCount}</strong></p>
        <p style="margin:4px 0 0">Documentos pendientes: <strong>${pendingDocumentsCount}</strong></p>
      </div>
      <p>Te recomendamos completar tu compliance lo antes posible para evitar posibles sanciones.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Ir al Dashboard</a></p>
    `, locale),
  });
}

export async function sendAlertEmail({
  to,
  alertTitle,
  alertMessage,
  severity,
  locale = "es",
}: {
  to: string;
  alertTitle: string;
  alertMessage: string;
  severity: "info" | "warning" | "error" | "success";
  locale?: Locale;
}) {
  const severityLabels: Record<string, Record<Locale, string>> = {
    info: { es: "Información", en: "Info" },
    warning: { es: "Aviso", en: "Warning" },
    error: { es: "Importante", en: "Important" },
    success: { es: "Completado", en: "Complete" },
  };

  const label = severityLabels[severity]?.[locale] || severity;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `[${label}] ${alertTitle}`,
    html: baseLayout(`
      <h1>${alertTitle}</h1>
      <p>${alertMessage}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">${locale === "en" ? "View in Audlex" : "Ver en Audlex"}</a></p>
    `, locale),
  });
}
