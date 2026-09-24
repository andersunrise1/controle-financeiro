import nodemailer, { type Transporter } from "nodemailer";
import { logError } from "./logger";

/**
 * Outgoing email.
 *
 * Everything goes through SMTP so the provider is a configuration choice,
 * not a code change: Brevo, SendGrid, Mailgun and Gmail all speak it, and
 * switching means editing environment variables rather than this file.
 *
 * Nothing here throws on a missing configuration at import time — the app
 * has to keep starting and serving every other route when email isn't set
 * up, exactly like the rest of the project treats its external services.
 */

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

// Who the message appears to be from. Must be an address the provider has
// authorized, or it will accept the API call and then silently drop or
// bounce the message.
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "DIVISA";

export function isEmailConfigured(): boolean {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASSWORD && MAIL_FROM);
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      // 465 is implicit TLS; 587 and 2525 upgrade with STARTTLS after
      // connecting.
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },

      // Without these, a blocked outbound port doesn't fail — it hangs, and
      // nodemailer's own defaults let it hang for around two minutes. The
      // caller is a person who just tapped "send me a code", so they sit on
      // a spinner the whole time and then get the same message they would
      // have got instantly. Failing fast turns that into a normal response
      // plus a real error in the logs.
      //
      // (Hosting providers commonly block 587 to curb spam; Brevo offers
      // 2525 for exactly that case. SMTP_PORT is the knob for it.)
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transporter;
}

export interface SendResult {
  sent: boolean;
}

/**
 * Best-effort send. A provider outage must not turn into a 500 that tells
 * the caller whether an address exists, so failures are logged and reported
 * back as `sent: false` for the caller to decide about.
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<SendResult> {
  if (!isEmailConfigured()) {
    return { sent: false };
  }

  try {
    await getTransporter().sendMail({
      from: `"${MAIL_FROM_NAME}" <${MAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return { sent: true };
  } catch (error) {
    logError("email/send", error);
    return { sent: false };
  }
}
