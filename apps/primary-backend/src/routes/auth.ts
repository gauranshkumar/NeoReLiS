import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { generateToken } from '../utils/jwt'
import { authMiddleware } from '../middleware/auth'
import * as userService from '../services/user.service'
import * as userView from '../views/user.view'
import type { AuthContext } from '../middleware/auth'

const auth = new Hono()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(20),
  name: z.string().min(1).max(50),
})

const loginSchema = z
  .object({
    email: z.string().email().optional(),
    username: z.string().optional(),
    password: z.string(),
  })
  .refine((data) => data.email || data.username, {
    message: 'Either email or username is required',
  })

const passwordResetSchema = z.object({
  email: z.string().email(),
})

const passwordResetConfirmSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
})

// POST /api/v1/auth/register — Controller: validate → service → view → response
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json')

  try {
    const existingUser = await userService.findUserByEmailOrUsername(body.email, body.username)
    if (existingUser) {
      return c.json(
        {
          code: 'CONFLICT',
          message:
            existingUser.email === body.email ? 'Email already registered' : 'Username already taken',
        },
        409
      )
    }

    const user = await userService.createUser({
      email: body.email,
      username: body.username,
      name: body.name,
      password: body.password,
    })

    const token = generateToken(user)
    return c.json(
      {
        message: 'User registered successfully',
        ...userView.authResponse(user, token),
      },
      201
    )
  } catch (error) {
    console.error('Registration error:', error)
    return c.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to register user' },
      500
    )
  }
})

// POST /api/v1/auth/login
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json')

  try {
    const user = await userService.validateCredentials(
      body.email,
      body.username,
      body.password
    )
    if (!user) {
      return c.json({ code: 'UNAUTHORIZED', message: 'Invalid credentials' }, 401)
    }
    if (user.active !== 1 || user.state !== 1) {
      return c.json(
        { code: 'FORBIDDEN', message: 'User account is inactive' },
        403
      )
    }

    const token = generateToken(user)
    return c.json({
      message: 'Login successful',
      ...userView.authResponse(user, token),
      user: userView.userWithGroup(user),
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to login' },
      500
    )
  }
})

auth.post('/logout', authMiddleware, async (c) => {
  return c.json({ message: 'Logged out successfully' })
})

auth.get('/me', authMiddleware, async (c) => {
  const authContext = c.get('user')
  return c.json({
    user: userView.userPublic(authContext.user),
  })
})

auth.post('/password-reset', zValidator('json', passwordResetSchema), async (c) => {
  const body = c.req.valid('json')
  try {
    await userService.findUserByEmail(body.email)
    // Don't reveal if email exists (security)
  } catch (error) {
    console.error('Password reset error:', error)
    return c.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to process password reset request' },
      500
    )
  }
  return c.json({
    message: 'If the email exists, a password reset link has been sent',
  })
})

auth.post(
  '/password-reset/confirm',
  zValidator('json', passwordResetConfirmSchema),
  async (c) => {
    // TODO: verify reset token and update password
    return c.json({ message: 'Password reset successfully' })
  }
)

export default auth
