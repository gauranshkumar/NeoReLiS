import { prisma } from '@neorelis/db'

type DecisionType = 'INCLUDE' | 'EXCLUDE' | 'MAYBE'

// Screening Phases
export async function findScreeningPhasesByProject(projectId: string) {
  return prisma.screeningPhase.findMany({
    where: { projectId, active: 1 },
    orderBy: { order: 'asc' },
  })
}

export async function findScreeningPhaseById(phaseId: string) {
  return prisma.screeningPhase.findUnique({
    where: { id: phaseId },
  })
}

export async function createScreeningPhase(params: {
  projectId: string
  name: string
  description?: string
  order: number
}) {
  return prisma.screeningPhase.create({
    data: {
      projectId: params.projectId,
      name: params.name,
      description: params.description,
      order: params.order,
    },
  })
}

export async function updateScreeningPhase(
  phaseId: string,
  data: { name?: string; description?: string; order?: number }
) {
  return prisma.screeningPhase.update({
    where: { id: phaseId },
    data,
  })
}

export async function deleteScreeningPhase(phaseId: string) {
  return prisma.screeningPhase.update({
    where: { id: phaseId },
    data: { active: 0 },
  })
}

// Screening Assignments
export async function findScreeningAssignments(params: {
  projectId?: string
  phaseId?: string
  reviewerId?: string
  paperId?: string
}) {
  const where: any = { active: 1 }

  if (params.projectId) where.phase = { projectId: params.projectId }
  if (params.phaseId) where.phaseId = params.phaseId
  if (params.reviewerId) where.userId = params.reviewerId
  if (params.paperId) where.paperId = params.paperId

  return prisma.screeningAssignment.findMany({
    where,
    include: {
      phase: true,
      paper: { select: { id: true, title: true, doi: true } },
    },
    orderBy: { assignedAt: 'desc' },
  })
}

export async function findScreeningAssignmentById(assignmentId: string) {
  return prisma.screeningAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      phase: true,
      paper: { include: { authors: { include: { author: true } } } },
      decisions: { where: { active: 1 } },
    },
  })
}

export async function createScreeningAssignment(params: {
  projectId: string
  phaseId: string
  paperId: string
  reviewerId: string
  assignedBy: string
  note?: string
}) {
  return prisma.screeningAssignment.create({
    data: {
      paperId: params.paperId,
      phaseId: params.phaseId,
      userId: params.reviewerId,
      assignedBy: params.assignedBy,
      note: params.note,
    },
    include: {
      paper: { select: { id: true, title: true } },
      phase: { select: { id: true, name: true } },
    },
  })
}

export async function bulkCreateScreeningAssignments(params: {
  phaseId: string
  paperIds: string[]
  reviewerIds: string[]
  assignedBy: string
}) {
  const assignments = []
  for (const paperId of params.paperIds) {
    for (const reviewerId of params.reviewerIds) {
      assignments.push({
        paperId,
        phaseId: params.phaseId,
        userId: reviewerId,
        assignedBy: params.assignedBy,
      })
    }
  }

  return prisma.screeningAssignment.createMany({
    data: assignments,
    skipDuplicates: true,
  })
}

// Screening Decisions
export async function createScreeningDecision(params: {
  assignmentId: string
  paperId: string
  phaseId: string
  userId: string
  decision: DecisionType
  criteria?: string
  rationale?: string
}) {
  // First check if there's already a decision for this assignment
  const existingDecision = await prisma.screeningDecision.findUnique({
    where: { assignmentId: params.assignmentId },
  })

  if (existingDecision) {
    // Update existing decision
    const updated = await prisma.screeningDecision.update({
      where: { id: existingDecision.id },
      data: {
        decision: params.decision,
        criteria: params.criteria,
        rationale: params.rationale,
      },
    })

    // Check for conflicts (if decision changed)
    await checkAndCreateConflict(params.paperId, params.phaseId)

    return updated
  }

  const decision = await prisma.screeningDecision.create({
    data: {
      assignmentId: params.assignmentId,
      paperId: params.paperId,
      phaseId: params.phaseId,
      userId: params.userId,
      decision: params.decision,
      criteria: params.criteria,
      rationale: params.rationale,
    },
  })

  // Check for conflicts
  await checkAndCreateConflict(params.paperId, params.phaseId)

  return decision
}

async function checkAndCreateConflict(paperId: string, phaseId: string) {
  // Find all decisions for this paper in this phase
  const decisions = await prisma.screeningDecision.findMany({
    where: {
      paperId,
      phaseId,
      active: 1,
    },
    include: {
      assignment: true,
    },
  })

  if (decisions.length < 2) return

  // Check if there are conflicting decisions
  const decisionsSet = new Set(decisions.map((d) => d.decision))
  if (decisionsSet.size > 1) {
    // Create conflict record
    const firstDecision = decisions[0]
    if (!firstDecision) return
    await prisma.screeningConflict.create({
      data: {
        decisionId: firstDecision.id,
        paperId,
        phaseId,
        conflictType: 'INCLUDE_EXCLUDE',
      },
    })
  }
}

// Screening Conflicts
export async function findScreeningConflicts(params: {
  projectId?: string
  phaseId?: string
}) {
  const where: any = {}

  if (params.phaseId) where.phaseId = params.phaseId

  return prisma.screeningConflict.findMany({
    where,
    include: {
      decision: {
        include: {
          assignment: true,
        },
      },
    },
  })
}

export async function resolveScreeningConflict(
  conflictId: string,
  params: {
    resolution: DecisionType
    resolvedBy: string
    resolutionNote?: string
  }
) {
  return prisma.screeningConflict.update({
    where: { id: conflictId },
    data: {
      resolution: params.resolution,
      resolvedBy: params.resolvedBy,
      resolvedAt: new Date(),
      resolutionNote: params.resolutionNote,
    },
  })
}

// Screening Statistics
export async function getScreeningStats(projectId: string, phaseId?: string) {
  const whereClause: any = phaseId
    ? { phase: { projectId, id: phaseId } }
    : { phase: { projectId } }

  const [total, assignments, decisions, conflicts] = await Promise.all([
    prisma.paper.count({
      where: { projectId, active: 1 },
    }),
    prisma.screeningAssignment.count({
      where: { ...whereClause, active: 1 },
    }),
    prisma.screeningDecision.count({
      where: { ...whereClause, active: 1 },
    }),
    prisma.screeningConflict.count({
      where: { ...whereClause, resolvedAt: null },
    }),
  ])

  const included = await prisma.screeningDecision.count({
    where: { ...whereClause, active: 1, decision: 'INCLUDE' },
  })

  const excluded = await prisma.screeningDecision.count({
    where: { ...whereClause, active: 1, decision: 'EXCLUDE' },
  })

  return {
    totalPapers: total,
    assigned: assignments,
    completed: decisions,
    conflicts,
    included,
    excluded,
  }
}
