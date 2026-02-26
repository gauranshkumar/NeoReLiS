import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '@neorelis/db'
import { authMiddleware } from '../middleware/auth'
import type { AuthContext } from '../middleware/auth'

const reporting = new Hono()

// Validation schemas
const generateReportSchema = z.object({
  projectId: z.string().min(1),
  type: z.enum(['screening', 'quality_assessment', 'data_extraction', 'summary', 'prisma']),
  format: z.enum(['json', 'csv', 'pdf', 'html']).default('json'),
  filters: z.record(z.any()).optional(),
})

const exportDataSchema = z.object({
  projectId: z.string().min(1),
  entity: z.enum(['papers', 'screening', 'quality_assessment', 'data_extraction']),
  format: z.enum(['csv', 'bibtex', 'json', 'excel']).default('csv'),
  filters: z.record(z.any()).optional(),
})

// GET /api/v1/reporting/reports - List available reports for a project
reporting.get('/reports', async (c) => {
  const projectId = c.req.query('projectId')

  try {
    // TODO: Get available reports from database or generate list
    return c.json({
      reports: [
        {
          id: '1',
          projectId: projectId || '1',
          type: 'screening',
          name: 'Screening Progress Report',
          description: 'Overview of screening progress by phase',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          projectId: projectId || '1',
          type: 'prisma',
          name: 'PRISMA Flow Diagram',
          description: 'PRISMA flow diagram data',
          createdAt: new Date().toISOString(),
        }
      ]
    })
  } catch (error) {
    console.error('List reports error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to list reports' }, 500)
  }
})

// POST /api/v1/reporting/generate - Generate a report
reporting.post('/generate', zValidator('json', generateReportSchema), async (c) => {
  const body = c.req.valid('json')

  try {
    // TODO: Generate report based on type and format
    return c.json({
      report: {
        id: '1',
        projectId: body.projectId,
        type: body.type,
        format: body.format,
        status: 'completed',
        data: {},
        createdAt: new Date().toISOString(),
      }
    }, 201)
  } catch (error) {
    console.error('Generate report error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to generate report' }, 500)
  }
})

// GET /api/v1/reporting/reports/:id - Get report by ID
reporting.get('/reports/:id', async (c) => {
  const id = c.req.param('id')
  const format = c.req.query('format') || 'json'

  try {
    // TODO: Get report from database or regenerate
    return c.json({
      report: {
        id,
        projectId: '1',
        type: 'screening',
        format,
        status: 'completed',
        data: {
          totalPapers: 100,
          screened: 80,
          included: 40,
          excluded: 40,
        },
        createdAt: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Get report error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to get report' }, 500)
  }
})

// GET /api/v1/reporting/reports/:id/download - Download report file
reporting.get('/reports/:id/download', async (c) => {
  const id = c.req.param('id')
  const format = c.req.query('format') || 'pdf'

  try {
    // TODO: Generate and return report file
    return c.json({
      message: `Report ${id} download initiated`,
      format,
      url: `/api/v1/reporting/reports/${id}/file.${format}`
    })
  } catch (error) {
    console.error('Download report error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to download report' }, 500)
  }
})

// GET /api/v1/reporting/screening - Get screening report
reporting.get('/screening', async (c) => {
  const projectId = c.req.query('projectId')
  const phaseId = c.req.query('phaseId')

  try {
    // TODO: Generate screening report
    return c.json({
      projectId: projectId || '1',
      phaseId: phaseId || '1',
      totalPapers: 100,
      phases: [
        {
          id: '1',
          name: 'Phase 1',
          assigned: 100,
          completed: 80,
          included: 50,
          excluded: 30,
          conflicts: 5,
        }
      ],
      overall: {
        included: 50,
        excluded: 30,
        pending: 20,
      }
    })
  } catch (error) {
    console.error('Get screening report error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to get screening report' }, 500)
  }
})

// GET /api/v1/reporting/quality-assessment - Get quality assessment report
reporting.get('/quality-assessment', async (c) => {
  const projectId = c.req.query('projectId')
  const qaId = c.req.query('qaId')

  try {
    // TODO: Generate quality assessment report
    return c.json({
      projectId: projectId || '1',
      qaId: qaId || '1',
      totalPapers: 50,
      completed: 40,
      averageScore: 7.5,
      criteriaBreakdown: {
        'Random sequence generation': { yes: 25, no: 15 },
        'Allocation concealment': { yes: 20, no: 20 },
      },
      scoreDistribution: {
        '0-3': 5,
        '4-6': 10,
        '7-8': 15,
        '9-10': 10,
      }
    })
  } catch (error) {
    console.error('Get QA report error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to get QA report' }, 500)
  }
})

// GET /api/v1/reporting/data-extraction - Get data extraction report
reporting.get('/data-extraction', async (c) => {
  const projectId = c.req.query('projectId')
  const formId = c.req.query('formId')

  try {
    // TODO: Generate data extraction report
    return c.json({
      projectId: projectId || '1',
      formId: formId || '1',
      totalPapers: 50,
      assigned: 40,
      completed: 30,
      draft: 5,
      submitted: 25,
      fieldCompletion: {
        'Study Design': 30,
        'Sample Size': 28,
        'Intervention': 30,
      }
    })
  } catch (error) {
    console.error('Get extraction report error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to get extraction report' }, 500)
  }
})

// GET /api/v1/reporting/prisma - Get PRISMA flow diagram data
reporting.get('/prisma', async (c) => {
  const projectId = c.req.query('projectId')

  try {
    // TODO: Generate PRISMA flow diagram data
    return c.json({
      projectId: projectId || '1',
      identification: {
        databases: 500,
        registers: 50,
        other: 20,
        duplicates: 100,
      },
      screening: {
        recordsScreened: 470,
        recordsExcluded: 300,
        reportsAssessed: 170,
        reportsExcluded: 50,
      },
      included: {
        studies: 120,
      }
    })
  } catch (error) {
    console.error('Get PRISMA data error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to get PRISMA data' }, 500)
  }
})

// POST /api/v1/reporting/export - Export data
reporting.post('/export', zValidator('json', exportDataSchema), async (c) => {
  const body = c.req.valid('json')

  try {
    // TODO: Export data in requested format
    return c.json({
      export: {
        id: '1',
        projectId: body.projectId,
        entity: body.entity,
        format: body.format,
        status: 'completed',
        url: `/api/v1/reporting/exports/1/download`,
        createdAt: new Date().toISOString(),
      }
    }, 201)
  } catch (error) {
    console.error('Export data error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to export data' }, 500)
  }
})

// GET /api/v1/reporting/exports/:id - Get export status
reporting.get('/exports/:id', async (c) => {
  const id = c.req.param('id')

  try {
    // TODO: Get export status
    return c.json({
      export: {
        id,
        status: 'completed',
        url: `/api/v1/reporting/exports/${id}/download`,
        createdAt: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Get export status error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to get export status' }, 500)
  }
})

// GET /api/v1/reporting/exports/:id/download - Download export file
reporting.get('/exports/:id/download', async (c) => {
  const id = c.req.param('id')

  try {
    // TODO: Return export file
    return c.json({
      message: `Export ${id} download initiated`,
      url: `/api/v1/reporting/exports/${id}/file.csv`
    })
  } catch (error) {
    console.error('Download export error:', error)
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to download export' }, 500)
  }
})

// GET /api/v1/reporting/stats - Get overall project statistics
reporting.get('/stats', authMiddleware, async (c) => {
  const authContext = c.get('user') as AuthContext
  const userId = authContext.userId
  const projectIdFilter = c.req.query('projectId')

  try {
    // Get all project IDs the user is a member of
    let projectIds: string[] = []

    if (projectIdFilter) {
      // If a specific project is requested, verify membership
      const membership = await prisma.projectMember.findFirst({
        where: { userId, projectId: projectIdFilter, active: 1 },
      })
      if (membership) {
        projectIds = [projectIdFilter]
      }
    } else {
      // Get all projects the user belongs to
      const memberships = await prisma.projectMember.findMany({
        where: { userId, active: 1 },
        select: { projectId: true },
      })
      projectIds = memberships.map((m) => m.projectId)
    }

    if (projectIds.length === 0) {
      return c.json({
        papers: { total: 0, imported: 0 },
        screening: { totalAssigned: 0, completed: 0, conflicts: 0 },
        qualityAssessment: { totalAssigned: 0, completed: 0 },
        dataExtraction: { totalAssigned: 0, completed: 0 },
      })
    }

    // Run all counts in parallel for performance
    const [
      totalPapers,
      importedPapers,
      screeningAssigned,
      screeningCompleted,
      screeningConflicts,
      qaAssigned,
      qaCompleted,
      extractionTotal,
      extractionCompleted,
    ] = await Promise.all([
      // Papers
      prisma.paper.count({
        where: { projectId: { in: projectIds }, active: 1 },
      }),
      prisma.paper.count({
        where: { projectId: { in: projectIds }, active: 1 },
      }),
      // Screening
      prisma.screeningAssignment.count({
        where: {
          paper: { projectId: { in: projectIds } },
          active: 1,
        },
      }),
      prisma.screeningDecision.count({
        where: {
          paper: { projectId: { in: projectIds } },
          active: 1,
        },
      }),
      prisma.screeningConflict.count({
        where: {
          paperId: {
            in: await prisma.paper
              .findMany({
                where: { projectId: { in: projectIds }, active: 1 },
                select: { id: true },
              })
              .then((papers) => papers.map((p) => p.id)),
          },
        },
      }),
      // QA
      prisma.qAAssignment.count({
        where: {
          paper: { projectId: { in: projectIds } },
          active: 1,
        },
      }),
      prisma.qAEntry.count({
        where: {
          paper: { projectId: { in: projectIds } },
          submittedAt: { not: null },
          active: 1,
        },
      }),
      // Data Extraction
      prisma.extractionEntry.count({
        where: {
          paper: { projectId: { in: projectIds } },
        },
      }),
      prisma.extractionEntry.count({
        where: {
          paper: { projectId: { in: projectIds } },
          status: { in: ['SUBMITTED', 'VALIDATED'] },
        },
      }),
    ])

    return c.json({
      papers: {
        total: totalPapers,
        imported: importedPapers,
      },
      screening: {
        totalAssigned: screeningAssigned,
        completed: screeningCompleted,
        conflicts: screeningConflicts,
      },
      qualityAssessment: {
        totalAssigned: qaAssigned,
        completed: qaCompleted,
      },
      dataExtraction: {
        totalAssigned: extractionTotal,
        completed: extractionCompleted,
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return c.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to fetch statistics' },
      500
    )
  }
})

export default reporting
