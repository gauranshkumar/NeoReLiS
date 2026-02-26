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

export async function sendProjectMemberAddedEmail(params: {
  to: string;
  memberName: string;
  projectTitle: string;
  role: string;
  addedByName: string;
}) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@neorelis.app";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  try {
    await getTransporter().sendMail({
      from,
      to: params.to,
      subject: `You've been added to "${params.projectTitle}" on NeoReLiS`,
      text: `Hi ${params.memberName},\n\n${params.addedByName} has added you to the project "${params.projectTitle}" as a ${params.role}.\n\nVisit NeoReLiS to get started: ${frontendUrl}\n\n— NeoReLiS`,
      html: `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#06b6d4;">You've been added to a project</h2>
          <p>Hi ${params.memberName},</p>
          <p><strong>${params.addedByName}</strong> has added you to the project <strong>"${params.projectTitle}"</strong> as a <strong>${params.role}</strong>.</p>
          <div style="margin:24px 0;">
            <a href="${frontendUrl}" style="display:inline-block;padding:12px 24px;background:#06b6d4;color:#000;text-decoration:none;border-radius:8px;font-weight:600;">Open NeoReLiS</a>
          </div>
          <p style="color:#999;font-size:12px;">— NeoReLiS</p>
        </div>
      `,
    });
  } catch (error) {
    // Email is best-effort — don't fail the member-add operation
    console.error("Failed to send member-added email:", error);
  }
}
