/**
 * ============================================================
 * Audlex — Email Notification Service
 * ============================================================
 * 
 * Sends automated emails for:
 * - Deadline reminders (documents, compliance items)
 * - Team assignments
 * - Compliance status updates
 * - AI Act deadline (August 2, 2026)
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type NotificationType = 
  | "deadline_warning"
  | "document_expiring"
  | "compliance_overdue"
  | "regulation_deadline"
  | "team_assignment"
  | "compliance_completed"
  | "system_classified";

interface EmailNotification {
  to: string;
  type: NotificationType;
  data: Record<string, any>;
  locale?: "es" | "en";
}

const EMAIL_TEMPLATES = {
  es: {
    deadline_warning: {
      subject: "⚠️ Recordatorio: Quedan {days} días para el deadline",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea580c;">⚠️ Recordatorio de deadline</h2>
          <p>Hola {userName},</p>
          <p>Te recordamos que quedan <strong>{days} días</strong> para:</p>
          <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">{itemName}</h3>
            <p style="margin: 0; color: #92400e;">Fecha límite: {deadline}</p>
          </div>
          <p>Estado actual: <strong>{status}</strong></p>
          <a href="{dashboardUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Ver en Audlex
          </a>
        </div>
      `,
    },
    document_expiring: {
      subject: "📄 Documento próximo a vencer: {documentName}",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">📄 Documento próximo a vencer</h2>
          <p>Hola {userName},</p>
          <p>El documento <strong>{documentName}</strong> vence en <strong>{days} días</strong>.</p>
          <p>Sistema afectado: {systemName}</p>
          <p>Es necesario renovar o revisar este documento antes del <strong>{expiryDate}</strong>.</p>
          <a href="{documentUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Revisar documento
          </a>
        </div>
      `,
    },
    compliance_overdue: {
      subject: "🔴 Requisito de compliance atrasado: {itemName}",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">🔴 Requisito atrasado</h2>
          <p>Hola {userName},</p>
          <p>El requisito <strong>{itemName}</strong> lleva <strong>{daysOverdue} días</strong> en estado pendiente.</p>
          <p>Sistema: {systemName}</p>
          <p>Artículo aplicable: {article}</p>
          <p>Te recomendamos priorizar este requisito para mantener tu compliance al día.</p>
          <a href="{checklistUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Ver checklist
          </a>
        </div>
      `,
    },
    regulation_deadline: {
      subject: "⏰ Quedan {days} días para el AI Act (2 de agosto de 2026)",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea580c;">⏰ Deadline del AI Act</h2>
          <p>Hola {userName},</p>
          <p>El Reglamento de IA de la UE entra en vigor el <strong>2 de agosto de 2026</strong>.</p>
          <p>Quedan <strong>{days} días</strong>.</p>
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0; color: #166534;">Estado de tu compliance</h3>
            <p style="margin: 4px 0;">✅ Sistemas registrados: {totalSystems}</p>
            <p style="margin: 4px 0;">📊 Compliance promedio: {complianceScore}%</p>
            <p style="margin: 4px 0;">⚠️ Requisitos pendientes: {pendingItems}</p>
          </div>
          <p><strong>Acciones recomendadas:</strong></p>
          <ul>
            <li>Completar requisitos pendientes</li>
            <li>Generar documentación técnica faltante</li>
            <li>Revisar y actualizar evaluaciones de riesgo</li>
          </ul>
          <a href="{dashboardUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Ver mi dashboard
          </a>
        </div>
      `,
    },
    team_assignment: {
      subject: "👤 Te han asignado: {itemName}",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>👤 Nueva asignación</h2>
          <p>Hola {userName},</p>
          <p><strong>{assignedBy}</strong> te ha asignado el requisito:</p>
          <div style="background: #dbeafe; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">{itemName}</h3>
            <p style="margin: 0;">Sistema: {systemName}</p>
            <p style="margin: 0;">Prioridad: {priority}</p>
          </div>
          <a href="{itemUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Ver requisito
          </a>
        </div>
      `,
    },
    compliance_completed: {
      subject: "✅ Requisito completado: {itemName}",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">✅ Requisito completado</h2>
          <p>Hola {userName},</p>
          <p>¡Enhorabuena! El requisito <strong>{itemName}</strong> ha sido marcado como completado.</p>
          <p>Sistema: {systemName}</p>
          <p>Completado por: <strong>{completedBy}</strong></p>
          <p>Fecha de completado: {completionDate}</p>
          <a href="{itemUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Ver detalles
          </a>
        </div>
      `,
    },
    system_classified: {
      subject: "🎯 Sistema clasificado: {systemName}",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🎯 Sistema de IA clasificado</h2>
          <p>Hola {userName},</p>
          <p>El sistema <strong>{systemName}</strong> ha sido clasificado según la Ley de IA de la UE.</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">Resultados de la clasificación</h3>
            <p style="margin: 4px 0;"><strong>Nivel de riesgo:</strong> {riskLevel}</p>
            <p style="margin: 4px 0;"><strong>Categorías aplicables:</strong> {categories}</p>
            <p style="margin: 4px 0;"><strong>Total de requisitos:</strong> {totalRequirements}</p>
          </div>
          <a href="{systemUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Ver sistema de IA
          </a>
        </div>
      `,
    },
  },
  en: {
    deadline_warning: {
      subject: "⚠️ Reminder: {days} days until deadline",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea580c;">⚠️ Deadline reminder</h2>
          <p>Hello {userName},</p>
          <p>This is a reminder that you have <strong>{days} days</strong> until:</p>
          <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">{itemName}</h3>
            <p style="margin: 0; color: #92400e;">Deadline: {deadline}</p>
          </div>
          <p>Current status: <strong>{status}</strong></p>
          <a href="{dashboardUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            View in Audlex
          </a>
        </div>
      `,
    },
    document_expiring: {
      subject: "📄 Document expiring soon: {documentName}",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">📄 Document expiring soon</h2>
          <p>Hello {userName},</p>
          <p>The document <strong>{documentName}</strong> expires in <strong>{days} days</strong>.</p>
          <p>Affected system: {systemName}</p>
          <p>You need to renew or review this document before <strong>{expiryDate}</strong>.</p>
          <a href="{documentUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Review document
          </a>
        </div>
      `,
    },
    compliance_overdue: {
      subject: "🔴 Overdue compliance requirement: {itemName}",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">🔴 Overdue requirement</h2>
          <p>Hello {userName},</p>
          <p>The requirement <strong>{itemName}</strong> has been pending for <strong>{daysOverdue} days</strong>.</p>
          <p>System: {systemName}</p>
          <p>Applicable article: {article}</p>
          <p>We recommend prioritizing this requirement to keep your compliance up to date.</p>
          <a href="{checklistUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            View checklist
          </a>
        </div>
      `,
    },
    regulation_deadline: {
      subject: "⏰ {days} days until AI Act (August 2, 2026)",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea580c;">⏰ AI Act Deadline</h2>
          <p>Hello {userName},</p>
          <p>The EU AI Regulation comes into force on <strong>August 2, 2026</strong>.</p>
          <p><strong>{days} days</strong> remaining.</p>
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0; color: #166534;">Your compliance status</h3>
            <p style="margin: 4px 0;">✅ Registered systems: {totalSystems}</p>
            <p style="margin: 4px 0;">📊 Average compliance: {complianceScore}%</p>
            <p style="margin: 4px 0;">⚠️ Pending requirements: {pendingItems}</p>
          </div>
          <a href="{dashboardUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            View my dashboard
          </a>
        </div>
      `,
    },
    team_assignment: {
      subject: "👤 You've been assigned: {itemName}",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>👤 New assignment</h2>
          <p>Hello {userName},</p>
          <p><strong>{assignedBy}</strong> has assigned you the requirement:</p>
          <div style="background: #dbeafe; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">{itemName}</h3>
            <p style="margin: 0;">System: {systemName}</p>
            <p style="margin: 0;">Priority: {priority}</p>
          </div>
          <a href="{itemUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            View requirement
          </a>
        </div>
      `,
    },
    compliance_completed: {
      subject: "✅ Completed requirement: {itemName}",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">✅ Requirement completed</h2>
          <p>Hello {userName},</p>
          <p>Congratulations! The requirement <strong>{itemName}</strong> has been marked as completed.</p>
          <p>System: {systemName}</p>
          <p>Completed by: <strong>{completedBy}</strong></p>
          <p>Completion date: {completionDate}</p>
          <a href="{itemUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            View details
          </a>
        </div>
      `,
    },
    system_classified: {
      subject: "🎯 System classified: {systemName}",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🎯 AI System classified</h2>
          <p>Hello {userName},</p>
          <p>The system <strong>{systemName}</strong> has been classified according to the EU AI Act.</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">Classification results</h3>
            <p style="margin: 4px 0;"><strong>Risk level:</strong> {riskLevel}</p>
            <p style="margin: 4px 0;"><strong>Applicable categories:</strong> {categories}</p>
            <p style="margin: 4px 0;"><strong>Total requirements:</strong> {totalRequirements}</p>
          </div>
          <a href="{systemUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            View AI system
          </a>
        </div>
      `,
    },
  },
};

export async function sendNotificationEmail({ to, type, data, locale = "es" }: EmailNotification) {
  const templates = EMAIL_TEMPLATES[locale] as Record<NotificationType, { subject: string; html: string }>;
  const template = templates[type] || (EMAIL_TEMPLATES.es as Record<NotificationType, { subject: string; html: string }>)[type];
  if (!template) {
    console.error(`Email template not found: ${type}`);
    return { success: false, error: "Template not found" };
  }

  let { subject, html } = template;

  // Replace placeholders
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    subject = subject.replace(new RegExp(placeholder, "g"), String(value));
    html = html.replace(new RegExp(placeholder, "g"), String(value));
  });

  try {
    const result = await resend.emails.send({
      from: "Audlex <notificaciones@audlex.com>",
      to,
      subject,
      html,
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Schedule notifications for upcoming deadlines
 */
export async function scheduleDeadlineNotifications() {
  // This would be called by a cron job daily
  // Check for items expiring in 7, 30, 60, 90 days
  // Send appropriate notifications
  
  // Implementation would query DB for upcoming deadlines
  // and call sendNotificationEmail for each
}
