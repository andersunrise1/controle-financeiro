import nodemailer, { type Transporter } from "nodemailer";
import { logError } from "./logger";

/**
 * Outgoing email, by whichever route is configured.
 *
 * SMTP was the original and only path, because it keeps the provider a
 * configuration choice rather than a code change. It turned out not to be
 * reachable from where this app runs: Railway blocks every outbound SMTP
 * port (25, 465, 587, 2525) on its Free, Trial and Hobby plans to protect
 * its IP reputation, and only lifts that on Pro. The symptom is not an
 * error — the connection simply hangs — so it looked like a credential
 * problem for a while.
 *
 * Brevo's HTTPS API goes out over port 443, which no host blocks, so it is
 * preferred when BREVO_API_KEY is set. SMTP is kept as the fallback: it
 * still works anywhere outbound mail ports are open, and keeping it means
 * moving off Brevo later is an environment change, not a rewrite.
 *
 * Nothing here throws on a missing configuration at import time — the app
 * has to keep starting and serving every other route when email isn't set
 * up, exactly like the rest of the project treats its external services.
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

// Who the message appears to be from. Must be an address the provider has
// authorized, or it will accept the API call and then silently drop or
// bounce the message.
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "DIVISA";

function isBrevoApiConfigured(): boolean {
  return Boolean(BREVO_API_KEY && MAIL_FROM);
}

function isSmtpConfigured(): boolean {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASSWORD && MAIL_FROM);
}

export function isEmailConfigured(): boolean {
  return isBrevoApiConfigured() || isSmtpConfigured();
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
      // (Railway blocks all of them below Pro — see the note at the top of
      // this file — which is why the HTTPS API exists as the preferred path.)
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
 * Brevo rejects a bad request with a JSON body explaining why — a sender
 * that isn't verified, a malformed address. Throwing that text rather than
 * a bare status code is what makes the log line actionable instead of
 * "email/send: 400".
 */
async function sendViaBrevoApi(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY as string,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: MAIL_FROM_NAME, email: MAIL_FROM },
      to: [{ email: options.to }],
      subject: options.subject,
      textContent: options.text,
      htmlContent: options.html,
    }),
    // Without a deadline a stalled connection would hang the request the
    // same way the blocked SMTP port did.
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Brevo API ${response.status}: ${detail.slice(0, 300)}`);
  }
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
    if (isBrevoApiConfigured()) {
      await sendViaBrevoApi(options);
    } else {
      await getTransporter().sendMail({
        from: `"${MAIL_FROM_NAME}" <${MAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    }
    return { sent: true };
  } catch (error) {
    logError("email/send", error);
    return { sent: false };
  }
}
