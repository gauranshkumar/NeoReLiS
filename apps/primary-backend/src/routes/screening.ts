import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const screening = new Hono()

// Validation schemas
const createPhaseSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  order: z.number().int().min(1),
})

const updatePhaseSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  order: z.number().int().min(1).optional(),
})

const createAssignmentSchema = z.object({
  projectId: z.string().min(1),
  phaseId: z.string().min(1),
  paperId: z.string().min(1),
  reviewerId: z.string().min(1),
})

const createDecisionSchema = z.object({
  assignmentId: z.string().min(1),
  decision: z.enum(['include', 'exclude', 'conflict']),
  notes: z.string().optional(),
})

// GET /api/v1/screening/phases - List screening phases for a project
screening.get('/phases', async (c) => {
  const projectId = c.req.query('projectId')
  
  // TODO: Get screening phases from database
  return c.json({
    phases: [
      {
        id: '1',
        projectId: projectId || '1',
        name: 'Phase 1: Title/Abstract Screening',
        description: 'Initial screening based on title and abstract',
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]
  })
})

// POST /api/v1/screening/phases - Create screening phase
screening.post('/phases', zValidator('json', createPhaseSchema), async (c) => {
  const body = c.req.valid('json')

  // TODO: Create screening phase in database
  return c.json({
    phase: {
      id: '1',
      projectId: body.projectId,
      name: body.name,
      description: body.description,
      order: body.order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }, 201)
})

// GET /api/v1/screening/phases/:id - Get phase by ID
screening.get('/phases/:id', async (c) => {
  const id = c.req.param('id')

  // TODO: Get phase from database
  return c.json({
    phase: {
      id,
      projectId: '1',
      name: 'Phase 1: Title/Abstract Screening',
      description: 'Initial screening based on title and abstract',
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })
})

// PUT /api/v1/screening/phases/:id - Update phase
screening.put('/phases/:id', zValidator('json', updatePhaseSchema), async (c) => {
  const id = c.req.param('id')
  const body = c.req.valid('json')

  // TODO: Update phase in database
  return c.json({
    phase: {
      id,
      name: body.name || 'Phase 1',
      description: body.description,
      order: body.order || 1,
      updatedAt: new Date().toISOString(),
    }
  })
})

// DELETE /api/v1/screening/phases/:id - Delete phase
screening.delete('/phases/:id', async (c) => {
  const id = c.req.param('id')

  // TODO: Delete phase from database
  return c.json({ message: 'Phase deleted successfully' })
})

// GET /api/v1/screening/assignments - List assignments
screening.get('/assignments', async (c) => {
  const projectId = c.req.query('projectId')
  const phaseId = c.req.query('phaseId')
  const reviewerId = c.req.query('reviewerId')

  // TODO: Get assignments from database with filters
  return c.json({
    assignments: [
      {
        id: '1',
        projectId: projectId || '1',
        phaseId: phaseId || '1',
        paperId: '1',
        reviewerId: reviewerId || '1',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
    ]
  })
})

// POST /api/v1/screening/assignments - Create assignment
screening.post('/assignments', zValidator('json', createAssignmentSchema), async (c) => {
  const body = c.req.valid('json')

  // TODO: Create assignment in database
  return c.json({
    assignment: {
      id: '1',
      projectId: body.projectId,
      phaseId: body.phaseId,
      paperId: body.paperId,
      reviewerId: body.reviewerId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
  }, 201)
})

// POST /api/v1/screening/assignments/bulk - Bulk create assignments
screening.post('/assignments/bulk', async (c) => {
  const body = await c.req.json()
  const { projectId, phaseId, paperIds, reviewerIds } = body

  // TODO: Create multiple assignments
  return c.json({
    message: 'Assignments created',
    count: (paperIds?.length || 0) * (reviewerIds?.length || 0)
  }, 201)
})

// GET /api/v1/screening/assignments/:id - Get assignment by ID
screening.get('/assignments/:id', async (c) => {
  const id = c.req.param('id')

  // TODO: Get assignment from database
  return c.json({
    assignment: {
      id,
      projectId: '1',
      phaseId: '1',
      paperId: '1',
      reviewerId: '1',
      status: 'pending',
      decision: null,
      createdAt: new Date().toISOString(),
    }
  })
})

// POST /api/v1/screening/decisions - Submit screening decision
screening.post('/decisions', zValidator('json', createDecisionSchema), async (c) => {
  const body = c.req.valid('json')

  // TODO: Create decision and update assignment status
  return c.json({
    decision: {
      id: '1',
      assignmentId: body.assignmentId,
      decision: body.decision,
      notes: body.notes,
      createdAt: new Date().toISOString(),
    }
  }, 201)
})

// GET /api/v1/screening/conflicts - List conflicts
screening.get('/conflicts', async (c) => {
  const projectId = c.req.query('projectId')
  const phaseId = c.req.query('phaseId')

  // TODO: Get conflicts from database (papers with conflicting decisions)
  return c.json({
    conflicts: [
      {
        id: '1',
        projectId: projectId || '1',
        phaseId: phaseId || '1',
        paperId: '1',
        decisions: [
          { reviewerId: '1', decision: 'include' },
          { reviewerId: '2', decision: 'exclude' }
        ],
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
    ]
  })
})

// POST /api/v1/screening/conflicts/:id/resolve - Resolve conflict
screening.post('/conflicts/:id/resolve', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { resolution, resolvedBy } = body

  // TODO: Resolve conflict (manager decision or discussion)
  return c.json({
    conflict: {
      id,
      resolution,
      resolvedBy,
      resolvedAt: new Date().toISOString(),
    }
  })
})

// GET /api/v1/screening/stats - Get screening statistics
screening.get('/stats', async (c) => {
  const projectId = c.req.query('projectId')
  const phaseId = c.req.query('phaseId')

  // TODO: Calculate screening statistics
  return c.json({
    projectId: projectId || '1',
    phaseId: phaseId || '1',
    totalPapers: 100,
    assigned: 80,
    completed: 60,
    conflicts: 5,
    included: 40,
    excluded: 20,
  })
})

export default screening
