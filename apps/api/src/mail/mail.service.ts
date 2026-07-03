import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly enabled: boolean;
  private readonly resend: Resend;
  private readonly from: string;
  private readonly webUrl: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    const isEnabled = process.env.MAIL_ENABLED === "true";
    this.from = process.env.MAIL_FROM || "noreply@padelhive.com";
    this.webUrl = process.env.APP_WEB_URL || "";

    if (!isEnabled || !apiKey) {
      this.enabled = false;
      this.resend = null as any;
      this.logger.log("MailService disabled: MAIL_ENABLED is not true or RESEND_API_KEY is missing");
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
    if (!this.enabled || !input.to) {
      return;
    }

    try {
      let finalLink = "";
      if (input.linkUrl) {
        if (input.linkUrl.startsWith("/")) {
          finalLink = this.webUrl ? `${this.webUrl}${input.linkUrl}` : input.linkUrl;
        } else {
          finalLink = input.linkUrl;
        }
      }

      let html = `
        <div style="font-family: sans-serif; background-color: #06121A; color: #F7F7F7; padding: 20px;">
          <h2 style="color: #F7F7F7;">${input.title}</h2>
          <p style="color: #F7F7F7;">${input.body}</p>
      `;

      if (finalLink) {
        html += `
          <div style="margin-top: 20px;">
            <a href="${finalLink}" style="background-color: #E6FA50; color: #06121A; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View details</a>
          </div>
        `;
      }

      html += `</div>`;

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
      this.logger.warn(`Failed to send notification email to ${input.to}: ${String(err)}`);
    }
  }
}
