import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const dataExtraction = new Hono()

// Validation schemas
const createFormSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  version: z.string().default('1.0'),
  fields: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(['text', 'number', 'date', 'select', 'multiselect', 'boolean']),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
    validation: z.record(z.any()).optional(),
  })),
})

const updateFormSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  fields: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(['text', 'number', 'date', 'select', 'multiselect', 'boolean']),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
    validation: z.record(z.any()).optional(),
  })).optional(),
})

const createAssignmentSchema = z.object({
  projectId: z.string().min(1),
  formId: z.string().min(1),
  paperId: z.string().min(1),
  reviewerId: z.string().min(1),
})

const submitDataSchema = z.object({
  assignmentId: z.string().min(1),
  data: z.record(z.any()),
  status: z.enum(['draft', 'submitted', 'revised']).default('submitted'),
})

// GET /api/v1/data-extraction/forms - List extraction forms for a project
dataExtraction.get('/forms', async (c) => {
  const projectId = c.req.query('projectId')
  
  // TODO: Get extraction forms from database
  return c.json({
    forms: [
      {
        id: '1',
        projectId: projectId || '1',
        name: 'Study Characteristics',
        description: 'Extract study characteristics and outcomes',
        version: '1.0',
        status: 'published',
        fields: [
          { name: 'Study Design', type: 'select', required: true, options: ['RCT', 'Cohort', 'Case-Control'] },
          { name: 'Sample Size', type: 'number', required: true },
          { name: 'Intervention', type: 'text', required: true },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]
  })
})

// POST /api/v1/data-extraction/forms - Create extraction form
dataExtraction.post('/forms', zValidator('json', createFormSchema), async (c) => {
  const body = c.req.valid('json')

  // TODO: Create extraction form in database
  return c.json({
    form: {
      id: '1',
      projectId: body.projectId,
      name: body.name,
      description: body.description,
      version: body.version,
      status: 'draft',
      fields: body.fields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }, 201)
})

// GET /api/v1/data-extraction/forms/:id - Get form by ID
dataExtraction.get('/forms/:id', async (c) => {
  const id = c.req.param('id')

  // TODO: Get extraction form from database
  return c.json({
    form: {
      id,
      projectId: '1',
      name: 'Study Characteristics',
      description: 'Extract study characteristics and outcomes',
      version: '1.0',
      status: 'published',
      fields: [
        { name: 'Study Design', type: 'select', required: true, options: ['RCT', 'Cohort'] },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })
})

// PUT /api/v1/data-extraction/forms/:id - Update form
dataExtraction.put('/forms/:id', zValidator('json', updateFormSchema), async (c) => {
  const id = c.req.param('id')
  const body = c.req.valid('json')

  // TODO: Update extraction form in database
  return c.json({
    form: {
      id,
      name: body.name || 'Study Characteristics',
      description: body.description,
      version: body.version || '1.0',
      fields: body.fields || [],
      updatedAt: new Date().toISOString(),
    }
  })
})

// DELETE /api/v1/data-extraction/forms/:id - Delete form
dataExtraction.delete('/forms/:id', async (c) => {
  const id = c.req.param('id')

  // TODO: Delete extraction form from database
  return c.json({ message: 'Extraction form deleted successfully' })
})

// POST /api/v1/data-extraction/forms/:id/publish - Publish form
dataExtraction.post('/forms/:id/publish', async (c) => {
  const id = c.req.param('id')

  // TODO: Publish form (lock for editing, make available for assignments)
  return c.json({
    form: {
      id,
      status: 'published',
      publishedAt: new Date().toISOString(),
    }
  })
})

// GET /api/v1/data-extraction/assignments - List extraction assignments
dataExtraction.get('/assignments', async (c) => {
  const projectId = c.req.query('projectId')
  const formId = c.req.query('formId')
  const reviewerId = c.req.query('reviewerId')

  // TODO: Get extraction assignments from database
  return c.json({
    assignments: [
      {
        id: '1',
        projectId: projectId || '1',
        formId: formId || '1',
        paperId: '1',
        reviewerId: reviewerId || '1',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
    ]
  })
})

// POST /api/v1/data-extraction/assignments - Create extraction assignment
dataExtraction.post('/assignments', zValidator('json', createAssignmentSchema), async (c) => {
  const body = c.req.valid('json')

  // TODO: Create extraction assignment in database
  return c.json({
    assignment: {
      id: '1',
      projectId: body.projectId,
      formId: body.formId,
      paperId: body.paperId,
      reviewerId: body.reviewerId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
  }, 201)
})

// POST /api/v1/data-extraction/assignments/bulk - Bulk create assignments
dataExtraction.post('/assignments/bulk', async (c) => {
  const body = await c.req.json()
  const { projectId, formId, paperIds, reviewerIds } = body

  // TODO: Create multiple extraction assignments
  return c.json({
    message: 'Assignments created',
    count: (paperIds?.length || 0) * (reviewerIds?.length || 0)
  }, 201)
})

// GET /api/v1/data-extraction/assignments/:id - Get assignment by ID
dataExtraction.get('/assignments/:id', async (c) => {
  const id = c.req.param('id')

  // TODO: Get extraction assignment from database
  return c.json({
    assignment: {
      id,
      projectId: '1',
      formId: '1',
      paperId: '1',
      reviewerId: '1',
      status: 'pending',
      data: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })
})

// POST /api/v1/data-extraction/data - Submit extraction data
dataExtraction.post('/data', zValidator('json', submitDataSchema), async (c) => {
  const body = c.req.valid('json')

  // TODO: Save extraction data and update assignment status
  return c.json({
    extraction: {
      id: '1',
      assignmentId: body.assignmentId,
      data: body.data,
      status: body.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }, 201)
})

// GET /api/v1/data-extraction/data/:assignmentId - Get extraction data
dataExtraction.get('/data/:assignmentId', async (c) => {
  const assignmentId = c.req.param('assignmentId')

  // TODO: Get extraction data from database
  return c.json({
    extraction: {
      assignmentId,
      data: {
        'Study Design': 'RCT',
        'Sample Size': 100,
        'Intervention': 'Treatment A',
      },
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })
})

// GET /api/v1/data-extraction/stats - Get extraction statistics
dataExtraction.get('/stats', async (c) => {
  const projectId = c.req.query('projectId')
  const formId = c.req.query('formId')

  // TODO: Calculate extraction statistics
  return c.json({
    projectId: projectId || '1',
    formId: formId || '1',
    totalPapers: 50,
    assigned: 40,
    completed: 30,
    draft: 5,
    submitted: 25,
  })
})

export default dataExtraction
