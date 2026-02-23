import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { generateToken } from '../utils/jwt'
import { authMiddleware } from '../middleware/auth'
import * as userService from '../services/user.service'
import * as emailVerificationService from '../services/email-verification.service'
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

const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, 'Verification code must be 6 digits'),
})

const resendVerificationSchema = z.object({
  email: z.string().email(),
})

// POST /api/v1/auth/register — Controller: validate → service → view → response
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json')

  try {
    const existingUser = await userService.findUserByEmailOrUsername(body.email, body.username)
    if (existingUser) {
      if (existingUser.email === body.email && !existingUser.isEmailVerified) {
        await emailVerificationService.issueVerificationCode(existingUser.id, body.email)
        return c.json(
          {
            message: 'Account already exists and is not verified. A new verification code has been sent.',
            requiresEmailVerification: true,
            email: body.email,
            codeExpiresInMinutes: emailVerificationService.getEmailVerificationExpiryMinutes(),
          },
          200
        )
      }

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

    await emailVerificationService.issueVerificationCode(user.id, body.email)
    return c.json(
      {
        message: 'User registered successfully. Verification code sent to your email.',
        requiresEmailVerification: true,
        email: body.email,
        codeExpiresInMinutes: emailVerificationService.getEmailVerificationExpiryMinutes(),
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
    if (!user.isEmailVerified) {
      return c.json(
        {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email before logging in',
          requiresEmailVerification: true,
          email: user.email,
          codeExpiresInMinutes: emailVerificationService.getEmailVerificationExpiryMinutes(),
        },
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

auth.post('/verify-email', zValidator('json', verifyEmailSchema), async (c) => {
  const body = c.req.valid('json')

  try {
    const user = await userService.findUserByEmailWithGroup(body.email)
    if (!user) {
      return c.json(
        {
          code: 'INVALID_VERIFICATION_CODE',
          message: 'Invalid verification code',
        },
        400
      )
    }

    if (user.isEmailVerified) {
      const token = generateToken(user)
      return c.json({
        message: 'Email already verified',
        ...userView.authResponse(user, token),
        user: userView.userWithGroup(user),
      })
    }

    const result = await emailVerificationService.verifyCode({
      userId: user.id,
      code: body.code,
    })

    if (!result.ok) {
      if (result.reason === 'EXPIRED') {
        return c.json(
          {
            code: 'VERIFICATION_CODE_EXPIRED',
            message: 'Verification code has expired. Please request a new code.',
          },
          400
        )
      }

      return c.json(
        {
          code: 'INVALID_VERIFICATION_CODE',
          message: 'Invalid verification code',
        },
        400
      )
    }

    await emailVerificationService.consumeVerificationCode(user.id)
    const verifiedUser = await userService.markUserEmailVerified(user.id)
    const token = generateToken(verifiedUser)

    return c.json({
      message: 'Email verified successfully',
      ...userView.authResponse(verifiedUser, token),
      user: userView.userWithGroup(verifiedUser),
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return c.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to verify email' },
      500
    )
  }
})

auth.post(
  '/resend-verification-code',
  zValidator('json', resendVerificationSchema),
  async (c) => {
    const body = c.req.valid('json')

    try {
      const user = await userService.findUserByEmail(body.email)
      if (!user) {
        return c.json({
          message: 'If this account exists, a verification code has been sent.',
          codeExpiresInMinutes: emailVerificationService.getEmailVerificationExpiryMinutes(),
        })
      }

      if (user.isEmailVerified) {
        return c.json({
          message: 'Email is already verified.',
        })
      }

      if (!user.email) {
        return c.json(
          {
            code: 'INVALID_USER_EMAIL',
            message: 'User email is not available for verification',
          },
          400
        )
      }

      await emailVerificationService.issueVerificationCode(user.id, user.email)

      return c.json({
        message: 'Verification code sent successfully.',
        codeExpiresInMinutes: emailVerificationService.getEmailVerificationExpiryMinutes(),
      })
    } catch (error) {
      console.error('Resend verification error:', error)
      return c.json(
        { code: 'INTERNAL_ERROR', message: 'Failed to resend verification code' },
        500
      )
    }
  }
)

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
