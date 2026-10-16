import { api } from "./client"

export interface ApiProjectStats {
  total: number
  pending: number
  "in-progress": number
  completed: number
}

export interface ApiProject {
  id: string
  ownerId: string
  name: string
  description: string | null
  thumbnailKey: string | null
  thumbnailUrl: string | null
  teamId: string | null
  teamName: string | null
  stats: ApiProjectStats
  createdAt: number
  updatedAt: number
}

export interface ProjectCreateInput {
  name: string
  description?: string | null
  thumbnailKey?: string | null
}

export type ProjectUpdateInput = Partial<ProjectCreateInput>

export interface ApiProjectMember {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  role: "admin" | "user"
  status: "active" | "disabled"
  addedAt: number
}

export const projectsApi = {
  list: () => api.get<{ items: ApiProject[] }>("/projects"),

  get: (id: string) => api.get<ApiProject>(`/projects/${encodeURIComponent(id)}`),

  create: (input: ProjectCreateInput) => api.post<ApiProject>("/projects", input),

  update: (id: string, patch: ProjectUpdateInput) =>
    api.put<ApiProject>(`/projects/${encodeURIComponent(id)}`, patch),

  remove: (id: string) => api.del<{ ok: true }>(`/projects/${encodeURIComponent(id)}`),

  members: (id: string) =>
    api.get<{ items: ApiProjectMember[] }>(`/projects/${encodeURIComponent(id)}/members`),

  addMember: (id: string, userId: string) =>
    api.post<{ ok: true }>(`/projects/${encodeURIComponent(id)}/members`, { userId }),

  removeMember: (id: string, userId: string) =>
    api.del<{ ok: true }>(
      `/projects/${encodeURIComponent(id)}/members/${encodeURIComponent(userId)}`,
    ),
}
