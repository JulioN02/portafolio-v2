/**
 * Email Service
 *
 * Minimal transactional email sender built on nodemailer + SMTP (Gmail).
 * YAGNI: no HTML templates, no retries, no queue, no provider SDKs.
 *
 * The SMTP transporter is built lazily on every send so a missing
 * configuration never crashes the process at import time — it fails loudly
 * (throws) only when someone actually tries to send an email.
 */

import { createTransport } from 'nodemailer';

/** Env vars required to send email. All must be non-empty. */
const REQUIRED_SMTP_VARS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'] as const;

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

/**
 * Read and validate SMTP configuration from the environment.
 * Throws a clear error listing every missing/invalid variable.
 */
function readSmtpConfig(): SmtpConfig {
  const missing = REQUIRED_SMTP_VARS.filter((key) => {
    const value = process.env[key];
    return value === undefined || value.trim() === '';
  });

  if (missing.length > 0) {
    throw new Error(
      `Email service is not configured. Missing environment variables: ${missing.join(', ')}`,
    );
  }

  const port = Number.parseInt(process.env.SMTP_PORT as string, 10);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('SMTP_PORT must be a valid TCP port number.');
  }

  return {
    host: process.env.SMTP_HOST as string,
    port,
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASS as string,
    from: process.env.MAIL_FROM as string,
  };
}

/**
 * Send the password-change verification code as a PLAIN TEXT email.
 * Throws if SMTP is not configured or if the SMTP server rejects the message.
 */
export async function sendVerificationCodeEmail(to: string, code: string): Promise<void> {
  const config = readSmtpConfig();

  // Port 465 uses implicit TLS; 587/25 negotiate STARTTLS.
  const transporter = createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject: 'Tu código de verificación',
    text: [
      `Tu código de verificación es: ${code}`,
      '',
      'Este código expira en 10 minutos.',
      'Si no solicitaste este código, puedes ignorar este correo.',
    ].join('\n'),
  });
}
