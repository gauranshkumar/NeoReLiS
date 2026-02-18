import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const element = new Hono()

// Validation schemas
const createElementSchema = z.object({
  projectId: z.string().min(1),
  entityType: z.string().min(1),
  data: z.record(z.any()),
})

const updateElementSchema = z.object({
  data: z.record(z.any()),
})

const listElementsSchema = z.object({
  projectId: z.string().min(1),
  entityType: z.string().min(1),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
  filters: z.record(z.any()).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
})

// GET /api/v1/element/:entityType - List elements of a specific entity type
element.get('/:entityType', async (c) => {
  const entityType = c.req.param('entityType')
  const projectId = c.req.query('projectId')
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '50')

  // TODO: Get elements from database based on entity type and project config
  return c.json({
    elements: [
      {
        id: '1',
        entityType,
        projectId: projectId || '1',
        data: {
          name: 'Sample Element',
          value: 'Sample Value',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    pagination: {
      page,
      limit,
      total: 1,
      totalPages: 1,
    }
  })
})

// POST /api/v1/element/:entityType - Create element
element.post('/:entityType', zValidator('json', createElementSchema), async (c) => {
  const entityType = c.req.param('entityType')
  const body = c.req.valid('json')

  // TODO: Validate entity type exists in project config
  // TODO: Create element in database
  return c.json({
    element: {
      id: '1',
      entityType,
      projectId: body.projectId,
      data: body.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }, 201)
})

// GET /api/v1/element/:entityType/:id - Get element by ID
element.get('/:entityType/:id', async (c) => {
  const entityType = c.req.param('entityType')
  const id = c.req.param('id')

  // TODO: Get element from database
  return c.json({
    element: {
      id,
      entityType,
      projectId: '1',
      data: {
        name: 'Sample Element',
        value: 'Sample Value',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })
})

// PUT /api/v1/element/:entityType/:id - Update element
element.put('/:entityType/:id', zValidator('json', updateElementSchema), async (c) => {
  const entityType = c.req.param('entityType')
  const id = c.req.param('id')
  const body = c.req.valid('json')

  // TODO: Update element in database
  return c.json({
    element: {
      id,
      entityType,
      data: body.data,
      updatedAt: new Date().toISOString(),
    }
  })
})

// DELETE /api/v1/element/:entityType/:id - Delete element
element.delete('/:entityType/:id', async (c) => {
  const entityType = c.req.param('entityType')
  const id = c.req.param('id')

  // TODO: Delete element from database
  return c.json({ message: 'Element deleted successfully' })
})

// GET /api/v1/element/:entityType/:id/detail - Get detailed element view
element.get('/:entityType/:id/detail', async (c) => {
  const entityType = c.req.param('entityType')
  const id = c.req.param('id')

  // TODO: Get detailed element with related data
  return c.json({
    element: {
      id,
      entityType,
      projectId: '1',
      data: {
        name: 'Sample Element',
        value: 'Sample Value',
        description: 'Detailed description',
      },
      metadata: {
        createdBy: '1',
        updatedBy: '1',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })
})

// POST /api/v1/element/:entityType/bulk - Bulk create elements
element.post('/:entityType/bulk', async (c) => {
  const entityType = c.req.param('entityType')
  const body = await c.req.json()
  const { projectId, elements } = body

  // TODO: Bulk create elements
  return c.json({
    message: 'Elements created',
    count: elements?.length || 0,
    entityType,
  }, 201)
})

// DELETE /api/v1/element/:entityType/bulk - Bulk delete elements
element.delete('/:entityType/bulk', async (c) => {
  const entityType = c.req.param('entityType')
  const body = await c.req.json()
  const { ids } = body

  // TODO: Bulk delete elements
  return c.json({
    message: 'Elements deleted',
    count: ids?.length || 0,
    entityType,
  })
})

// GET /api/v1/element/:entityType/count - Get count of elements
element.get('/:entityType/count', async (c) => {
  const entityType = c.req.param('entityType')
  const projectId = c.req.query('projectId')

  // TODO: Get count from database
  return c.json({
    entityType,
    projectId: projectId || '1',
    count: 100,
  })
})

export default element
