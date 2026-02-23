import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const host = getRequiredEnv("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT || 587);
  // const user = getRequiredEnv("SMTP_USER");
  // const pass = getRequiredEnv("SMTP_PASS");
  // const secure = process.env.SMTP_SECURE === "true" || port === 465;

  transporter = nodemailer.createTransport({
    host,
    port,
  });

  return transporter;
}

export async function sendVerificationCodeEmail(params: {
  to: string;
  code: string;
  expiresInMinutes: number;
}) {
  const from = process.env.SMTP_FROM || getRequiredEnv("SMTP_USER");

  await getTransporter().sendMail({
    from,
    to: params.to,
    subject: "Verify your NeoReLiS account",
    text: `Your NeoReLiS verification code is ${params.code}. This code expires in ${params.expiresInMinutes} minutes.`,
    html: `<p>Your NeoReLiS verification code is:</p><p style="font-size:24px;font-weight:700;letter-spacing:4px;">${params.code}</p><p>This code expires in ${params.expiresInMinutes} minutes.</p>`,
  });
}
