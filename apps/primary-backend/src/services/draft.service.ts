import { prisma } from '@neorelis/db'

export interface DraftPayload {
  name: string
  currentStep: number
  formData: Record<string, unknown>
}

/**
 * List all drafts for a user, newest first.
 */
export async function listDrafts(userId: string) {
  return prisma.protocolDraft.findMany({
    where: { creatorId: userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      currentStep: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

/**
 * Get a single draft (only if owned by this user).
 */
export async function getDraft(draftId: string, userId: string) {
  return prisma.protocolDraft.findFirst({
    where: { id: draftId, creatorId: userId },
  })
}

/**
 * Upsert a draft — create if it doesn't exist, update if it does.
 * The client generates a UUID for new drafts so the same endpoint works for
 * both creation and updates.
 */
export async function saveDraft(draftId: string, userId: string, payload: DraftPayload) {
  return prisma.protocolDraft.upsert({
    where: { id: draftId },
    create: {
      id: draftId,
      creatorId: userId,
      name: payload.name || 'Untitled Draft',
      currentStep: payload.currentStep,
      formData: payload.formData as any,
    },
    update: {
      name: payload.name || 'Untitled Draft',
      currentStep: payload.currentStep,
      formData: payload.formData as any,
    },
  })
}

/**
 * Delete a draft (only if owned by this user).
 */
export async function deleteDraft(draftId: string, userId: string) {
  // findFirst to enforce ownership, then delete
  const draft = await prisma.protocolDraft.findFirst({
    where: { id: draftId, creatorId: userId },
  })
  if (!draft) return null

  return prisma.protocolDraft.delete({ where: { id: draftId } })
}
