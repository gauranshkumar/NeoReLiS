import { Hono } from 'hono'
import { z } from 'zod'
import { ZodError } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware } from '../middleware/auth'
import { requireProjectAccess, requireManagerOrAdmin } from '../middleware/project-access'
import type { AuthContext } from '../middleware/auth'
import * as projectService from '../services/project.service'
import * as draftService from '../services/draft.service'
import * as userService from '../services/user.service'
import * as notificationService from '../services/notification.service'
import * as emailService from '../services/email.service'
import * as projectView from '../views/project.view'
import { prisma } from '@neorelis/db'

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

    // In-app notification (fire-and-forget)
    notificationService.createNotification({
      userId: authContext.userId,
      type: 'PROJECT_CREATED',
      title: 'Project created',
      message: `Your project "${body.title}" has been created successfully`,
      data: { projectId: project.id },
    }).catch((e) => console.error('Notification error:', e))

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

// ─── POST /create-from-protocol — Create a full project from a ReviewProtocol JSON ───
// Used by the wizard UI and future CLI tool.
projects.post('/create-from-protocol', authMiddleware, async (c) => {
  const authContext = c.get('user') as AuthContext
  try {
    const body = await c.req.json()
    const result = await projectService.createProjectFromProtocol(body, authContext.userId)

    // Fetch the created project for the response
    const project = await projectService.findProjectById(result.projectId)
    if (!project) {
      return c.json({ code: 'INTERNAL_ERROR', message: 'Project created but not found' }, 500)
    }

    return c.json(
      {
        project: {
          ...projectView.projectSummary(project, 'ADMIN'),
          protocolApplied: true,
        },
      },
      201
    )
  } catch (error) {
    // Zod validation errors → 422
    if (error instanceof ZodError) {
      return c.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid protocol configuration',
          errors: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        422
      )
    }
    // Label conflict → 409
    if (error instanceof Error && error.message.includes('already exists')) {
      return c.json(
        { code: 'CONFLICT', message: error.message },
        409
      )
    }
    console.error('Create from protocol error:', error)
    return c.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to create project from protocol' },
      500
    )
  }
})

// ─── Protocol Drafts (save & resume wizard) ────────────────────────
// These routes MUST come before /:id to avoid "drafts" matching as a project ID.

const saveDraftSchema = z.object({
  name: z.string().max(200).default('Untitled Draft'),
  currentStep: z.number().int().min(0).max(5).default(0),
  formData: z.record(z.unknown()),
})

// GET /drafts — list caller's drafts
projects.get('/drafts', authMiddleware, async (c) => {
  const auth = c.get('user') as AuthContext
  try {
    const drafts = await draftService.listDrafts(auth.userId)
    return c.json({ drafts })
  } catch (error) {
    console.error('List drafts error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to list drafts' }, 500)
  }
})

// GET /drafts/:draftId — get one draft
projects.get('/drafts/:draftId', authMiddleware, async (c) => {
  const auth = c.get('user') as AuthContext
  const draftId = c.req.param('draftId')
  try {
    const draft = await draftService.getDraft(draftId, auth.userId)
    if (!draft) {
      return c.json({ code: 'NOT_FOUND', message: 'Draft not found' }, 404)
    }
    return c.json({ draft })
  } catch (error) {
    console.error('Get draft error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to get draft' }, 500)
  }
})

// PUT /drafts/:draftId — create or update a draft
projects.put('/drafts/:draftId', authMiddleware, zValidator('json', saveDraftSchema), async (c) => {
  const auth = c.get('user') as AuthContext
  const draftId = c.req.param('draftId')
  const body = c.req.valid('json')
  try {
    const draft = await draftService.saveDraft(draftId, auth.userId, body)

    // In-app notification (fire-and-forget)
    notificationService.createNotification({
      userId: auth.userId,
      type: 'DRAFT_SAVED',
      title: 'Draft saved',
      message: `Your draft "${body.name}" has been saved`,
      data: { draftId },
    }).catch((e) => console.error('Notification error:', e))

    return c.json({ draft })
  } catch (error) {
    console.error('Save draft error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to save draft' }, 500)
  }
})

// DELETE /drafts/:draftId — remove a draft
projects.delete('/drafts/:draftId', authMiddleware, async (c) => {
  const auth = c.get('user') as AuthContext
  const draftId = c.req.param('draftId')
  try {
    const deleted = await draftService.deleteDraft(draftId, auth.userId)
    if (!deleted) {
      return c.json({ code: 'NOT_FOUND', message: 'Draft not found' }, 404)
    }
    return c.json({ message: 'Draft deleted' })
  } catch (error) {
    console.error('Delete draft error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to delete draft' }, 500)
  }
})

projects.get('/:id', authMiddleware, requireProjectAccess(), async (c) => {
  const projectId = c.req.param('id')
  const membership = c.get('projectMembership') as { role: string }

  try {
    // Fetch full project with counts in parallel
    const [project, paperCount, memberCount, members] = await Promise.all([
      projectService.findProjectById(projectId),
      prisma.paper.count({ where: { projectId, active: 1 } }),
      prisma.projectMember.count({ where: { projectId, active: 1 } }),
      projectService.findProjectMembers(projectId),
    ])

    if (!project) {
      return c.json({ code: 'NOT_FOUND', message: 'Project not found' }, 404)
    }

    return c.json({
      project: {
        ...projectView.projectSummary(project, membership.role),
        paperCount,
        memberCount,
        members: members.map((m) => projectView.projectMember(m)),
      },
    })
  } catch (error) {
    console.error('Get project error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch project' }, 500)
  }
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
  const permanent = c.req.query('permanent') === 'true'
  try {
    if (permanent) {
      await projectService.deleteProjectPermanently(projectId)
      return c.json({ message: 'Project deleted permanently' })
    }
    await projectService.archiveProject(projectId)
    return c.json({ message: 'Project archived successfully' })
  } catch (error) {
    console.error('Delete/archive project error:', error)
    return c.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to delete project' },
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
      // Fetch project title and inviter name for notifications
      const [project, inviter] = await Promise.all([
        projectService.findProjectById(projectId),
        userService.findUserById(authContext.userId),
      ])
      const projectTitle = project?.title ?? 'a project'
      const inviterName = inviter?.name ?? 'Someone'

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

        // Send notification + email (fire-and-forget)
        notificationService.createNotification({
          userId: body.userId,
          type: 'PROJECT_MEMBER_ADDED',
          title: 'Added to project',
          message: `${inviterName} added you to "${projectTitle}" as ${body.role}`,
          data: { projectId, role: body.role, addedBy: authContext.userId },
        }).catch((e) => console.error('Notification error:', e))

        if (user.email) {
          emailService.sendProjectMemberAddedEmail({
            to: user.email,
            memberName: user.name,
            projectTitle,
            role: body.role,
            addedByName: inviterName,
          }).catch((e) => console.error('Email error:', e))
        }

        return c.json({ member: projectView.projectMember(member) }, 200)
      }
      const member = await projectService.addProjectMember({
        projectId,
        userId: body.userId,
        role: body.role,
        addedBy: authContext.userId,
      })

      // Send notification + email (fire-and-forget)
      notificationService.createNotification({
        userId: body.userId,
        type: 'PROJECT_MEMBER_ADDED',
        title: 'Added to project',
        message: `${inviterName} added you to "${projectTitle}" as ${body.role}`,
        data: { projectId, role: body.role, addedBy: authContext.userId },
      }).catch((e) => console.error('Notification error:', e))

      if (user.email) {
        emailService.sendProjectMemberAddedEmail({
          to: user.email,
          memberName: user.name,
          projectTitle,
          role: body.role,
          addedByName: inviterName,
        }).catch((e) => console.error('Email error:', e))
      }

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
  const projectId = c.req.param('id')
  const memberId = c.req.param('memberId')
  try {
    const member = await projectService.findProjectMemberById(memberId)
    if (!member || member.projectId !== projectId) {
      return c.json(
        { code: 'NOT_FOUND', message: 'Member not found' },
        404
      )
    }
    await projectService.deactivateProjectMember(memberId)

    // Notify the removed user (fire-and-forget)
    const project = await projectService.findProjectById(projectId)
    notificationService.createNotification({
      userId: member.userId,
      type: 'PROJECT_MEMBER_REMOVED',
      title: 'Removed from project',
      message: `You have been removed from "${project?.title ?? 'a project'}"`,
      data: { projectId },
    }).catch((e) => console.error('Notification error:', e))

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
    const projectId = c.req.param('id')
    const memberId = c.req.param('memberId')
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
