import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const manager = new Hono()

// Validation schemas
const createOperationSchema = z.object({
  projectId: z.string().min(1),
  entityType: z.string().min(1),
  operation: z.string().min(1),
  parameters: z.record(z.any()).optional(),
})

const executeOperationSchema = z.object({
  operationId: z.string().min(1),
  parameters: z.record(z.any()).optional(),
})

// GET /api/v1/manager/operations - List available operations for entity type
manager.get('/operations', async (c) => {
  const projectId = c.req.query('projectId')
  const entityType = c.req.query('entityType')
  
  // TODO: Get available operations from project config
  return c.json({
    operations: [
      {
        id: 'list',
        name: 'List',
        description: 'List all elements of this entity type',
        entityType: entityType || 'paper',
        parameters: [],
      },
      {
        id: 'add',
        name: 'Add',
        description: 'Add a new element',
        entityType: entityType || 'paper',
        parameters: ['data'],
      },
      {
        id: 'update',
        name: 'Update',
        description: 'Update an existing element',
        entityType: entityType || 'paper',
        parameters: ['id', 'data'],
      },
      {
        id: 'remove',
        name: 'Remove',
        description: 'Remove an element',
        entityType: entityType || 'paper',
        parameters: ['id'],
      },
    ]
  })
})

// POST /api/v1/manager/operations - Execute operation
manager.post('/operations', zValidator('json', createOperationSchema), async (c) => {
  const body = c.req.valid('json')

  // TODO: Execute operation based on entity config and operation registry
  return c.json({
    operation: {
      id: '1',
      projectId: body.projectId,
      entityType: body.entityType,
      operation: body.operation,
      status: 'completed',
      result: {},
      executedAt: new Date().toISOString(),
    }
  }, 201)
})

// GET /api/v1/manager/entities - List available entity types for project
manager.get('/entities', async (c) => {
  const projectId = c.req.query('projectId')
  
  // TODO: Get entity types from project configuration
  return c.json({
    entities: [
      {
        type: 'paper',
        name: 'Paper',
        description: 'Research papers',
        operations: ['list', 'add', 'update', 'remove', 'detail'],
      },
      {
        type: 'classification',
        name: 'Classification',
        description: 'Classification entries',
        operations: ['list', 'add', 'update', 'remove'],
      },
      {
        type: 'reference',
        name: 'Reference',
        description: 'Reference table entries',
        operations: ['list', 'add', 'update', 'remove'],
      },
    ]
  })
})

// GET /api/v1/manager/entities/:entityType/config - Get entity configuration
manager.get('/entities/:entityType/config', async (c) => {
  const entityType = c.req.param('entityType')
  const projectId = c.req.query('projectId')

  // TODO: Get entity configuration from project config
  return c.json({
    entityType,
    projectId: projectId || '1',
    config: {
      table: entityType,
      fields: [
        { name: 'id', type: 'integer', primary: true },
        { name: 'name', type: 'string', required: true },
        { name: 'value', type: 'string', required: false },
      ],
      operations: ['list', 'add', 'update', 'remove', 'detail'],
      permissions: {
        list: ['manager', 'reviewer'],
        add: ['manager'],
        update: ['manager'],
        remove: ['manager'],
      }
    }
  })
})

// GET /api/v1/manager/stored-procedures - List stored procedures for project
manager.get('/stored-procedures', async (c) => {
  const projectId = c.req.query('projectId')
  
  // TODO: Get stored procedures from database
  return c.json({
    procedures: [
      {
        name: 'get_list_paper',
        entityType: 'paper',
        type: 'list',
        status: 'active',
      },
      {
        name: 'get_detail_paper',
        entityType: 'paper',
        type: 'detail',
        status: 'active',
      },
      {
        name: 'add_paper',
        entityType: 'paper',
        type: 'add',
        status: 'active',
      },
    ]
  })
})

// POST /api/v1/manager/stored-procedures/regenerate - Regenerate stored procedures
manager.post('/stored-procedures/regenerate', async (c) => {
  const body = await c.req.json()
  const { projectId, entityType } = body

  // TODO: Regenerate stored procedures for entity type
  return c.json({
    message: 'Stored procedures regenerated',
    projectId: projectId || '1',
    entityType: entityType || 'all',
    regenerated: 10,
  }, 201)
})

// GET /api/v1/manager/config - Get project configuration
manager.get('/config', async (c) => {
  const projectId = c.req.query('projectId')
  
  // TODO: Get project configuration
  return c.json({
    projectId: projectId || '1',
    config: {
      entities: ['paper', 'classification', 'reference'],
      modules: {
        screening: { enabled: true },
        qualityAssessment: { enabled: true },
        dataExtraction: { enabled: true },
      },
      settings: {
        language: 'en',
        dateFormat: 'YYYY-MM-DD',
      }
    }
  })
})

// PUT /api/v1/manager/config - Update project configuration
manager.put('/config', async (c) => {
  const body = await c.req.json()
  const { projectId, config } = body

  // TODO: Update project configuration
  return c.json({
    projectId: projectId || '1',
    config: {
      ...config,
      updatedAt: new Date().toISOString(),
    }
  })
})

// GET /api/v1/manager/health - Check manager service health
manager.get('/health', async (c) => {
  const projectId = c.req.query('projectId')
  
  // TODO: Check project configuration and database connectivity
  return c.json({
    status: 'ok',
    projectId: projectId || '1',
    configLoaded: true,
    databaseConnected: true,
    timestamp: new Date().toISOString(),
  })
})

export default manager
