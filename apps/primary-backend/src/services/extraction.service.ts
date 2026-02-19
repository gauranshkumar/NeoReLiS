import { prisma } from '@neorelis/db'

// Extraction Forms
export async function findExtractionFormsByProject(projectId: string) {
  return prisma.extractionForm.findMany({
    where: { projectId },
    orderBy: { updatedAt: 'desc' },
    include: {
      fields: {
        where: { active: 1 },
        orderBy: { order: 'asc' },
      },
    },
  })
}

export async function findExtractionFormById(formId: string) {
  return prisma.extractionForm.findUnique({
    where: { id: formId },
    include: {
      fields: {
        where: { active: 1 },
        orderBy: { order: 'asc' },
      },
    },
  })
}

export async function createExtractionForm(params: {
  projectId: string
  name: string
  description?: string
  version?: number
  fields: {
    name: string
    label: string
    fieldType: string
    isRequired?: boolean
    options?: string[]
    validation?: Record<string, any>
  }[]
}) {
  return prisma.extractionForm.create({
    data: {
      projectId: params.projectId,
      name: params.name,
      description: params.description,
      version: params.version || 1,
      fields: {
        create: params.fields.map((f, index) => ({
          name: f.name,
          label: f.label,
          fieldType: f.fieldType,
          isRequired: f.isRequired ? 1 : 0,
          order: index,
          config: f.validation,
        })),
      },
    },
    include: {
      fields: true,
    },
  })
}

export async function updateExtractionForm(
  formId: string,
  data: {
    name?: string
    description?: string
    fields?: {
      name: string
      label: string
      fieldType: string
      isRequired?: boolean
      options?: string[]
      validation?: Record<string, any>
    }[]
  }
) {
  if (data.fields) {
    // Deactivate old fields
    await prisma.extractionField.updateMany({
      where: { formId },
      data: { active: 0 },
    })

    // Create new fields
    await prisma.extractionField.createMany({
      data: data.fields.map((f, index) => ({
        formId,
        name: f.name,
        label: f.label,
        fieldType: f.fieldType,
        isRequired: f.isRequired ? 1 : 0,
        order: index,
        config: f.validation,
      })),
    })
  }

  return prisma.extractionForm.update({
    where: { id: formId },
    data: {
      name: data.name,
      description: data.description,
    },
    include: {
      fields: {
        where: { active: 1 },
        orderBy: { order: 'asc' },
      },
    },
  })
}

export async function deleteExtractionForm(formId: string) {
  return prisma.extractionForm.update({
    where: { id: formId },
    data: { isPublished: 0, isLocked: 0 },
  })
}

export async function publishExtractionForm(formId: string) {
  return prisma.extractionForm.update({
    where: { id: formId },
    data: { isPublished: 1 },
  })
}

// Extraction Assignments
export async function findExtractionAssignments(params: {
  projectId?: string
  formId?: string
  reviewerId?: string
}) {
  const where: any = {}

  if (params.formId) where.formId = params.formId
  if (params.reviewerId) where.userId = params.reviewerId

  return prisma.extractionEntry.findMany({
    where,
    include: {
      form: { select: { id: true, name: true, version: true } },
      paper: { select: { id: true, title: true, doi: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findExtractionAssignmentById(assignmentId: string) {
  return prisma.extractionEntry.findUnique({
    where: { id: assignmentId },
    include: {
      form: {
        include: {
          fields: {
            where: { active: 1 },
            orderBy: { order: 'asc' },
          },
        },
      },
      paper: { include: { authors: { include: { author: true } } } },
      values: {
        include: { field: true },
      },
    },
  })
}

export async function createExtractionAssignment(params: {
  projectId: string
  formId: string
  paperId: string
  reviewerId: string
}) {
  return prisma.extractionEntry.create({
    data: {
      formId: params.formId,
      paperId: params.paperId,
      userId: params.reviewerId,
      status: 'NOT_STARTED',
    },
    include: {
      form: { select: { id: true, name: true } },
      paper: { select: { id: true, title: true } },
    },
  })
}

export async function bulkCreateExtractionAssignments(params: {
  formId: string
  paperIds: string[]
  reviewerId: string
}) {
  // Get the projectId from the form
  const form = await prisma.extractionForm.findUnique({
    where: { id: params.formId },
    select: { projectId: true },
  })

  if (!form) {
    throw new Error('Form not found')
  }

  const entries = params.paperIds.map((paperId) => ({
    formId: params.formId,
    paperId,
    userId: params.reviewerId,
    status: 'NOT_STARTED' as const,
  }))

  return prisma.extractionEntry.createMany({
    data: entries,
    skipDuplicates: true,
  })
}

// Extraction Data
export async function submitExtractionData(params: {
  assignmentId: string
  data: Record<string, any>
  status?: 'draft' | 'submitted' | 'revised'
}) {
  const statusMap: Record<string, 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'VALIDATED'> = {
    draft: 'IN_PROGRESS',
    submitted: 'SUBMITTED',
    revised: 'SUBMITTED',
  }

  const entry = await prisma.extractionEntry.update({
    where: { id: params.assignmentId },
    data: {
      status: statusMap[params.status || 'submitted'],
      submittedAt: params.status === 'submitted' ? new Date() : undefined,
    },
  })

  // Delete existing values
  await prisma.extractionEntryValue.deleteMany({
    where: { entryId: params.assignmentId },
  })

  // Create new values
  if (Object.keys(params.data).length > 0) {
    // Get fields to validate
    const form = await prisma.extractionForm.findUnique({
      where: { id: entry.formId },
      include: { fields: true },
    })

    const values = []
    for (const [fieldName, value] of Object.entries(params.data)) {
      const field = form?.fields.find((f) => f.name === fieldName)
      if (field) {
        values.push({
          entryId: params.assignmentId,
          fieldId: field.id,
          value: String(value),
        })
      }
    }

    if (values.length > 0) {
      await prisma.extractionEntryValue.createMany({ data: values })
    }
  }

  return entry
}

export async function findExtractionData(assignmentId: string) {
  return prisma.extractionEntry.findUnique({
    where: { id: assignmentId },
    include: {
      form: {
        include: {
          fields: {
            where: { active: 1 },
            orderBy: { order: 'asc' },
          },
        },
      },
      values: {
        include: { field: true },
      },
    },
  })
}

// Extraction Statistics
export async function getExtractionStats(projectId: string, formId?: string) {
  const where: any = formId ? { formId } : {}

  const [total, assigned, draft, submitted] = await Promise.all([
    prisma.paper.count({
      where: { projectId, active: 1 },
    }),
    prisma.extractionEntry.count({ where }),
    prisma.extractionEntry.count({
      where: { ...where, status: 'NOT_STARTED' },
    }),
    prisma.extractionEntry.count({
      where: { ...where, status: 'SUBMITTED' },
    }),
  ])

  return {
    totalPapers: total,
    assigned,
    draft,
    submitted,
  }
}
