import { createHash, randomInt } from 'crypto'
import { prisma } from '@neorelis/db'
import { sendVerificationCodeEmail } from './email.service'

const EMAIL_VERIFICATION_EXPIRY_MINUTES = 30

function generateVerificationCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, '0')
}

function hashVerificationCode(code: string) {
  return createHash('sha256').update(code).digest('hex')
}

export function getEmailVerificationExpiryMinutes() {
  return EMAIL_VERIFICATION_EXPIRY_MINUTES
}

export async function issueVerificationCode(userId: string, email: string) {
  const code = generateVerificationCode()
  const codeHash = hashVerificationCode(code)
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MINUTES * 60 * 1000)

  await prisma.emailVerificationCode.upsert({
    where: { userId },
    create: {
      userId,
      codeHash,
      expiresAt,
    },
    update: {
      codeHash,
      expiresAt,
      createdAt: new Date(),
    },
  })

  await sendVerificationCodeEmail({
    to: email,
    code,
    expiresInMinutes: EMAIL_VERIFICATION_EXPIRY_MINUTES,
  })

  return { expiresAt }
}

export async function verifyCode(params: { userId: string; code: string }) {
  const record = await prisma.emailVerificationCode.findUnique({
    where: { userId: params.userId },
  })

  if (!record) {
    return { ok: false as const, reason: 'NOT_FOUND' as const }
  }

  if (record.expiresAt.getTime() < Date.now()) {
    return { ok: false as const, reason: 'EXPIRED' as const }
  }

  const codeHash = hashVerificationCode(params.code)
  if (record.codeHash !== codeHash) {
    return { ok: false as const, reason: 'INVALID' as const }
  }

  return { ok: true as const }
}

export async function consumeVerificationCode(userId: string) {
  await prisma.emailVerificationCode.deleteMany({ where: { userId } })
}
