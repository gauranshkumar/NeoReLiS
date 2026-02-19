import { prisma } from '@neorelis/db'

// QA Templates
export async function findQATemplatesByProject(projectId: string) {
  return prisma.qATemplate.findMany({
    where: { projectId, active: 1 },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findQATemplateById(templateId: string) {
  return prisma.qATemplate.findUnique({
    where: { id: templateId },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: { options: true },
      },
    },
  })
}

export async function createQATemplate(params: {
  projectId: string
  name: string
  description?: string
  criteria: { name: string; type: string; weight?: number }[]
}) {
  return prisma.qATemplate.create({
    data: {
      projectId: params.projectId,
      name: params.name,
      description: params.description,
      questions: {
        create: params.criteria.map((c, index) => ({
          text: c.name,
          type: c.type,
          weight: c.weight || 1,
          order: index,
        })),
      },
    },
    include: {
      questions: true,
    },
  })
}

export async function updateQATemplate(
  templateId: string,
  data: {
    name?: string
    description?: string
    criteria?: { name: string; type: string; weight?: number }[]
  }
) {
  if (data.criteria) {
    // Delete existing questions and recreate
    await prisma.qAQuestion.deleteMany({ where: { templateId } })

    return prisma.qATemplate.update({
      where: { id: templateId },
      data: {
        name: data.name,
        description: data.description,
        questions: {
          create: data.criteria.map((c, index) => ({
            text: c.name,
            type: c.type,
            weight: c.weight || 1,
            order: index,
          })),
        },
      },
      include: {
        questions: true,
      },
    })
  }

  return prisma.qATemplate.update({
    where: { id: templateId },
    data: {
      name: data.name,
      description: data.description,
    },
  })
}

export async function deleteQATemplate(templateId: string) {
  return prisma.qATemplate.update({
    where: { id: templateId },
    data: { active: 0 },
  })
}

// QA Assignments
export async function findQAAssignments(templateId: string, reviewerId?: string) {
  const where: any = { templateId }

  if (reviewerId) where.userId = reviewerId

  return prisma.qAAssignment.findMany({
    where,
    include: {
      paper: { select: { id: true, title: true, doi: true } },
      template: { select: { id: true, name: true } },
    },
    orderBy: { assignedAt: 'desc' },
  })
}

export async function findQAAssignmentById(assignmentId: string) {
  return prisma.qAAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      paper: { include: { authors: { include: { author: true } } } },
      template: {
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: { options: true },
          },
        },
      },
      entries: true,
    },
  })
}

export async function createQAAssignment(params: {
  projectId: string
  qaId: string
  paperId: string
  reviewerId: string
  assignedBy: string
}) {
  return prisma.qAAssignment.create({
    data: {
      paperId: params.paperId,
      templateId: params.qaId,
      userId: params.reviewerId,
      assignedBy: params.assignedBy,
    },
    include: {
      paper: { select: { id: true, title: true } },
      template: { select: { id: true, name: true } },
    },
  })
}

export async function bulkCreateQAAssignments(params: {
  qaId: string
  paperIds: string[]
  reviewerIds: string[]
  assignedBy: string
}) {
  const assignments = []
  for (const paperId of params.paperIds) {
    for (const reviewerId of params.reviewerIds) {
      assignments.push({
        paperId,
        templateId: params.qaId,
        userId: reviewerId,
        assignedBy: params.assignedBy,
      })
    }
  }

  return prisma.qAAssignment.createMany({
    data: assignments,
    skipDuplicates: true,
  })
}

// QA Scores/Entries
export async function submitQAScores(params: {
  assignmentId: string
  paperId: string
  questionId: string
  scores: Record<string, any>
  notes?: string
}) {
  // Get the assignment to find all questions
  const assignment = await prisma.qAAssignment.findUnique({
    where: { id: params.assignmentId },
    include: {
      template: {
        include: { questions: true },
      },
    },
  })

  if (!assignment) {
    throw new Error('Assignment not found')
  }

  // Create or update entries for each score
  const entries = []
  for (const [questionId, value] of Object.entries(params.scores)) {
    const question = assignment.template.questions.find((q) => q.id === questionId)
    if (!question) continue

    const entry = await prisma.qAEntry.upsert({
      where: {
        assignmentId_questionId: {
          assignmentId: params.assignmentId,
          questionId,
        },
      },
      create: {
        assignmentId: params.assignmentId,
        paperId: params.paperId,
        questionId,
        value: String(value),
        submittedAt: new Date(),
      },
      update: {
        value: String(value),
        submittedAt: new Date(),
      },
    })
    entries.push(entry)
  }

  return entries
}

export async function findQAScores(templateId: string, paperId?: string) {
  const where: any = { templateId }
  if (paperId) where.paperId = paperId

  return prisma.qAEntry.findMany({
    where: {
      assignment: { templateId },
      paperId,
    },
    include: {
      assignment: true,
      question: true,
    },
  })
}

// QA Statistics
export async function getQAStats(templateId: string) {
  const [total, assigned, completed] = await Promise.all([
    prisma.paper.count({
      where: { qaAssignments: { some: { templateId } } },
    }),
    prisma.qAAssignment.count({
      where: { templateId, active: 1 },
    }),
    prisma.qAEntry.count({
      where: {
        assignment: { templateId },
        submittedAt: { not: null },
      },
    }),
  ])

  // Calculate average score
  const entries = await prisma.qAEntry.findMany({
    where: {
      assignment: { templateId },
      submittedAt: { not: null },
      score: { not: null },
    },
  })

  const avgScore = entries.length > 0
    ? entries.reduce((sum: number, e: { score: number | null }) => sum + (e.score || 0), 0) / entries.length
    : 0

  return {
    totalPapers: total,
    assigned,
    completed,
    averageScore: avgScore,
  }
}
