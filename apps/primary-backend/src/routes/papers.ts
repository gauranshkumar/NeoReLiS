import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware } from '../middleware/auth'
import { requireProjectAccess } from '../middleware/project-access'
import type { AuthContext } from '../middleware/auth'
import * as paperService from '../services/paper.service'
import { prisma } from '@neorelis/db'

const papers = new Hono()

// Validation schemas
const createPaperSchema = z.object({
  title: z.string().min(1).max(1000),
  authors: z.string().optional(),
  abstract: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  doi: z.string().optional(),
  url: z.string().url().optional(),
  source: z.enum(['manual', 'bibtex', 'endnote', 'csv']).default('manual'),
  projectId: z.string().min(1),
})

const updatePaperSchema = z.object({
  title: z.string().min(1).max(1000).optional(),
  authors: z.string().optional(),
  abstract: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  doi: z.string().optional(),
  url: z.string().url().optional(),
})

const importPapersSchema = z.object({
  format: z.enum(['bibtex', 'endnote', 'csv']),
  content: z.string().min(1),
  projectId: z.string().min(1),
})

// GET /api/v1/papers - List papers for a project (or all user's projects if no projectId)
papers.get('/', authMiddleware, async (c) => {
  const projectId = c.req.query('projectId')
  const search = c.req.query('search')
  const status = c.req.query('status')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '50')
  const authContext = c.get('user') as AuthContext

  try {
    let effectiveProjectIds: string[] = []

    if (projectId) {
      effectiveProjectIds = [projectId]
    } else {
      // No projectId — fetch papers across all user's projects
      const memberships = await prisma.projectMember.findMany({
        where: { userId: authContext.userId, active: 1 },
        select: { projectId: true },
      })
      effectiveProjectIds = memberships.map((m) => m.projectId)

      if (effectiveProjectIds.length === 0) {
        return c.json({ papers: [], total: 0, page, limit })
      }
    }

    const { papers: paperList, total } = await paperService.findPapersByProjectIds(
      effectiveProjectIds,
      {
        skip: (page - 1) * limit,
        take: limit,
        search,
        status,
      }
    )

    return c.json({
      papers: paperList.map((p) => ({
        id: p.id,
        title: p.title,
        abstract: p.abstract,
        year: p.year,
        doi: p.doi,
        source: p.source,
        projectId: p.projectId,
        status: p.screeningStatus,
        authors: p.authors.map((a) => ({
          firstName: a.author.firstName,
          lastName: a.author.lastName,
        })),
        createdAt: p.addedAt,
        updatedAt: p.addedAt,
      })),
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error('List papers error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch papers' }, 500)
  }
})

// POST /api/v1/papers - Create new paper
papers.post('/', authMiddleware, zValidator('json', createPaperSchema), async (c) => {
  const body = c.req.valid('json')
  const authContext = c.get('user') as AuthContext

  try {
    const paper = await paperService.createPaper({
      title: body.title,
      authors: body.authors,
      abstract: body.abstract,
      year: body.year,
      doi: body.doi,
      url: body.url,
      source: body.source,
      projectId: body.projectId,
      addedBy: authContext.userId,
    })

    return c.json({ paper }, 201)
  } catch (error) {
    console.error('Create paper error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to create paper' }, 500)
  }
})

// GET /api/v1/papers/:id - Get paper by ID (with venue + project context)
papers.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')

  try {
    const paper = await prisma.paper.findUnique({
      where: { id, active: 1 },
      include: {
        venue: { select: { name: true, type: true } },
        authors: {
          include: { author: true },
          orderBy: { order: 'asc' },
        },
        project: {
          select: { id: true, title: true, label: true, status: true },
        },
      },
    })

    if (!paper) {
      return c.json({ code: 'NOT_FOUND', message: 'Paper not found' }, 404)
    }

    return c.json({
      paper: {
        id: paper.id,
        title: paper.title,
        abstract: paper.abstract,
        year: paper.year,
        doi: paper.doi,
        source: paper.source,
        screeningStatus: paper.screeningStatus,
        additionMode: paper.additionMode,
        bibtexKey: paper.bibtexKey,
        createdAt: paper.addedAt,
        projectId: paper.projectId,
        project: paper.project,
        venue: paper.venue ? { name: paper.venue.name, type: paper.venue.type } : null,
        authors: paper.authors.map((a) => ({
          firstName: a.author.firstName,
          lastName: a.author.lastName,
          order: a.order,
        })),
      },
    })
  } catch (error) {
    console.error('Get paper error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch paper' }, 500)
  }
})

// PUT /api/v1/papers/:id - Update paper
papers.put('/:id', authMiddleware, zValidator('json', updatePaperSchema), async (c) => {
  const id = c.req.param('id')
  const body = c.req.valid('json')

  try {
    const paper = await paperService.updatePaper(id, body)

    if (!paper) {
      return c.json({ code: 'NOT_FOUND', message: 'Paper not found' }, 404)
    }

    return c.json({ paper })
  } catch (error) {
    console.error('Update paper error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to update paper' }, 500)
  }
})

// DELETE /api/v1/papers/:id - Delete paper
papers.delete('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')

  try {
    await paperService.deletePaper(id)
    return c.json({ message: 'Paper deleted successfully' })
  } catch (error) {
    console.error('Delete paper error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to delete paper' }, 500)
  }
})

// POST /api/v1/papers/import - Import papers from BibTeX/EndNote/CSV
papers.post('/import', authMiddleware, zValidator('json', importPapersSchema), async (c) => {
  const body = c.req.valid('json')

  // TODO: Implement actual import logic with bibler service
  return c.json({
    message: `Importing papers from ${body.format}`,
    imported: 0,
    errors: [],
  }, 202)
})

// GET /api/v1/papers/:id/export - Export paper as BibTeX/CSV
papers.get('/:id/export', authMiddleware, async (c) => {
  const id = c.req.param('id')
  const format = c.req.query('format') || 'bibtex'

  // TODO: Implement actual export
  return c.json({
    format,
    content: '',
  })
})

// POST /api/v1/papers/export - Export multiple papers
papers.post('/export', authMiddleware, async (c) => {
  const body = await c.req.json()
  const { paperIds, format } = body

  // TODO: Implement actual export
  return c.json({
    format: format || 'bibtex',
    content: '',
    count: paperIds?.length || 0,
  })
})

export default papers
