import { Context, Next } from 'hono'
import { prisma } from '@neorelis/db'
import type { AuthContext } from './auth'

export enum ProjectRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  REVIEWER = 'REVIEWER',
  VALIDATOR = 'VALIDATOR',
  VIEWER = 'VIEWER',
}

/**
 * Project access control middleware
 * Verifies user has access to the project and attaches project info to context
 */
export function requireProjectAccess(requiredRoles?: ProjectRole[]) {
  return async (c: Context, next: Next) => {
    const authContext = c.get('user') as AuthContext | undefined

    if (!authContext) {
      return c.json(
        {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        401
      )
    }

    // Try to get projectId from various possible param names
    const projectId = c.req.param('projectId') || c.req.param('id') || c.req.query('projectId')

    if (!projectId) {
      return c.json(
        {
          code: 'BAD_REQUEST',
          message: 'Project ID is required',
        },
        400
      )
    }

    try {
      // Check if user is a member of the project
      const membership = await prisma.projectMember.findFirst({
        where: {
          projectId,
          userId: authContext.userId,
        },
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

      if (!membership) {
        return c.json(
          {
            code: 'FORBIDDEN',
            message: 'You do not have access to this project',
          },
          403
        )
      }

      // Check role requirements if specified
      if (requiredRoles && requiredRoles.length > 0) {
        const userRole = membership.role as ProjectRole
        if (!requiredRoles.includes(userRole)) {
          return c.json(
            {
              code: 'FORBIDDEN',
              message: `This action requires one of the following roles: ${requiredRoles.join(', ')}`,
            },
            403
          )
        }
      }

      // Attach project and membership info to context
      c.set('project', membership.project)
      c.set('projectMembership', {
        projectId: membership.projectId,
        userId: membership.userId,
        role: membership.role as ProjectRole,
        joinedAt: membership.addedAt,
      })

      await next()
    } catch (error) {
      console.error('Project access check error:', error)
      return c.json(
        {
          code: 'INTERNAL_ERROR',
          message: 'Failed to verify project access',
        },
        500
      )
    }
  }
}

/**
 * Middleware to require specific project roles
 */
export function requireRole(...roles: ProjectRole[]) {
  return requireProjectAccess(roles)
}

/**
 * Middleware to require manager or admin role
 */
export function requireManagerOrAdmin() {
  return requireProjectAccess([ProjectRole.ADMIN, ProjectRole.MANAGER])
}

/**
 * Middleware to require admin role only
 */
export function requireAdmin() {
  return requireProjectAccess([ProjectRole.ADMIN])
}
