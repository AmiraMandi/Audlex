/**
 * ============================================================
 * Audlex — Teams Integration
 * ============================================================
 * 
 * Send notifications to Microsoft Teams:
 * - Compliance status updates
 * - Deadline reminders
 * - New requirement assignments
 * - System classification results
 */

interface TeamsConfig {
  webhookUrl: string;
}

interface AdaptiveCard {
  type: "message";
  attachments: Array<{
    contentType: "application/vnd.microsoft.card.adaptive";
    content: {
      $schema: string;
      type: "AdaptiveCard";
      version: string;
      body: any[];
      actions?: any[];
    };
  }>;
}

export class TeamsIntegration {
  private config: TeamsConfig;

  constructor(config: TeamsConfig) {
    this.config = config;
  }

  /**
   * Send adaptive card to Teams channel
   */
  private async sendCard(card: AdaptiveCard): Promise<{ success: boolean }> {
    try {
      const response = await fetch(this.config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      });

      return { success: response.ok };
    } catch (error) {
      console.error("Failed to send Teams message:", error);
      return { success: false };
    }
  }

  /**
   * Notify new compliance requirement
   */
  async notifyNewRequirement(data: {
    systemName: string;
    requirementTitle: string;
    article: string;
    priority: "high" | "medium" | "low";
    assignedTo?: string;
    url: string;
  }): Promise<{ success: boolean }> {
    const priorityColor = data.priority === "high" ? "attention" : data.priority === "medium" ? "warning" : "good";

    const card: AdaptiveCard = {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.4",
            body: [
              {
                type: "TextBlock",
                text: "🔔 New Compliance Requirement",
                weight: "bolder",
                size: "large",
              },
              {
                type: "TextBlock",
                text: data.requirementTitle,
                weight: "bolder",
                wrap: true,
              },
              {
                type: "FactSet",
                facts: [
                  { title: "System:", value: data.systemName },
                  { title: "Article:", value: data.article },
                  { title: "Priority:", value: data.priority.toUpperCase() },
                  ...(data.assignedTo ? [{ title: "Assigned to:", value: data.assignedTo }] : []),
                ],
              },
              {
                type: "Container",
                style: priorityColor,
                items: [
                  {
                    type: "TextBlock",
                    text: `Priority: ${data.priority.toUpperCase()}`,
                    weight: "bolder",
                  },
                ],
              },
            ],
            actions: [
              {
                type: "Action.OpenUrl",
                title: "View in Audlex",
                url: data.url,
              },
            ],
          },
        },
      ],
    };

    return this.sendCard(card);
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

    const card: AdaptiveCard = {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.4",
            body: [
              {
                type: "TextBlock",
                text: `${riskEmoji} AI System Classified`,
                weight: "bolder",
                size: "large",
              },
              {
                type: "TextBlock",
                text: data.systemName,
                weight: "bolder",
              },
              {
                type: "FactSet",
                facts: [
                  { title: "Risk Level:", value: data.riskLevel.toUpperCase() },
                  { title: "Risk Score:", value: `${data.score}/100` },
                ],
              },
            ],
            actions: [
              {
                type: "Action.OpenUrl",
                title: "View Details",
                url: data.url,
              },
            ],
          },
        },
      ],
    };

    return this.sendCard(card);
  }

  /**
   * Send deadline warning
   */
  async notifyDeadline(data: {
    title: string;
    daysLeft: number;
    url: string;
  }): Promise<{ success: boolean }> {
    const urgency =
      data.daysLeft <= 7 ? "🔴 URGENT" : data.daysLeft <= 30 ? "⚠️ ATTENTION" : "ℹ️ REMINDER";

    const card: AdaptiveCard = {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.4",
            body: [
              {
                type: "TextBlock",
                text: urgency,
                weight: "bolder",
                size: "large",
              },
              {
                type: "TextBlock",
                text: data.title,
                weight: "bolder",
                wrap: true,
              },
              {
                type: "TextBlock",
                text: `⏰ ${data.daysLeft} days remaining`,
                size: "large",
                weight: "bolder",
                color: data.daysLeft <= 7 ? "attention" : "warning",
              },
            ],
            actions: [
              {
                type: "Action.OpenUrl",
                title: "Take Action",
                url: data.url,
              },
            ],
          },
        },
      ],
    };

    return this.sendCard(card);
  }

  /**
   * Send compliance status update
   */
  async notifyComplianceUpdate(data: {
    complianceScore: number;
    totalSystems: number;
    highRiskSystems: number;
    pendingRequirements: number;
    url: string;
  }): Promise<{ success: boolean }> {
    const card: AdaptiveCard = {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.4",
            body: [
              {
                type: "TextBlock",
                text: "📊 Weekly Compliance Report",
                weight: "bolder",
                size: "large",
              },
              {
                type: "ColumnSet",
                columns: [
                  {
                    type: "Column",
                    width: "stretch",
                    items: [
                      {
                        type: "TextBlock",
                        text: "Compliance Score",
                        weight: "bolder",
                      },
                      {
                        type: "TextBlock",
                        text: `${data.complianceScore}%`,
                        size: "extraLarge",
                        weight: "bolder",
                        color: data.complianceScore >= 80 ? "good" : data.complianceScore >= 50 ? "warning" : "attention",
                      },
                    ],
                  },
                ],
              },
              {
                type: "FactSet",
                facts: [
                  { title: "Total Systems:", value: data.totalSystems.toString() },
                  { title: "High Risk Systems:", value: data.highRiskSystems.toString() },
                  { title: "Pending Requirements:", value: data.pendingRequirements.toString() },
                ],
              },
            ],
            actions: [
              {
                type: "Action.OpenUrl",
                title: "View Dashboard",
                url: data.url,
              },
            ],
          },
        },
      ],
    };

    return this.sendCard(card);
  }
}

/**
 * Test Teams webhook
 */
export async function testTeamsWebhook(webhookUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const card: AdaptiveCard = {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.4",
            body: [
              {
                type: "TextBlock",
                text: "✅ Audlex Integration Test",
                weight: "bolder",
                size: "large",
              },
              {
                type: "TextBlock",
                text: "Your Teams integration is working correctly!",
                wrap: true,
              },
            ],
          },
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    });

    if (!response.ok) {
      return { success: false, error: "Invalid webhook URL" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
