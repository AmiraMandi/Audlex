/**
 * ============================================================
 * Audlex — Jira Integration
 * ============================================================
 * 
 * Sync compliance requirements with Jira:
 * - Create Jira tickets from Audlex requirements
 * - Update Audlex when Jira tickets are completed
 * - Bi-directional sync
 */

interface JiraConfig {
  domain: string; // e.g., "company.atlassian.net"
  email: string;
  apiToken: string;
  projectKey: string; // e.g., "COMPLIANCE"
}

interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description: string;
  status: string;
  assignee?: string;
}

export class JiraIntegration {
  private config: JiraConfig;
  private baseUrl: string;
  private authHeader: string;

  constructor(config: JiraConfig) {
    this.config = config;
    this.baseUrl = `https://${config.domain}/rest/api/3`;
    this.authHeader = Buffer.from(`${config.email}:${config.apiToken}`).toString("base64");
  }

  /**
   * Create Jira issue from compliance requirement
   */
  async createIssueFromRequirement(requirement: {
    title: string;
    description: string;
    article: string;
    priority: "high" | "medium" | "low";
    systemName: string;
  }): Promise<{ success: boolean; issueKey?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/issue`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${this.authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            project: {
              key: this.config.projectKey,
            },
            summary: `[AI Act] ${requirement.title}`,
            description: {
              type: "doc",
              version: 1,
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: requirement.description,
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: `\nArticle: ${requirement.article}`,
                      marks: [{ type: "strong" }],
                    },
                  ],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: `System: ${requirement.systemName}`,
                    },
                  ],
                },
              ],
            },
            issuetype: {
              name: "Task",
            },
            priority: {
              name: requirement.priority === "high" ? "High" : requirement.priority === "medium" ? "Medium" : "Low",
            },
            labels: ["ai-act-compliance", "audlex"],
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }

      const data = await response.json();
      return { success: true, issueKey: data.key };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get issue status from Jira
   */
  async getIssueStatus(issueKey: string): Promise<{ status: string; done: boolean } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/issue/${issueKey}`, {
        headers: {
          "Authorization": `Basic ${this.authHeader}`,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      const statusName = data.fields.status.name.toLowerCase();
      const done = ["done", "closed", "resolved"].includes(statusName);

      return { status: statusName, done };
    } catch (error) {
      console.error("Failed to get Jira status:", error);
      return null;
    }
  }

  /**
   * Setup webhook to receive updates from Jira
   */
  async setupWebhook(webhookUrl: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/webhook`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${this.authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Audlex Compliance Sync",
          url: webhookUrl,
          events: ["jira:issue_updated"],
          filters: {
            "issue-related-events-section": `project = ${this.config.projectKey} AND labels = audlex`,
          },
        }),
      });

      return { success: response.ok };
    } catch (error) {
      console.error("Failed to setup webhook:", error);
      return { success: false };
    }
  }

  /**
   * Process webhook event from Jira
   */
  static processWebhookEvent(payload: any): {
    issueKey: string;
    status: string;
    completed: boolean;
  } | null {
    if (payload.webhookEvent === "jira:issue_updated" && payload.issue) {
      const issue = payload.issue;
      const status = issue.fields.status.name.toLowerCase();
      const completed = ["done", "closed", "resolved"].includes(status);

      return {
        issueKey: issue.key,
        status,
        completed,
      };
    }

    return null;
  }
}

/**
 * Test Jira connection
 */
export async function testJiraConnection(config: JiraConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const jira = new JiraIntegration(config);
    const response = await fetch(`https://${config.domain}/rest/api/3/myself`, {
      headers: {
        "Authorization": `Basic ${Buffer.from(`${config.email}:${config.apiToken}`).toString("base64")}`,
      },
    });

    if (!response.ok) {
      return { success: false, error: "Invalid credentials" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
