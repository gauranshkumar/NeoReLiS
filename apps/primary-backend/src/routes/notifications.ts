import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { AuthContext } from '../middleware/auth'
import * as notificationService from '../services/notification.service'

const notifications = new Hono()

// All notification routes require authentication
notifications.use('*', authMiddleware)

/**
 * GET / — list current user's notifications (most recent first)
 * Query: ?unreadOnly=true&limit=30
 */
notifications.get('/', async (c) => {
  const auth = c.get('user') as AuthContext
  const unreadOnly = c.req.query('unreadOnly') === 'true'
  const limitParam = c.req.query('limit')
  const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 30

  try {
    const [items, unreadCount] = await Promise.all([
      notificationService.getUserNotifications(auth.userId, { limit, unreadOnly }),
      notificationService.getUnreadCount(auth.userId),
    ])
    return c.json({ notifications: items, unreadCount })
  } catch (error) {
    console.error('List notifications error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch notifications' }, 500)
  }
})

/**
 * GET /unread-count — quick count of unread notifications (for badge polling)
 */
notifications.get('/unread-count', async (c) => {
  const auth = c.get('user') as AuthContext
  try {
    const count = await notificationService.getUnreadCount(auth.userId)
    return c.json({ unreadCount: count })
  } catch (error) {
    console.error('Unread count error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch unread count' }, 500)
  }
})

/**
 * PUT /:id/read — mark a single notification as read
 */
notifications.put('/:id/read', async (c) => {
  const auth = c.get('user') as AuthContext
  const id = c.req.param('id')
  try {
    await notificationService.markAsRead(id, auth.userId)
    return c.json({ message: 'Notification marked as read' })
  } catch (error) {
    console.error('Mark as read error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to mark notification as read' }, 500)
  }
})

/**
 * PUT /read-all — mark all notifications as read
 */
notifications.put('/read-all', async (c) => {
  const auth = c.get('user') as AuthContext
  try {
    await notificationService.markAllAsRead(auth.userId)
    return c.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Mark all as read error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to mark all notifications as read' }, 500)
  }
})

/**
 * DELETE /:id — delete a notification
 */
notifications.delete('/:id', async (c) => {
  const auth = c.get('user') as AuthContext
  const id = c.req.param('id')
  try {
    await notificationService.deleteNotification(id, auth.userId)
    return c.json({ message: 'Notification deleted' })
  } catch (error) {
    console.error('Delete notification error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to delete notification' }, 500)
  }
})

export default notifications
