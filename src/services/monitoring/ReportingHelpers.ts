interface ReportData {
  name: string;
  avg: number;
  min: number;
  max: number;
  p95: number;
  unit?: string;
}

export class ReportingHelpers {
  static convertToCSV(data: ReportData[]): string {
    const headers = ['Metric', 'Average', 'Minimum', 'Maximum', 'P95', 'Unit'];
    const rows = data.map(metric => [
      metric.name,
      metric.avg.toFixed(2),
      metric.min.toFixed(2),
      metric.max.toFixed(2),
      metric.p95.toFixed(2),
      metric.unit || 'N/A'
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  static generateHTMLReport(data: ReportData[]): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .metric-row:nth-child(even) { background-color: #f9f9f9; }
            .alert { color: red; }
          </style>
        </head>
        <body>
          <h1>Performance Metrics Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <table>
            <tr>
              <th>Metric</th>
              <th>Average</th>
              <th>Minimum</th>
              <th>Maximum</th>
              <th>P95</th>
              <th>Unit</th>
            </tr>
            ${data.map(metric => `
              <tr class="metric-row">
                <td>${metric.name}</td>
                <td>${metric.avg.toFixed(2)}</td>
                <td>${metric.min.toFixed(2)}</td>
                <td>${metric.max.toFixed(2)}</td>
                <td>${metric.p95.toFixed(2)}</td>
                <td>${metric.unit || 'N/A'}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;
  }

  static async sendEmail(
    recipients: string[],
    subject: string,
    data: string,
    format: 'html' | 'csv'
  ): Promise<void> {
    const emailConfig = {
      from: process.env.SMTP_FROM,
      to: recipients.join(', '),
      subject: `Performance Report: ${subject}`,
      ...(format === 'html' 
        ? { html: data }
        : { text: data, attachments: [{
            filename: 'report.csv',
            content: data
          }]
        })
    };

    // Implement your email sending logic here
    // Example using nodemailer:
    // await transporter.sendMail(emailConfig);
  }

  static async sendToSlack(
    webhookUrl: string,
    channel: string,
    subject: string,
    data: ReportData[]
  ): Promise<void> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Performance Report: ${subject}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '```' + this.formatSlackTable(data) + '```'
        }
      }
    ];

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, blocks })
    });
  }

  private static formatSlackTable(data: ReportData[]): string {
    const rows = data.map(metric => 
      `${metric.name.padEnd(20)} | ${metric.avg.toFixed(2).padStart(8)} | ${metric.unit || 'N/A'}`
    );

    return [
      'Metric               | Average  | Unit',
      '-------------------- | -------- | ----',
      ...rows
    ].join('\n');
  }
} 