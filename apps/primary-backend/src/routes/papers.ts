import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

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

// GET /api/v1/papers - List papers for a project
papers.get('/', async (c) => {
  const projectId = c.req.query('projectId')
  
  // TODO: Get papers from database filtered by projectId
  return c.json({
    papers: [
      {
        id: '1',
        title: 'Sample Paper',
        authors: 'John Doe, Jane Smith',
        abstract: 'This is a sample paper abstract',
        year: 2024,
        doi: '10.1234/sample',
        projectId: projectId || '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    total: 1
  })
})

// POST /api/v1/papers - Create new paper
papers.post('/', zValidator('json', createPaperSchema), async (c) => {
  const body = c.req.valid('json')

  // TODO: Create paper in database
  return c.json({
    paper: {
      id: '1',
      title: body.title,
      authors: body.authors,
      abstract: body.abstract,
      year: body.year,
      doi: body.doi,
      url: body.url,
      source: body.source,
      projectId: body.projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }, 201)
})

// GET /api/v1/papers/:id - Get paper by ID
papers.get('/:id', async (c) => {
  const id = c.req.param('id')

  // TODO: Get paper from database with project membership check
  return c.json({
    paper: {
      id,
      title: 'Sample Paper',
      authors: 'John Doe, Jane Smith',
      abstract: 'This is a sample paper abstract',
      year: 2024,
      doi: '10.1234/sample',
      projectId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })
})

// PUT /api/v1/papers/:id - Update paper
papers.put('/:id', zValidator('json', updatePaperSchema), async (c) => {
  const id = c.req.param('id')
  const body = c.req.valid('json')

  // TODO: Update paper in database
  return c.json({
    paper: {
      id,
      title: body.title || 'Sample Paper',
      authors: body.authors,
      abstract: body.abstract,
      year: body.year,
      doi: body.doi,
      url: body.url,
      updatedAt: new Date().toISOString(),
    }
  })
})

// DELETE /api/v1/papers/:id - Delete paper
papers.delete('/:id', async (c) => {
  const id = c.req.param('id')

  // TODO: Delete paper from database
  return c.json({ message: 'Paper deleted successfully' })
})

// POST /api/v1/papers/import - Import papers from BibTeX/EndNote/CSV
papers.post('/import', zValidator('json', importPapersSchema), async (c) => {
  const body = c.req.valid('json')

  // TODO: Parse and import papers based on format
  // - BibTeX: Use bibler service
  // - EndNote: Parse EndNote format
  // - CSV: Parse CSV and normalize
  return c.json({
    message: `Importing papers from ${body.format}`,
    imported: 0,
    errors: []
  }, 202)
})

// GET /api/v1/papers/:id/export - Export paper as BibTeX/CSV
papers.get('/:id/export', async (c) => {
  const id = c.req.param('id')
  const format = c.req.query('format') || 'bibtex'

  // TODO: Export paper in requested format
  return c.json({
    format,
    content: `@article{sample2024,\n  title={Sample Paper},\n  author={Doe, John and Smith, Jane},\n  year={2024}\n}`
  })
})

// POST /api/v1/papers/export - Export multiple papers
papers.post('/export', async (c) => {
  const body = await c.req.json()
  const { paperIds, format } = body

  // TODO: Export multiple papers in requested format
  return c.json({
    format: format || 'bibtex',
    content: '',
    count: paperIds?.length || 0
  })
})

export default papers
