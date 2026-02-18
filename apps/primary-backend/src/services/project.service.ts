import { prisma } from '@neorelis/db'
import type { UserRole } from '@prisma/client'

export async function findProjectsByUserId(userId: string) {
  return prisma.projectMember.findMany({
    where: { userId, active: 1 },
    include: {
      project: {
        select: {
          id: true,
          label: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          creator: {
            select: { id: true, username: true, name: true },
          },
        },
      },
    },
    orderBy: { addedAt: 'desc' },
  })
}

export async function findProjectByLabel(label: string) {
  return prisma.project.findUnique({
    where: { label },
  })
}

export async function createProject(params: {
  label: string
  title: string
  description?: string
  creatorId: string
}) {
  return prisma.project.create({
    data: {
      label: params.label,
      title: params.title,
      description: params.description,
      creatorId: params.creatorId,
      status: 'DRAFT',
      members: {
        create: {
          userId: params.creatorId,
          role: 'ADMIN',
          addedBy: params.creatorId,
        },
      },
      config: {
        create: { configType: 'default' },
      },
    },
    include: {
      creator: {
        select: { id: true, username: true, name: true },
      },
    },
  })
}

export async function findProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      label: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      creator: {
        select: { id: true, username: true, name: true },
      },
    },
  })
}

export async function findProjectMembership(projectId: string, userId: string) {
  return prisma.projectMember.findFirst({
    where: { projectId, userId },
    include: {
      project: {
        select: {
          id: true,
          label: true,
          title: true,
          description: true,
        },
      },
    },
  })
}

export async function updateProject(
  projectId: string,
  data: { title?: string; description?: string; status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }
) {
  return prisma.project.update({
    where: { id: projectId },
    data: {
      ...(data.title != null && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
    },
    include: {
      creator: { select: { id: true, username: true, name: true } },
    },
  })
}

export async function archiveProject(projectId: string) {
  return prisma.project.update({
    where: { id: projectId },
    data: { status: 'ARCHIVED', active: 0 },
  })
}

export async function findProjectMembers(projectId: string) {
  return prisma.projectMember.findMany({
    where: { projectId, active: 1 },
    include: {
      user: {
        select: { id: true, username: true, email: true, name: true },
      },
    },
    orderBy: { addedAt: 'desc' },
  })
}

export async function findProjectMemberById(memberId: string) {
  return prisma.projectMember.findUnique({
    where: { id: memberId },
    include: {
      user: {
        select: { id: true, username: true, email: true, name: true },
      },
    },
  })
}

export async function addProjectMember(params: {
  projectId: string
  userId: string
  role: UserRole
  addedBy: string
}) {
  return prisma.projectMember.create({
    data: {
      projectId: params.projectId,
      userId: params.userId,
      role: params.role,
      addedBy: params.addedBy,
    },
    include: {
      user: {
        select: { id: true, username: true, email: true, name: true },
      },
    },
  })
}

export async function updateProjectMemberRole(memberId: string, role: UserRole) {
  return prisma.projectMember.update({
    where: { id: memberId },
    data: { role },
    include: {
      user: {
        select: { id: true, username: true, email: true, name: true },
      },
    },
  })
}

export async function deactivateProjectMember(memberId: string) {
  return prisma.projectMember.update({
    where: { id: memberId },
    data: { active: 0 },
  })
}

export async function findExistingMembership(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
  })
}

export async function reactivateProjectMember(
  memberId: string,
  role: UserRole,
  addedBy: string
) {
  return prisma.projectMember.update({
    where: { id: memberId },
    data: { active: 1, role, addedBy, addedAt: new Date() },
    include: {
      user: {
        select: { id: true, username: true, email: true, name: true },
      },
    },
  })
}

export async function findProjectConfig(projectId: string) {
  return prisma.projectConfig.findUnique({
    where: { projectId },
  })
}

export async function updateProjectConfig(
  projectId: string,
  data: Record<string, unknown>
) {
  const scalar: Record<string, number | string> = {}
  const boolKeys = [
    'importPapersOn',
    'sourcePapersOn',
    'searchStrategyOn',
    'assignPapersOn',
    'screeningOn',
    'screeningValidationOn',
    'screeningResultOn',
    'classificationOn',
  ]
  for (const key of boolKeys) {
    if (data[key] !== undefined) scalar[key] = data[key] ? 1 : 0
  }
  if (data.screeningReviewerNum !== undefined)
    scalar.screeningReviewerNum = Number(data.screeningReviewerNum)
  if (data.screeningConflictType != null) scalar.screeningConflictType = String(data.screeningConflictType)
  if (data.screeningConflictRes != null) scalar.screeningConflictRes = String(data.screeningConflictRes)
  if (data.screeningStatusToValidate != null)
    scalar.screeningStatusToValidate = String(data.screeningStatusToValidate)
  if (data.validationDefaultPercent !== undefined)
    scalar.validationDefaultPercent = Number(data.validationDefaultPercent)

  return prisma.projectConfig.update({
    where: { projectId },
    data: scalar as never,
  })
}
