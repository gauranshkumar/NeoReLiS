import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware } from '../middleware/auth'
import { requireProjectAccess, requireManagerOrAdmin } from '../middleware/project-access'
import type { AuthContext } from '../middleware/auth'
import * as projectService from '../services/project.service'
import * as userService from '../services/user.service'
import * as projectView from '../views/project.view'

const projects = new Hono()

const createProjectSchema = z.object({
  label: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9_-]+$/, 'Label must contain only lowercase letters, numbers, hyphens, and underscores'),
  title: z.string().min(1).max(250),
  description: z.string().max(1000).optional(),
})

const updateProjectSchema = z.object({
  title: z.string().min(1).max(250).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
})

const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['ADMIN', 'MANAGER', 'REVIEWER', 'VALIDATOR', 'VIEWER']).default('REVIEWER'),
})

const updateMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'REVIEWER', 'VALIDATOR', 'VIEWER']),
})

// GET /api/v1/projects — Controller: auth → service → view → response
projects.get('/', authMiddleware, async (c) => {
  const authContext = c.get('user') as AuthContext
  try {
    const memberships = await projectService.findProjectsByUserId(authContext.userId)
    const list = memberships.map((m) =>
      projectView.projectSummary(m.project, m.role)
    )
    return c.json({ projects: list })
  } catch (error) {
    console.error('List projects error:', error)
    return c.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to fetch projects' },
      500
    )
  }
})

projects.post('/', authMiddleware, zValidator('json', createProjectSchema), async (c) => {
  const authContext = c.get('user') as AuthContext
  const body = c.req.valid('json')
  try {
    const existing = await projectService.findProjectByLabel(body.label)
    if (existing) {
      return c.json(
        { code: 'CONFLICT', message: 'Project label already exists' },
        409
      )
    }
    const project = await projectService.createProject({
      label: body.label,
      title: body.title,
      description: body.description,
      creatorId: authContext.userId,
    })
    return c.json(
      { project: projectView.projectSummary(project) },
      201
    )
  } catch (error) {
    console.error('Create project error:', error)
    return c.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to create project' },
      500
    )
  }
})

projects.get('/:id', authMiddleware, requireProjectAccess(), async (c) => {
  const project = c.get('project')
  return c.json({ project: projectView.projectDetail(project) })
})

projects.put(
  '/:id',
  authMiddleware,
  requireManagerOrAdmin(),
  zValidator('json', updateProjectSchema),
  async (c) => {
    const projectId = c.req.param('id')
    const body = c.req.valid('json')
    try {
      const project = await projectService.updateProject(projectId, {
        title: body.title,
        description: body.description,
        status: body.status,
      })
      return c.json({ project: projectView.projectSummary(project) })
    } catch (error) {
      console.error('Update project error:', error)
      return c.json(
        { code: 'INTERNAL_ERROR', message: 'Failed to update project' },
        500
      )
    }
  }
)

projects.delete('/:id', authMiddleware, requireManagerOrAdmin(), async (c) => {
  const projectId = c.req.param('id')
  try {
    await projectService.archiveProject(projectId)
    return c.json({ message: 'Project archived successfully' })
  } catch (error) {
    console.error('Archive project error:', error)
    return c.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to archive project' },
      500
    )
  }
})

projects.get('/:id/members', authMiddleware, requireProjectAccess(), async (c) => {
  const projectId = c.req.param('id')
  try {
    const members = await projectService.findProjectMembers(projectId)
    return c.json({
      members: members.map((m) => projectView.projectMember(m)),
    })
  } catch (error) {
    console.error('List members error:', error)
    return c.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to fetch project members' },
      500
    )
  }
})

projects.post(
  '/:id/members',
  authMiddleware,
  requireManagerOrAdmin(),
  zValidator('json', addMemberSchema),
  async (c) => {
    const projectId = c.req.param('id')
    const authContext = c.get('user') as AuthContext
    const body = c.req.valid('json')
    try {
      const user = await userService.findUserById(body.userId)
      if (!user) {
        return c.json(
          { code: 'NOT_FOUND', message: 'User not found' },
          404
        )
      }
      const existing = await projectService.findExistingMembership(projectId, body.userId)
      if (existing) {
        if (existing.active === 1) {
          return c.json(
            { code: 'CONFLICT', message: 'User is already a member of this project' },
            409
          )
        }
        const member = await projectService.reactivateProjectMember(
          existing.id,
          body.role,
          authContext.userId
        )
        return c.json({ member: projectView.projectMember(member) }, 200)
      }
      const member = await projectService.addProjectMember({
        projectId,
        userId: body.userId,
        role: body.role,
        addedBy: authContext.userId,
      })
      return c.json(
        { member: projectView.projectMember(member) },
        201
      )
    } catch (error) {
      console.error('Add member error:', error)
      return c.json(
        { code: 'INTERNAL_ERROR', message: 'Failed to add project member' },
        500
      )
    }
  }
)

projects.delete('/:id/members/:memberId', authMiddleware, requireManagerOrAdmin(), async (c) => {
  const { id: projectId, memberId } = c.req.param()
  try {
    const member = await projectService.findProjectMemberById(memberId)
    if (!member || member.projectId !== projectId) {
      return c.json(
        { code: 'NOT_FOUND', message: 'Member not found' },
        404
      )
    }
    await projectService.deactivateProjectMember(memberId)
    return c.json({ message: 'Member removed successfully' })
  } catch (error) {
    console.error('Remove member error:', error)
    return c.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to remove project member' },
      500
    )
  }
})

projects.put(
  '/:id/members/:memberId',
  authMiddleware,
  requireManagerOrAdmin(),
  zValidator('json', updateMemberSchema),
  async (c) => {
    const { id: projectId, memberId } = c.req.param()
    const body = c.req.valid('json')
    try {
      const member = await projectService.findProjectMemberById(memberId)
      if (!member || member.projectId !== projectId) {
        return c.json(
          { code: 'NOT_FOUND', message: 'Member not found' },
          404
        )
      }
      const updated = await projectService.updateProjectMemberRole(memberId, body.role)
      return c.json({ member: projectView.projectMember(updated) })
    } catch (error) {
      console.error('Update member role error:', error)
      return c.json(
        { code: 'INTERNAL_ERROR', message: 'Failed to update member role' },
        500
      )
    }
  }
)

projects.get('/:id/settings', authMiddleware, requireProjectAccess(), async (c) => {
  const projectId = c.req.param('id')
  try {
    const config = await projectService.findProjectConfig(projectId)
    if (!config) {
      return c.json(
        { code: 'NOT_FOUND', message: 'Project settings not found' },
        404
      )
    }
    return c.json({ settings: projectView.projectSettings(config) })
  } catch (error) {
    console.error('Get settings error:', error)
    return c.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to fetch project settings' },
      500
    )
  }
})

projects.put('/:id/settings', authMiddleware, requireManagerOrAdmin(), async (c) => {
  const projectId = c.req.param('id')
  const body = (await c.req.json()) as Record<string, unknown>
  try {
    const config = await projectService.updateProjectConfig(projectId, body)
    return c.json({
      settings: {
        projectId: config.projectId,
        ...body,
      },
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return c.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to update project settings' },
      500
    )
  }
})

export default projects
