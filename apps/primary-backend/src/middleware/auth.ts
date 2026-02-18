import { Context, Next } from 'hono'
import { verifyToken, extractTokenFromHeader } from '../utils/jwt'
import { prisma } from '@neorelis/db'

export interface AuthContext {
  userId: string
  username: string
  email?: string | null
  user: {
    id: string
    username: string
    email: string | null
    name: string
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to context
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return c.json(
      {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please provide a valid token.',
      },
      401
    )
  }

  try {
    const payload = verifyToken(token)

    // Fetch user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        active: true,
        state: true,
      },
    })

    if (!user) {
      return c.json(
        {
          code: 'UNAUTHORIZED',
          message: 'User not found',
        },
        401
      )
    }

    if (user.active !== 1 || user.state !== 1) {
      return c.json(
        {
          code: 'FORBIDDEN',
          message: 'User account is inactive',
        },
        403
      )
    }

    // Attach user info to context
    c.set('user', {
      userId: user.id,
      username: user.username,
      email: user.email,
      user,
    } as AuthContext)

    await next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token verification failed'
    return c.json(
      {
        code: 'UNAUTHORIZED',
        message,
      },
      401
    )
  }
}

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  const token = extractTokenFromHeader(authHeader)

  if (token) {
    try {
      const payload = verifyToken(token)
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          active: true,
          state: true,
        },
      })

      if (user && user.active === 1 && user.state === 1) {
        c.set('user', {
          userId: user.id,
          username: user.username,
          email: user.email,
          user,
        } as AuthContext)
      }
    } catch (error) {
      // Silently fail for optional auth
    }
  }

  await next()
}
