import { prisma } from '@neorelis/db'

export async function findPapersByProject(projectId: string, options?: {
  skip?: number
  take?: number
  search?: string
  status?: string
}) {
  const { skip = 0, take = 50, search, status } = options || {}

  const where: any = { projectId, active: 1 }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { abstract: { contains: search, mode: 'insensitive' } },
      { doi: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (status) {
    where.screeningStatus = status
  }

  const [papers, total] = await Promise.all([
    prisma.paper.findMany({
      where,
      skip,
      take,
      orderBy: { addedAt: 'desc' },
      include: {
        venue: { select: { name: true } },
        authors: {
          include: { author: true },
          orderBy: { order: 'asc' },
        },
      },
    }),
    prisma.paper.count({ where }),
  ])

  return { papers, total }
}

export async function findPapersByProjectIds(projectIds: string[], options?: {
  skip?: number
  take?: number
  search?: string
  status?: string
}) {
  const { skip = 0, take = 50, search, status } = options || {}

  const where: any = { projectId: { in: projectIds }, active: 1 }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { abstract: { contains: search, mode: 'insensitive' } },
      { doi: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (status) {
    where.screeningStatus = status
  }

  const [papers, total] = await Promise.all([
    prisma.paper.findMany({
      where,
      skip,
      take,
      orderBy: { addedAt: 'desc' },
      include: {
        venue: { select: { name: true } },
        authors: {
          include: { author: true },
          orderBy: { order: 'asc' },
        },
      },
    }),
    prisma.paper.count({ where }),
  ])

  return { papers, total }
}

export async function findPaperById(paperId: string) {
  return prisma.paper.findUnique({
    where: { id: paperId },
    include: {
      venue: true,
      authors: {
        include: { author: true },
        orderBy: { order: 'asc' },
      },
    },
  })
}

export async function createPaper(params: {
  title: string
  authors?: string
  abstract?: string
  year?: number
  doi?: string
  url?: string
  source?: string
  projectId: string
  addedBy: string
}) {
  // Parse authors if provided as string
  let authorData: { lastName: string; firstName?: string }[] = []
  if (params.authors) {
    authorData = params.authors.split(',').map((name) => {
      const parts = name.trim().split(' ')
      const lastName = parts.pop() || ''
      const firstName = parts.join(' ') || undefined
      return { lastName, firstName }
    })
  }

  return prisma.paper.create({
    data: {
      title: params.title,
      abstract: params.abstract,
      year: params.year,
      doi: params.doi,
      source: params.source || 'manual',
      projectId: params.projectId,
      addedBy: params.addedBy,
      additionMode: 'manual',
      authors: authorData.length > 0
        ? {
            create: authorData.map((author, index) => ({
              author: {
                create: {
                  lastName: author.lastName,
                  firstName: author.firstName,
                },
              },
              order: index,
            })),
          }
        : undefined,
    },
    include: {
      authors: {
        include: { author: true },
      },
    },
  })
}

export async function updatePaper(
  paperId: string,
  data: {
    title?: string
    authors?: string
    abstract?: string
    year?: number
    doi?: string
    url?: string
  }
) {
  return prisma.paper.update({
    where: { id: paperId },
    data: {
      title: data.title,
      abstract: data.abstract,
      year: data.year,
      doi: data.doi,
    },
  })
}

export async function deletePaper(paperId: string) {
  return prisma.paper.update({
    where: { id: paperId },
    data: { active: 0 },
  })
}

export async function findPaperByProjectAndBibtexKey(projectId: string, bibtexKey: string) {
  return prisma.paper.findUnique({
    where: {
      projectId_bibtexKey: { projectId, bibtexKey },
    },
  })
}
