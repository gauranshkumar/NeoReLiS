import { Hono } from 'hono'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth'
import type { AuthContext } from '../middleware/auth'
import * as userService from '../services/user.service'

const users = new Hono()

// All user routes require authentication
users.use('*', authMiddleware)

/**
 * GET /search?q=<query>&excludeIds=id1,id2&limit=20
 * Search users by name, username, or email (for adding members to projects).
 */
users.get('/search', async (c) => {
  const q = c.req.query('q') || ''
  const excludeIdsParam = c.req.query('excludeIds') || ''
  const limitParam = c.req.query('limit')

  if (q.length < 2) {
    return c.json({ users: [] })
  }

  const excludeIds = excludeIdsParam
    ? excludeIdsParam.split(',').filter(Boolean)
    : []

  const limit = limitParam ? Math.min(parseInt(limitParam, 10), 50) : 20

  try {
    const results = await userService.searchUsers(q, { excludeIds, limit })
    return c.json({ users: results })
  } catch (error) {
    console.error('User search error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to search users' }, 500)
  }
})

export default users
