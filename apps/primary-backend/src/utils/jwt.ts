import jwt from 'jsonwebtoken'
import type { User } from '@neorelis/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d'

export interface JWTPayload {
  userId: string
  username: string
  email?: string | null
  iat?: number
  exp?: number
}

/**
 * Generate JWT token for a user
 */
export function generateToken(user: Pick<User, 'id' | 'username' | 'email'>): string {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  })
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    }
    throw new Error('Token verification failed')
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  return parts[1]
}
