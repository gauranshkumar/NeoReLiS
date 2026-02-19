// In the browser, use relative URLs so requests go through Next.js rewrites proxy.
// On the server (SSR), use the full backend URL.
const API_BASE_URL =
  typeof window !== 'undefined'
    ? ''
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9078');

// ─── Generic API Client ──────────────────────────────────────────────

interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: {
            code: data.code || 'ERROR',
            message: data.message || 'An error occurred',
            details: data.details,
          },
        };
      }

      return { data: data as T };
    } catch (error) {
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export const api = new ApiClient();

// ─── Shared Types ─────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role?: string;
  active?: number;
  state?: number;
  userGroup?: { id: string; name: string } | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    username: string;
    name: string;
  }) => {
    const response = await api.post<AuthResponse>('/api/v1/auth/register', data);
    if (response.data?.token) {
      api.setToken(response.data.token);
    }
    return response;
  },

  login: async (data: { email?: string; username?: string; password: string }) => {
    const response = await api.post<AuthResponse>('/api/v1/auth/login', data);
    if (response.data?.token) {
      api.setToken(response.data.token);
    }
    return response;
  },

  logout: async () => {
    const response = await api.post<{ message: string }>('/api/v1/auth/logout');
    api.setToken(null);
    return response;
  },

  me: async () => {
    return api.get<{ user: User }>('/api/v1/auth/me');
  },

  requestPasswordReset: async (email: string) => {
    return api.post<{ message: string }>('/api/v1/auth/password-reset', { email });
  },

  confirmPasswordReset: async (token: string, newPassword: string) => {
    return api.post<{ message: string }>('/api/v1/auth/password-reset/confirm', {
      token,
      newPassword,
    });
  },
};

// ─── Projects ─────────────────────────────────────────────────────────

export interface Project {
  id: string;
  label: string;
  title: string;
  description?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt?: string;
  role?: string;
  creator?: { id: string; username: string; name: string };
  paperCount?: number;
  memberCount?: number;
  members?: ProjectMember[];
}

export interface ProjectMember {
  id: string;
  userId: string;
  username: string;
  email: string | null;
  name: string;
  role: string;
  joinedAt: string;
}

export interface ProjectSettings {
  projectId: string;
  configType: string;
  importPapersOn: boolean;
  sourcePapersOn: boolean;
  searchStrategyOn: boolean;
  assignPapersOn: boolean;
  screeningReviewerNum: number;
  screeningOn: boolean;
  screeningValidationOn: boolean;
  screeningResultOn: boolean;
  screeningConflictType: string;
  screeningConflictRes: string;
  screeningStatusToValidate: string;
  validationDefaultPercent: number;
  classificationOn: boolean;
}

export const projectApi = {
  list: async () => {
    return api.get<{ projects: Project[] }>('/api/v1/projects');
  },

  get: async (id: string) => {
    return api.get<{ project: Project }>(`/api/v1/projects/${id}`);
  },

  create: async (data: { label: string; title: string; description?: string }) => {
    return api.post<{ project: Project }>('/api/v1/projects', data);
  },

  update: async (id: string, data: { title?: string; description?: string; status?: string }) => {
    return api.put<{ project: Project }>(`/api/v1/projects/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete<{ message: string }>(`/api/v1/projects/${id}`);
  },

  // Members
  getMembers: async (projectId: string) => {
    return api.get<{ members: ProjectMember[] }>(`/api/v1/projects/${projectId}/members`);
  },

  addMember: async (projectId: string, data: { userId: string; role: string }) => {
    return api.post<{ member: ProjectMember }>(`/api/v1/projects/${projectId}/members`, data);
  },

  updateMemberRole: async (projectId: string, memberId: string, role: string) => {
    return api.put<{ member: ProjectMember }>(
      `/api/v1/projects/${projectId}/members/${memberId}`,
      { role }
    );
  },

  removeMember: async (projectId: string, memberId: string) => {
    return api.delete<{ message: string }>(`/api/v1/projects/${projectId}/members/${memberId}`);
  },

  // Settings
  getSettings: async (projectId: string) => {
    return api.get<{ settings: ProjectSettings }>(`/api/v1/projects/${projectId}/settings`);
  },

  updateSettings: async (projectId: string, settings: Partial<ProjectSettings>) => {
    return api.put<{ settings: ProjectSettings }>(`/api/v1/projects/${projectId}/settings`, settings);
  },
};

// ─── Papers ───────────────────────────────────────────────────────────

export interface PaperAuthor {
  firstName: string;
  lastName: string;
}

export interface Paper {
  id: string;
  title: string;
  abstract?: string | null;
  year?: number | null;
  doi?: string | null;
  url?: string | null;
  source: string;
  projectId: string;
  status?: string;           // screeningStatus from list endpoint
  screeningStatus?: string;  // from detail endpoint
  bibtexKey?: string | null;
  authors: PaperAuthor[];
  createdAt: string;
  updatedAt?: string;
  venue?: { name: string; type: string } | null;
  project?: { id: string; title: string; label: string; status: string } | null;
}

export interface PaperListResponse {
  papers: Paper[];
  total: number;
  page: number;
  limit: number;
}

export const paperApi = {
  list: async (params?: {
    projectId?: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    return api.get<PaperListResponse>(`/api/v1/papers?${query.toString()}`);
  },

  get: async (id: string) => {
    return api.get<{ paper: Paper }>(`/api/v1/papers/${id}`);
  },

  create: async (data: {
    title: string;
    authors?: string;
    abstract?: string;
    year?: number;
    doi?: string;
    url?: string;
    source?: string;
    projectId: string;
  }) => {
    return api.post<{ paper: Paper }>('/api/v1/papers', data);
  },

  update: async (
    id: string,
    data: {
      title?: string;
      authors?: string;
      abstract?: string;
      year?: number;
      doi?: string;
      url?: string;
    }
  ) => {
    return api.put<{ paper: Paper }>(`/api/v1/papers/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete<{ message: string }>(`/api/v1/papers/${id}`);
  },

  import: async (data: { format: 'bibtex' | 'endnote' | 'csv'; content: string; projectId: string }) => {
    return api.post<{ message: string; imported: number; errors: string[] }>(
      '/api/v1/papers/import',
      data
    );
  },

  exportSingle: async (id: string, format?: string) => {
    const query = format ? `?format=${format}` : '';
    return api.get<{ format: string; content: string }>(`/api/v1/papers/${id}/export${query}`);
  },

  exportMultiple: async (paperIds: string[], format?: string) => {
    return api.post<{ format: string; content: string; count: number }>('/api/v1/papers/export', {
      paperIds,
      format,
    });
  },
};

// ─── Screening ────────────────────────────────────────────────────────

export interface ScreeningPhase {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ScreeningAssignment {
  id: string;
  projectId: string;
  phaseId: string;
  paperId: string;
  reviewerId: string;
  status: string;
  decision?: string | null;
  createdAt: string;
}

export interface ScreeningDecision {
  id: string;
  assignmentId: string;
  decision: 'include' | 'exclude' | 'conflict';
  notes?: string;
  createdAt: string;
}

export interface ScreeningConflict {
  id: string;
  projectId: string;
  phaseId: string;
  paperId: string;
  decisions: { reviewerId: string; decision: string }[];
  status: string;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface ScreeningStats {
  projectId: string;
  phaseId: string;
  totalPapers: number;
  assigned: number;
  completed: number;
  conflicts: number;
  included: number;
  excluded: number;
}

export const screeningApi = {
  // Phases
  listPhases: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return api.get<{ phases: ScreeningPhase[] }>(`/api/v1/screening/phases${query}`);
  },

  getPhase: async (id: string) => {
    return api.get<{ phase: ScreeningPhase }>(`/api/v1/screening/phases/${id}`);
  },

  createPhase: async (data: {
    projectId: string;
    name: string;
    description?: string;
    order: number;
  }) => {
    return api.post<{ phase: ScreeningPhase }>('/api/v1/screening/phases', data);
  },

  updatePhase: async (
    id: string,
    data: { name?: string; description?: string; order?: number }
  ) => {
    return api.put<{ phase: ScreeningPhase }>(`/api/v1/screening/phases/${id}`, data);
  },

  deletePhase: async (id: string) => {
    return api.delete<{ message: string }>(`/api/v1/screening/phases/${id}`);
  },

  // Assignments
  listAssignments: async (params?: {
    projectId?: string;
    phaseId?: string;
    reviewerId?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.phaseId) query.set('phaseId', params.phaseId);
    if (params?.reviewerId) query.set('reviewerId', params.reviewerId);
    const qs = query.toString();
    return api.get<{ assignments: ScreeningAssignment[] }>(
      `/api/v1/screening/assignments${qs ? `?${qs}` : ''}`
    );
  },

  getAssignment: async (id: string) => {
    return api.get<{ assignment: ScreeningAssignment }>(`/api/v1/screening/assignments/${id}`);
  },

  createAssignment: async (data: {
    projectId: string;
    phaseId: string;
    paperId: string;
    reviewerId: string;
  }) => {
    return api.post<{ assignment: ScreeningAssignment }>('/api/v1/screening/assignments', data);
  },

  bulkCreateAssignments: async (data: {
    projectId: string;
    phaseId: string;
    paperIds: string[];
    reviewerIds: string[];
  }) => {
    return api.post<{ message: string; count: number }>('/api/v1/screening/assignments/bulk', data);
  },

  // Decisions
  submitDecision: async (data: {
    assignmentId: string;
    decision: 'include' | 'exclude' | 'conflict';
    notes?: string;
  }) => {
    return api.post<{ decision: ScreeningDecision }>('/api/v1/screening/decisions', data);
  },

  // Conflicts
  listConflicts: async (params?: { projectId?: string; phaseId?: string }) => {
    const query = new URLSearchParams();
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.phaseId) query.set('phaseId', params.phaseId);
    const qs = query.toString();
    return api.get<{ conflicts: ScreeningConflict[] }>(
      `/api/v1/screening/conflicts${qs ? `?${qs}` : ''}`
    );
  },

  resolveConflict: async (id: string, data: { resolution: string; resolvedBy: string }) => {
    return api.post<{ conflict: ScreeningConflict }>(
      `/api/v1/screening/conflicts/${id}/resolve`,
      data
    );
  },

  // Stats
  getStats: async (params?: { projectId?: string; phaseId?: string }) => {
    const query = new URLSearchParams();
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.phaseId) query.set('phaseId', params.phaseId);
    const qs = query.toString();
    return api.get<ScreeningStats>(`/api/v1/screening/stats${qs ? `?${qs}` : ''}`);
  },
};

// ─── Quality Assessment ───────────────────────────────────────────────

export interface QACriterion {
  name: string;
  type: 'scale' | 'yes_no' | 'text';
  weight?: number;
}

export interface QualityAssessment {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  criteria: QACriterion[];
  createdAt: string;
  updatedAt?: string;
}

export interface QAAssignment {
  id: string;
  qaId: string;
  projectId?: string;
  paperId: string;
  reviewerId: string;
  status: string;
  scores?: Record<string, number | boolean | string> | null;
  createdAt: string;
}

export interface QAScore {
  id?: string;
  assignmentId: string;
  paperId?: string;
  reviewerId?: string;
  scores: Record<string, number | boolean | string>;
  notes?: string;
  createdAt: string;
}

export interface QAStats {
  qaId: string;
  totalPapers: number;
  assigned: number;
  completed: number;
  averageScore: number;
  criteriaStats: Record<string, Record<string, number>>;
}

export const qualityAssessmentApi = {
  // QA Configurations
  list: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return api.get<{ qualityAssessments: QualityAssessment[] }>(
      `/api/v1/quality-assessment${query}`
    );
  },

  get: async (id: string) => {
    return api.get<{ qualityAssessment: QualityAssessment }>(`/api/v1/quality-assessment/${id}`);
  },

  create: async (data: {
    projectId: string;
    name: string;
    description?: string;
    criteria: QACriterion[];
  }) => {
    return api.post<{ qualityAssessment: QualityAssessment }>('/api/v1/quality-assessment', data);
  },

  update: async (
    id: string,
    data: { name?: string; description?: string; criteria?: QACriterion[] }
  ) => {
    return api.put<{ qualityAssessment: QualityAssessment }>(
      `/api/v1/quality-assessment/${id}`,
      data
    );
  },

  delete: async (id: string) => {
    return api.delete<{ message: string }>(`/api/v1/quality-assessment/${id}`);
  },

  // Assignments
  listAssignments: async (qaId: string, reviewerId?: string) => {
    const query = reviewerId ? `?reviewerId=${reviewerId}` : '';
    return api.get<{ assignments: QAAssignment[] }>(
      `/api/v1/quality-assessment/${qaId}/assignments${query}`
    );
  },

  getAssignment: async (id: string) => {
    return api.get<{ assignment: QAAssignment }>(`/api/v1/quality-assessment/assignments/${id}`);
  },

  createAssignment: async (
    qaId: string,
    data: { projectId: string; qaId: string; paperId: string; reviewerId: string }
  ) => {
    return api.post<{ assignment: QAAssignment }>(
      `/api/v1/quality-assessment/${qaId}/assignments`,
      data
    );
  },

  bulkCreateAssignments: async (
    qaId: string,
    data: { projectId: string; paperIds: string[]; reviewerIds: string[] }
  ) => {
    return api.post<{ message: string; count: number }>(
      `/api/v1/quality-assessment/${qaId}/assignments/bulk`,
      data
    );
  },

  // Scores
  submitScores: async (data: {
    assignmentId: string;
    scores: Record<string, number | boolean | string>;
    notes?: string;
  }) => {
    return api.post<{ score: QAScore }>('/api/v1/quality-assessment/scores', data);
  },

  getScores: async (qaId: string, paperId?: string) => {
    const query = paperId ? `?paperId=${paperId}` : '';
    return api.get<{ scores: QAScore[] }>(`/api/v1/quality-assessment/${qaId}/scores${query}`);
  },

  // Stats
  getStats: async (qaId: string) => {
    return api.get<QAStats>(`/api/v1/quality-assessment/${qaId}/stats`);
  },
};

// ─── Data Extraction ──────────────────────────────────────────────────

export interface ExtractionField {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';
  required: boolean;
  options?: string[];
  validation?: Record<string, unknown>;
}

export interface ExtractionForm {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  version: string;
  status?: string;
  fields: ExtractionField[];
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface ExtractionAssignment {
  id: string;
  projectId: string;
  formId: string;
  paperId: string;
  reviewerId: string;
  status: string;
  data?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ExtractionData {
  id?: string;
  assignmentId: string;
  data: Record<string, unknown>;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ExtractionStats {
  projectId: string;
  formId: string;
  totalPapers: number;
  assigned: number;
  completed: number;
  draft: number;
  submitted: number;
}

export const dataExtractionApi = {
  // Forms
  listForms: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return api.get<{ forms: ExtractionForm[] }>(`/api/v1/data-extraction/forms${query}`);
  },

  getForm: async (id: string) => {
    return api.get<{ form: ExtractionForm }>(`/api/v1/data-extraction/forms/${id}`);
  },

  createForm: async (data: {
    projectId: string;
    name: string;
    description?: string;
    version?: string;
    fields: ExtractionField[];
  }) => {
    return api.post<{ form: ExtractionForm }>('/api/v1/data-extraction/forms', data);
  },

  updateForm: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      version?: string;
      fields?: ExtractionField[];
    }
  ) => {
    return api.put<{ form: ExtractionForm }>(`/api/v1/data-extraction/forms/${id}`, data);
  },

  deleteForm: async (id: string) => {
    return api.delete<{ message: string }>(`/api/v1/data-extraction/forms/${id}`);
  },

  publishForm: async (id: string) => {
    return api.post<{ form: ExtractionForm }>(`/api/v1/data-extraction/forms/${id}/publish`);
  },

  // Assignments
  listAssignments: async (params?: {
    projectId?: string;
    formId?: string;
    reviewerId?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.formId) query.set('formId', params.formId);
    if (params?.reviewerId) query.set('reviewerId', params.reviewerId);
    const qs = query.toString();
    return api.get<{ assignments: ExtractionAssignment[] }>(
      `/api/v1/data-extraction/assignments${qs ? `?${qs}` : ''}`
    );
  },

  getAssignment: async (id: string) => {
    return api.get<{ assignment: ExtractionAssignment }>(
      `/api/v1/data-extraction/assignments/${id}`
    );
  },

  createAssignment: async (data: {
    projectId: string;
    formId: string;
    paperId: string;
    reviewerId: string;
  }) => {
    return api.post<{ assignment: ExtractionAssignment }>(
      '/api/v1/data-extraction/assignments',
      data
    );
  },

  bulkCreateAssignments: async (data: {
    projectId: string;
    formId: string;
    paperIds: string[];
    reviewerIds: string[];
  }) => {
    return api.post<{ message: string; count: number }>(
      '/api/v1/data-extraction/assignments/bulk',
      data
    );
  },

  // Data
  submitData: async (data: {
    assignmentId: string;
    data: Record<string, unknown>;
    status?: 'draft' | 'submitted' | 'revised';
  }) => {
    return api.post<{ extraction: ExtractionData }>('/api/v1/data-extraction/data', data);
  },

  getData: async (assignmentId: string) => {
    return api.get<{ extraction: ExtractionData }>(
      `/api/v1/data-extraction/data/${assignmentId}`
    );
  },

  // Stats
  getStats: async (params?: { projectId?: string; formId?: string }) => {
    const query = new URLSearchParams();
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.formId) query.set('formId', params.formId);
    const qs = query.toString();
    return api.get<ExtractionStats>(`/api/v1/data-extraction/stats${qs ? `?${qs}` : ''}`);
  },
};

// ─── Reporting ────────────────────────────────────────────────────────

export interface Report {
  id: string;
  projectId: string;
  type: string;
  name?: string;
  description?: string;
  format?: string;
  status: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface ExportRecord {
  id: string;
  projectId?: string;
  entity?: string;
  format: string;
  status: string;
  url: string;
  createdAt: string;
}

export interface ScreeningReport {
  projectId: string;
  phaseId: string;
  totalPapers: number;
  phases: {
    id: string;
    name: string;
    assigned: number;
    completed: number;
    included: number;
    excluded: number;
    conflicts: number;
  }[];
  overall: {
    included: number;
    excluded: number;
    pending: number;
  };
}

export interface QAReport {
  projectId: string;
  qaId: string;
  totalPapers: number;
  completed: number;
  averageScore: number;
  criteriaBreakdown: Record<string, Record<string, number>>;
  scoreDistribution: Record<string, number>;
}

export interface ExtractionReport {
  projectId: string;
  formId: string;
  totalPapers: number;
  assigned: number;
  completed: number;
  draft: number;
  submitted: number;
  fieldCompletion: Record<string, number>;
}

export interface PrismaFlowData {
  projectId: string;
  identification: {
    databases: number;
    registers: number;
    other: number;
    duplicates: number;
  };
  screening: {
    recordsScreened: number;
    recordsExcluded: number;
    reportsAssessed: number;
    reportsExcluded: number;
  };
  included: {
    studies: number;
  };
}

export interface ProjectStats {
  projectId: string;
  papers: { total: number; imported: number };
  screening: { totalAssigned: number; completed: number; conflicts: number };
  qualityAssessment: { totalAssigned: number; completed: number };
  dataExtraction: { totalAssigned: number; completed: number };
}

export const reportingApi = {
  // Reports
  listReports: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return api.get<{ reports: Report[] }>(`/api/v1/reporting/reports${query}`);
  },

  getReport: async (id: string, format?: string) => {
    const query = format ? `?format=${format}` : '';
    return api.get<{ report: Report }>(`/api/v1/reporting/reports/${id}${query}`);
  },

  downloadReport: async (id: string, format?: string) => {
    const query = format ? `?format=${format}` : '';
    return api.get<{ message: string; format: string; url: string }>(
      `/api/v1/reporting/reports/${id}/download${query}`
    );
  },

  generateReport: async (data: {
    projectId: string;
    type: 'screening' | 'quality_assessment' | 'data_extraction' | 'summary' | 'prisma';
    format?: 'json' | 'csv' | 'pdf' | 'html';
    filters?: Record<string, unknown>;
  }) => {
    return api.post<{ report: Report }>('/api/v1/reporting/generate', data);
  },

  // Module-specific reports
  getScreeningReport: async (params?: { projectId?: string; phaseId?: string }) => {
    const query = new URLSearchParams();
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.phaseId) query.set('phaseId', params.phaseId);
    const qs = query.toString();
    return api.get<ScreeningReport>(`/api/v1/reporting/screening${qs ? `?${qs}` : ''}`);
  },

  getQAReport: async (params?: { projectId?: string; qaId?: string }) => {
    const query = new URLSearchParams();
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.qaId) query.set('qaId', params.qaId);
    const qs = query.toString();
    return api.get<QAReport>(`/api/v1/reporting/quality-assessment${qs ? `?${qs}` : ''}`);
  },

  getExtractionReport: async (params?: { projectId?: string; formId?: string }) => {
    const query = new URLSearchParams();
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.formId) query.set('formId', params.formId);
    const qs = query.toString();
    return api.get<ExtractionReport>(
      `/api/v1/reporting/data-extraction${qs ? `?${qs}` : ''}`
    );
  },

  getPrismaFlow: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return api.get<PrismaFlowData>(`/api/v1/reporting/prisma${query}`);
  },

  // Export
  exportData: async (data: {
    projectId: string;
    entity: 'papers' | 'screening' | 'quality_assessment' | 'data_extraction';
    format?: 'csv' | 'bibtex' | 'json' | 'excel';
    filters?: Record<string, unknown>;
  }) => {
    return api.post<{ export: ExportRecord }>('/api/v1/reporting/export', data);
  },

  getExportStatus: async (id: string) => {
    return api.get<{ export: ExportRecord }>(`/api/v1/reporting/exports/${id}`);
  },

  downloadExport: async (id: string) => {
    return api.get<{ message: string; url: string }>(`/api/v1/reporting/exports/${id}/download`);
  },

  // Overall stats
  getProjectStats: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return api.get<ProjectStats>(`/api/v1/reporting/stats${query}`);
  },
};

// ─── Element (Generic CRUD) ──────────────────────────────────────────

export interface Element {
  id: string;
  entityType: string;
  projectId: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export const elementApi = {
  list: async (
    entityType: string,
    params?: { projectId?: string; page?: number; limit?: number }
  ) => {
    const query = new URLSearchParams();
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return api.get<{
      elements: Element[];
      pagination: PaginationMeta;
    }>(`/api/v1/element/${entityType}${qs ? `?${qs}` : ''}`);
  },

  get: async (entityType: string, id: string) => {
    return api.get<{ element: Element }>(`/api/v1/element/${entityType}/${id}`);
  },

  getDetail: async (entityType: string, id: string) => {
    return api.get<{ element: Element }>(`/api/v1/element/${entityType}/${id}/detail`);
  },

  create: async (entityType: string, data: { projectId: string; data: Record<string, unknown> }) => {
    return api.post<{ element: Element }>(`/api/v1/element/${entityType}`, {
      ...data,
      entityType,
    });
  },

  update: async (entityType: string, id: string, data: Record<string, unknown>) => {
    return api.put<{ element: Element }>(`/api/v1/element/${entityType}/${id}`, { data });
  },

  delete: async (entityType: string, id: string) => {
    return api.delete<{ message: string }>(`/api/v1/element/${entityType}/${id}`);
  },

  getCount: async (entityType: string, projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return api.get<{ entityType: string; projectId: string; count: number }>(
      `/api/v1/element/${entityType}/count${query}`
    );
  },

  bulkCreate: async (
    entityType: string,
    data: { projectId: string; elements: Record<string, unknown>[] }
  ) => {
    return api.post<{ message: string; count: number; entityType: string }>(
      `/api/v1/element/${entityType}/bulk`,
      data
    );
  },

  bulkDelete: async (entityType: string, ids: string[]) => {
    return api.delete<{ message: string; count: number; entityType: string }>(
      `/api/v1/element/${entityType}/bulk`,
      { ids }
    );
  },
};

// ─── Manager ─────────────────────────────────────────────────────────

export interface ManagerOperation {
  id: string;
  name: string;
  description: string;
  entityType: string;
  parameters: string[];
}

export interface EntityConfig {
  type: string;
  name: string;
  description: string;
  operations: string[];
}

export interface EntityFieldConfig {
  name: string;
  type: string;
  primary?: boolean;
  required?: boolean;
}

export interface EntityDetailConfig {
  entityType: string;
  projectId: string;
  config: {
    table: string;
    fields: EntityFieldConfig[];
    operations: string[];
    permissions: Record<string, string[]>;
  };
}

export interface StoredProcedure {
  name: string;
  entityType: string;
  type: string;
  status: string;
}

export interface ProjectConfig {
  projectId: string;
  config: {
    entities: string[];
    modules: Record<string, { enabled: boolean }>;
    settings: Record<string, unknown>;
    updatedAt?: string;
  };
}

export const managerApi = {
  // Operations
  listOperations: async (params?: { projectId?: string; entityType?: string }) => {
    const query = new URLSearchParams();
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.entityType) query.set('entityType', params.entityType);
    const qs = query.toString();
    return api.get<{ operations: ManagerOperation[] }>(
      `/api/v1/manager/operations${qs ? `?${qs}` : ''}`
    );
  },

  executeOperation: async (data: {
    projectId: string;
    entityType: string;
    operation: string;
    parameters?: Record<string, unknown>;
  }) => {
    return api.post<{
      operation: {
        id: string;
        projectId: string;
        entityType: string;
        operation: string;
        status: string;
        result: Record<string, unknown>;
        executedAt: string;
      };
    }>('/api/v1/manager/operations', data);
  },

  // Entities
  listEntities: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return api.get<{ entities: EntityConfig[] }>(`/api/v1/manager/entities${query}`);
  },

  getEntityConfig: async (entityType: string, projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return api.get<EntityDetailConfig>(
      `/api/v1/manager/entities/${entityType}/config${query}`
    );
  },

  // Stored Procedures
  listStoredProcedures: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return api.get<{ procedures: StoredProcedure[] }>(
      `/api/v1/manager/stored-procedures${query}`
    );
  },

  regenerateStoredProcedures: async (data: {
    projectId?: string;
    entityType?: string;
  }) => {
    return api.post<{ message: string; projectId: string; entityType: string; regenerated: number }>(
      '/api/v1/manager/stored-procedures/regenerate',
      data
    );
  },

  // Config
  getConfig: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return api.get<ProjectConfig>(`/api/v1/manager/config${query}`);
  },

  updateConfig: async (data: { projectId: string; config: Record<string, unknown> }) => {
    return api.put<ProjectConfig>('/api/v1/manager/config', data);
  },

  // Health
  checkHealth: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return api.get<{
      status: string;
      projectId: string;
      configLoaded: boolean;
      databaseConnected: boolean;
      timestamp: string;
    }>(`/api/v1/manager/health${query}`);
  },
};
