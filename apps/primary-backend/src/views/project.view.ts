/**
 * View layer: serialize Project entities for API responses.
 * Keeps response shape in one place (MVC View).
 */

export function projectSummary(project: {
  id: string
  label: string
  title: string
  description: string | null
  status: string
  createdAt: Date
  creator?: { id: string; username: string; name: string } | null
}, role?: string) {
  return {
    id: project.id,
    label: project.label,
    title: project.title,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt.toISOString(),
    ...(role && { role }),
    ...(project.creator && { creator: project.creator }),
  }
}

export function projectDetail(project: {
  id: string
  label: string
  title: string
  description: string | null
}) {
  return {
    id: project.id,
    label: project.label,
    title: project.title,
    description: project.description,
  }
}

export function projectMember(member: {
  id: string
  role: string
  addedAt: Date
  user: { id: string; username: string; email: string | null; name: string }
}) {
  return {
    id: member.id,
    userId: member.user.id,
    username: member.user.username,
    email: member.user.email,
    name: member.user.name,
    role: member.role,
    joinedAt: member.addedAt.toISOString(),
  }
}

export function projectSettings(config: {
  projectId: string
  configType: string
  importPapersOn: number
  sourcePapersOn: number
  searchStrategyOn: number
  assignPapersOn: number
  screeningReviewerNum: number
  screeningOn: number
  screeningValidationOn: number
  screeningResultOn: number
  screeningConflictType: string
  screeningConflictRes: string
  screeningStatusToValidate: string
  validationDefaultPercent: number
  classificationOn: number
}) {
  return {
    projectId: config.projectId,
    configType: config.configType,
    importPapersOn: config.importPapersOn === 1,
    sourcePapersOn: config.sourcePapersOn === 1,
    searchStrategyOn: config.searchStrategyOn === 1,
    assignPapersOn: config.assignPapersOn === 1,
    screeningReviewerNum: config.screeningReviewerNum,
    screeningOn: config.screeningOn === 1,
    screeningValidationOn: config.screeningValidationOn === 1,
    screeningResultOn: config.screeningResultOn === 1,
    screeningConflictType: config.screeningConflictType,
    screeningConflictRes: config.screeningConflictRes,
    screeningStatusToValidate: config.screeningStatusToValidate,
    validationDefaultPercent: config.validationDefaultPercent,
    classificationOn: config.classificationOn === 1,
  }
}
