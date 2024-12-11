import { prisma } from '@/lib/prisma';
import { ErrorDetails } from './ErrorReportingService';
import { sendEmail } from '@/lib/email';
import { postToSlack } from '@/lib/slack';

export interface AlertConfig {
  email?: {
    enabled: boolean;
    recipients: string[];
  };
  slack?: {
    enabled: boolean;
    channel: string;
  };
}

export class AlertService {
  private config: AlertConfig;

  constructor(config: AlertConfig) {
    this.config = config;
  }

  async sendAlert(error: Error, details: ErrorDetails): Promise<void> {
    const alert = await this.createAlert(error, details);
    
    if (this.config.email?.enabled) {
      await this.sendEmailAlert(alert);
    }

    if (this.config.slack?.enabled) {
      await this.sendSlackAlert(alert);
    }
  }

  private async createAlert(error: Error, details: ErrorDetails) {
    return await prisma.alert.create({
      data: {
        title: `${details.severity.toUpperCase()}: ${error.name}`,
        message: error.message,
        severity: details.severity,
        source: details.provider || 'system',
        metadata: {
          ...details.metadata,
          stack: error.stack
        },
        timestamp: new Date()
      }
    });
  }

  private async sendEmailAlert(alert: any) {
    const recipients = this.config.email?.recipients || [];
    const emailContent = this.formatEmailAlert(alert);

    await Promise.all(
      recipients.map(recipient =>
        sendEmail({
          to: recipient,
          subject: alert.title,
          html: emailContent
        })
      )
    );
  }

  private async sendSlackAlert(alert: any) {
    const channel = this.config.slack?.channel;
    if (!channel) return;

    await postToSlack({
      channel,
      text: this.formatSlackAlert(alert)
    });
  }

  private formatEmailAlert(alert: any): string {
    return `
      <h2>${alert.title}</h2>
      <p><strong>Severity:</strong> ${alert.severity}</p>
      <p><strong>Source:</strong> ${alert.source}</p>
      <p><strong>Message:</strong> ${alert.message}</p>
      <pre>${JSON.stringify(alert.metadata, null, 2)}</pre>
    `;
  }

  private formatSlackAlert(alert: any): string {
    return [
      `*${alert.title}*`,
      `*Severity:* ${alert.severity}`,
      `*Source:* ${alert.source}`,
      `*Message:* ${alert.message}`,
      '```',
      JSON.stringify(alert.metadata, null, 2),
      '```'
    ].join('\n');
  }
} 