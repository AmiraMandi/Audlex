/**
 * ============================================================
 * Audlex — Slack Integration
 * ============================================================
 * 
 * Send notifications to Slack channels:
 * - New compliance requirements
 * - Deadline reminders
 * - System classification results
 * - Team mentions
 */

interface SlackConfig {
  webhookUrl: string;
  channel?: string;
}

interface SlackMessage {
  text: string;
  blocks?: any[];
  attachments?: any[];
}

export class SlackIntegration {
  private config: SlackConfig;

  constructor(config: SlackConfig) {
    this.config = config;
  }

  /**
   * Send simple text message
   */
  async sendMessage(text: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(this.config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      return { success: response.ok };
    } catch (error) {
      console.error("Failed to send Slack message:", error);
      return { success: false };
    }
  }

  /**
   * Send notification for new compliance requirement
   */
  async notifyNewRequirement(data: {
    systemName: string;
    requirementTitle: string;
    article: string;
    priority: "high" | "medium" | "low";
    assignedTo?: string;
    url: string;
  }): Promise<{ success: boolean }> {
    const priorityEmoji = data.priority === "high" ? "🔴" : data.priority === "medium" ? "🟡" : "🟢";
    
    const message: SlackMessage = {
      text: `New compliance requirement: ${data.requirementTitle}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${priorityEmoji} New Compliance Requirement`,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*System:*\n${data.systemName}`,
            },
            {
              type: "mrkdwn",
              text: `*Article:*\n${data.article}`,
            },
            {
              type: "mrkdwn",
              text: `*Priority:*\n${data.priority.toUpperCase()}`,
            },
            ...(data.assignedTo
              ? [
                  {
                    type: "mrkdwn",
                    text: `*Assigned to:*\n${data.assignedTo}`,
                  },
                ]
              : []),
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${data.requirementTitle}*`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View in Audlex",
              },
              url: data.url,
              style: "primary",
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      return { success: response.ok };
    } catch (error) {
      console.error("Failed to send Slack notification:", error);
      return { success: false };
    }
  }

  /**
   * Send system classification result
   */
  async notifyClassificationResult(data: {
    systemName: string;
    riskLevel: string;
    score: number;
    url: string;
  }): Promise<{ success: boolean }> {
    const riskEmoji = {
      unacceptable: "🚫",
      high: "🔴",
      limited: "🟡",
      minimal: "🟢",
    }[data.riskLevel] || "⚪";

    const riskColor = {
      unacceptable: "danger",
      high: "warning",
      limited: "warning",
      minimal: "good",
    }[data.riskLevel] || "#808080";

    const message: SlackMessage = {
      text: `System classified: ${data.systemName}`,
      attachments: [
        {
          color: riskColor,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `${riskEmoji} System Classification Complete`,
              },
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*System:*\n${data.systemName}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Risk Level:*\n${data.riskLevel.toUpperCase()}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Risk Score:*\n${data.score}/100`,
                },
              ],
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "View Details",
                  },
                  url: data.url,
                  style: "primary",
                },
              ],
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      return { success: response.ok };
    } catch (error) {
      console.error("Failed to send Slack notification:", error);
      return { success: false };
    }
  }

  /**
   * Send deadline warning
   */
  async notifyDeadline(data: {
    title: string;
    daysLeft: number;
    url: string;
  }): Promise<{ success: boolean }> {
    const urgency = data.daysLeft <= 7 ? "🔴 URGENT" : data.daysLeft <= 30 ? "⚠️ ATTENTION" : "ℹ️ REMINDER";

    const message: SlackMessage = {
      text: `Deadline reminder: ${data.title}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${urgency}: Deadline Approaching`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${data.title}*\n\n⏰ *${data.daysLeft} days remaining*`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Take Action",
              },
              url: data.url,
              style: data.daysLeft <= 7 ? "danger" : "primary",
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      return { success: response.ok };
    } catch (error) {
      console.error("Failed to send Slack notification:", error);
      return { success: false };
    }
  }
}

/**
 * Test Slack webhook
 */
export async function testSlackWebhook(webhookUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "✅ Audlex integration test successful!",
      }),
    });

    if (!response.ok) {
      return { success: false, error: "Invalid webhook URL" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
