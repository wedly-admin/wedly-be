import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const MAIL_FROM = process.env.MAIL_FROM || "Wedly <noreply@localhost>";

@Injectable()
export class MailService {
  private transporter: Transporter | null = null;

  constructor() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const secure = process.env.SMTP_SECURE === "true";

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      });
    } else {
      console.warn("[MAIL] SMTP not configured: set SMTP_USER and SMTP_PASS in .env. Emails will only be logged to console.");
    }
  }

  /** Returns true if email was sent, false if skipped (no SMTP = log only). */
  async sendVerificationEmail(to: string, verifyUrl: string): Promise<boolean> {
    const subject = "Verify your Wedly account";
    const html = `
      <p>Hi,</p>
      <p>Thanks for signing up for Wedly. Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}" style="color: #c9a962;">Verify my email</a></p>
      <p>Or copy this link: ${verifyUrl}</p>
      <p>This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
      <p>— The Wedly team</p>
    `;
    return this.send(to, subject, html, "[AUTH] Verification link", verifyUrl);
  }

  /** Returns true if email was sent. */
  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
    const subject = "Reset your Wedly password";
    const html = `
      <p>Hi,</p>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}" style="color: #c9a962;">Reset password</a></p>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
      <p>— The Wedly team</p>
    `;
    return this.send(to, subject, html, "[AUTH] Password reset link", resetUrl);
  }

  private async send(
    to: string,
    subject: string,
    html: string,
    logLabel: string,
    linkForLog: string,
  ): Promise<boolean> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: MAIL_FROM,
          to,
          subject,
          html,
        });
        return true;
      } catch (err: any) {
        console.error(`[MAIL] Failed to send ${logLabel} to ${to}:`, err?.message || err);
        if (err?.code === "EAUTH") {
          console.error("[MAIL] Check SMTP_USER and SMTP_PASS (for Gmail use an App Password, not your normal password).");
        }
        return false;
      }
    }
    console.log(`${logLabel} for ${to}: ${linkForLog}`);
    return false;
  }
}
