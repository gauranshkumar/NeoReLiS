import type { AuthContext } from '../middleware/auth'
import type { ProjectRole } from '../middleware/project-access'

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthContext
    project: {
      id: string
      label: string
      title: string
      description: string | null
    }
    projectMembership: {
      projectId: string
      userId: string
      role: ProjectRole
      joinedAt: Date
    }
  }
}

