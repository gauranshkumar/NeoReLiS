import { prisma, Prisma } from '@neorelis/db'

type NotificationType =
  | 'PROJECT_CREATED'
  | 'DRAFT_SAVED'
  | 'PROJECT_MEMBER_ADDED'
  | 'PROJECT_MEMBER_REMOVED'
  | 'PROJECT_ROLE_CHANGED'
  | 'SCREENING_ASSIGNED'
  | 'GENERAL'

export async function createNotification(params: {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data ? (params.data as Prisma.InputJsonValue) : undefined,
    },
  })
}

export async function getUserNotifications(
  userId: string,
  options?: { limit?: number; unreadOnly?: boolean }
) {
  const limit = options?.limit ?? 30

  return prisma.notification.findMany({
    where: {
      userId,
      ...(options?.unreadOnly ? { read: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, read: false },
  })
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  })
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  })
}

export async function deleteNotification(notificationId: string, userId: string) {
  return prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  })
}
