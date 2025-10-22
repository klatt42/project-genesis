// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/monitoring-agent/alerts.ts
// PURPOSE: Multi-channel alert system
// GENESIS REF: Week 6 Task 3 - Monitoring Agent
// WSL PATH: ~/project-genesis/agents/monitoring-agent/alerts.ts
// ================================

import { AlertConfig, AlertChannel, AlertSeverity, CodeSnippet } from './types.js';

export class AlertService {
  private config: AlertConfig[];

  constructor(config: AlertConfig[]) {
    this.config = config;
  }

  async sendAlert(options: {
    title: string;
    message: string;
    severity: AlertSeverity;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const { title, message, severity, metadata } = options;

    for (const alertConfig of this.config) {
      if (!alertConfig.enabled) continue;

      try {
        switch (alertConfig.channel) {
          case AlertChannel.SLACK:
            await this.sendSlackAlert(alertConfig, title, message, severity, metadata);
            break;
          case AlertChannel.DISCORD:
            await this.sendDiscordAlert(alertConfig, title, message, severity, metadata);
            break;
          case AlertChannel.EMAIL:
            await this.sendEmailAlert(alertConfig, title, message, severity, metadata);
            break;
          case AlertChannel.WEBHOOK:
            await this.sendWebhookAlert(alertConfig, title, message, severity, metadata);
            break;
        }
      } catch (error) {
        console.error(`Failed to send alert via ${alertConfig.channel}:`, error);
      }
    }
  }

  private async sendSlackAlert(
    config: AlertConfig,
    title: string,
    message: string,
    severity: AlertSeverity,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!config.webhook) return;

    const color = this.getSeverityColor(severity);
    const emoji = this.getSeverityEmoji(severity);

    const payload = {
      text: `${emoji} *${title}*`,
      attachments: [
        {
          color,
          fields: [
            {
              title: 'Message',
              value: message,
              short: false,
            },
            {
              title: 'Severity',
              value: severity.toUpperCase(),
              short: true,
            },
            {
              title: 'Time',
              value: new Date().toISOString(),
              short: true,
            },
            ...this.formatMetadataFields(metadata),
          ],
        },
      ],
    };

    await fetch(config.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  private async sendDiscordAlert(
    config: AlertConfig,
    title: string,
    message: string,
    severity: AlertSeverity,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!config.webhook) return;

    const color = this.getSeverityColorDiscord(severity);
    const emoji = this.getSeverityEmoji(severity);

    const payload = {
      embeds: [
        {
          title: `${emoji} ${title}`,
          description: message,
          color,
          fields: [
            {
              name: 'Severity',
              value: severity.toUpperCase(),
              inline: true,
            },
            {
              name: 'Time',
              value: new Date().toISOString(),
              inline: true,
            },
            ...this.formatMetadataFieldsDiscord(metadata),
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await fetch(config.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  private async sendEmailAlert(
    config: AlertConfig,
    title: string,
    message: string,
    severity: AlertSeverity,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!config.email) return;

    // Implementation would use email service (SendGrid, AWS SES, etc.)
    const emailPayload = {
      to: config.email,
      subject: `[${severity.toUpperCase()}] ${title}`,
      html: this.generateEmailHtml(title, message, severity, metadata),
    };

    console.log('Email alert (not implemented):', emailPayload);

    // Example with SendGrid:
    // await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: config.email }] }],
    //     from: { email: 'alerts@yourdomain.com' },
    //     subject: emailPayload.subject,
    //     content: [{ type: 'text/html', value: emailPayload.html }],
    //   }),
    // });
  }

  private async sendWebhookAlert(
    config: AlertConfig,
    title: string,
    message: string,
    severity: AlertSeverity,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!config.webhook) return;

    const payload = {
      title,
      message,
      severity,
      metadata,
      timestamp: new Date().toISOString(),
    };

    await fetch(config.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'good';
      default:
        return '#808080';
    }
  }

  private getSeverityColorDiscord(severity: AlertSeverity): number {
    switch (severity) {
      case 'critical':
        return 0xff0000; // Red
      case 'error':
        return 0xff6b6b; // Light red
      case 'warning':
        return 0xffa500; // Orange
      case 'info':
        return 0x00ff00; // Green
      default:
        return 0x808080; // Gray
    }
  }

  private getSeverityEmoji(severity: AlertSeverity): string {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  }

  private formatMetadataFields(metadata?: Record<string, any>): any[] {
    if (!metadata) return [];

    return Object.entries(metadata).map(([key, value]) => ({
      title: key,
      value: String(value),
      short: true,
    }));
  }

  private formatMetadataFieldsDiscord(metadata?: Record<string, any>): any[] {
    if (!metadata) return [];

    return Object.entries(metadata).map(([key, value]) => ({
      name: key,
      value: String(value),
      inline: true,
    }));
  }

  private generateEmailHtml(
    title: string,
    message: string,
    severity: AlertSeverity,
    metadata?: Record<string, any>
  ): string {
    const severityColor = this.getEmailSeverityColor(severity);
    const emoji = this.getSeverityEmoji(severity);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${severityColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .metadata { background: white; padding: 15px; border-radius: 4px; margin-top: 15px; }
    .metadata-item { margin: 8px 0; }
    .metadata-key { font-weight: bold; color: #666; }
    .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${emoji} ${title}</h1>
      <p style="margin: 0;">Severity: ${severity.toUpperCase()}</p>
    </div>
    <div class="content">
      <p><strong>Message:</strong></p>
      <p>${message}</p>

      ${metadata ? `
      <div class="metadata">
        <p><strong>Additional Information:</strong></p>
        ${Object.entries(metadata).map(([key, value]) => `
          <div class="metadata-item">
            <span class="metadata-key">${key}:</span> ${String(value)}
          </div>
        `).join('')}
      </div>
      ` : ''}

      <p style="margin-top: 15px; color: #666; font-size: 14px;">
        Time: ${new Date().toLocaleString()}
      </p>
    </div>
    <div class="footer">
      <p>This is an automated alert from your monitoring system.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private getEmailSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case 'critical':
        return '#dc2626';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  }

  generateSetupCode(): CodeSnippet {
    return {
      file: 'lib/alerts.ts',
      code: `// Alert configuration
import { AlertService } from '@genesis/monitoring-agent/alerts';

export const alerts = new AlertService([
  {
    channel: 'slack',
    webhook: process.env.SLACK_WEBHOOK_URL,
    enabled: !!process.env.SLACK_WEBHOOK_URL,
  },
  {
    channel: 'discord',
    webhook: process.env.DISCORD_WEBHOOK_URL,
    enabled: !!process.env.DISCORD_WEBHOOK_URL,
  },
  {
    channel: 'email',
    email: process.env.ALERT_EMAIL,
    enabled: !!process.env.ALERT_EMAIL,
  },
]);

// Usage:
// await alerts.sendAlert({
//   title: 'Deployment Failed',
//   message: 'Production deployment encountered an error',
//   severity: 'error',
//   metadata: {
//     deploymentId: 'abc123',
//     error: 'Build failed',
//     environment: 'production'
//   }
// });

// Common alert scenarios:

export async function alertDeploymentFailed(deploymentId: string, error: string) {
  await alerts.sendAlert({
    title: 'Deployment Failed',
    message: \`Deployment \${deploymentId} failed: \${error}\`,
    severity: 'error',
    metadata: { deploymentId, error }
  });
}

export async function alertHighErrorRate(rate: number, threshold: number) {
  await alerts.sendAlert({
    title: 'High Error Rate Detected',
    message: \`Error rate (\${rate}%) exceeded threshold (\${threshold}%)\`,
    severity: 'warning',
    metadata: { rate, threshold }
  });
}

export async function alertServiceDown(serviceName: string) {
  await alerts.sendAlert({
    title: 'Service Down',
    message: \`\${serviceName} is not responding\`,
    severity: 'critical',
    metadata: { serviceName, timestamp: new Date().toISOString() }
  });
}

export async function alertDeploymentSuccess(deploymentId: string, url: string) {
  await alerts.sendAlert({
    title: 'Deployment Successful',
    message: \`Deployment \${deploymentId} completed successfully\`,
    severity: 'info',
    metadata: { deploymentId, url }
  });
}
`,
      description: 'Alert system configuration and usage examples'
    };
  }

  generateWebhookSetupInstructions(): CodeSnippet[] {
    return [
      {
        file: 'docs/alert-setup-slack.md',
        code: `# Slack Webhook Setup

1. Go to https://api.slack.com/apps
2. Create a new app or select existing
3. Navigate to "Incoming Webhooks"
4. Activate Incoming Webhooks
5. Click "Add New Webhook to Workspace"
6. Select the channel for alerts
7. Copy the webhook URL
8. Add to your .env file:
   \`\`\`
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   \`\`\`
`,
        description: 'Slack webhook setup instructions'
      },
      {
        file: 'docs/alert-setup-discord.md',
        code: `# Discord Webhook Setup

1. Go to your Discord server
2. Click on Server Settings → Integrations
3. Click "Create Webhook"
4. Give it a name and select a channel
5. Copy the webhook URL
6. Add to your .env file:
   \`\`\`
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK/URL
   \`\`\`
`,
        description: 'Discord webhook setup instructions'
      }
    ];
  }
}
