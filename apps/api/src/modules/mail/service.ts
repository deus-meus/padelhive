import { Resend } from "resend";

export class MailService {
  private readonly enabled: boolean;
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly webUrl: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    const isEnabled = process.env.MAIL_ENABLED === "true";
    this.from = process.env.MAIL_FROM || "noreply@padelhive.com";
    this.webUrl = process.env.APP_WEB_URL || "";

    if (!isEnabled || !apiKey) {
      this.enabled = false;
      this.resend = null;
      console.log(
        "[MailService] Disabled: MAIL_ENABLED is not true or RESEND_API_KEY is missing",
      );
    } else {
      this.enabled = true;
      this.resend = new Resend(apiKey);
    }
  }

  async sendNotificationEmail(input: {
    to: string;
    toName?: string;
    type: string;
    title: string;
    body: string;
    linkUrl?: string;
  }): Promise<void> {
    if (!this.enabled || !this.resend || !input.to) {
      return;
    }

    try {
      let finalLink = "";
      if (input.linkUrl) {
        if (input.linkUrl.startsWith("/")) {
          finalLink = this.webUrl
            ? `${this.webUrl}${input.linkUrl}`
            : input.linkUrl;
        } else {
          finalLink = input.linkUrl;
        }
      }

      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${input.title}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #06121A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F7F7F7;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0C1B26; margin: 40px auto; border: 1px solid rgba(80, 200, 200, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.4);">
            <!-- Header Banner -->
            <tr>
              <td style="padding: 30px 40px 20px 40px; background: linear-gradient(135deg, #0C1B26 0%, #06121A 100%); text-align: center; border-bottom: 1px solid rgba(247, 247, 247, 0.06);">
                <div style="font-size: 24px; font-weight: 800; letter-spacing: 1px; color: #E6FA50;">
                  PADELHIVE
                </div>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 40px 40px 30px 40px;">
                <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #F7F7F7;">
                  ${input.title}
                </h1>
                <p style="font-size: 15px; line-height: 24px; margin: 0 0 24px 0; color: rgba(247, 247, 247, 0.7);">
                  ${input.body}
                </p>
      `;

      if (finalLink) {
        html += `
                <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                  <tr>
                    <td align="center" style="border-radius: 30px; background-color: #E6FA50;">
                      <a href="${finalLink}" style="display: inline-block; padding: 12px 32px; font-size: 15px; font-weight: 700; color: #06121A; text-decoration: none; border-radius: 30px; letter-spacing: 0.5px;">
                        View details
                      </a>
                    </td>
                  </tr>
                </table>
        `;
      }

      html += `
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding: 24px 40px; background-color: #06121A; border-top: 1px solid rgba(247, 247, 247, 0.06); text-align: center;">
                <p style="font-size: 12px; line-height: 18px; margin: 0; color: rgba(247, 247, 247, 0.35);">
                  You received this email because you registered on Padelhive or were invited to a court booking.
                </p>
                <p style="font-size: 12px; margin: 8px 0 0 0; color: rgba(247, 247, 247, 0.35);">
                  &copy; 2026 Padelhive. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      let text = `${input.title}\n\n${input.body}`;
      if (finalLink) {
        text += `\n\nView details: ${finalLink}`;
      }

      await this.resend.emails.send({
        from: this.from,
        to: input.to,
        subject: input.title,
        html,
        text,
      });
    } catch (err) {
      console.warn(
        `[MailService] Failed to send notification email to ${input.to}: ${String(err)}`,
      );
    }
  }
}

export const mailService = new MailService();
