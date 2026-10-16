import { api } from "./client"

export type TeamVisibility = "private" | "public"
export type TeamRole = "owner" | "admin" | "member"
export type InviteRole = "admin" | "member"
export type InviteStatus = "pending" | "accepted" | "declined" | "expired"

export interface ApiTeam {
  id: string
  ownerId: string
  name: string
  description: string | null
  avatarKey: string | null
  avatarUrl: string | null
  visibility: TeamVisibility
  memberCount: number
  myRole: TeamRole | null
  createdAt: number
  updatedAt: number
}

export interface ApiTeamMember {
  userId: string
  role: TeamRole
  joinedAt: number
  email: string | null
  displayName: string | null
  avatarKey: string | null
  avatarUrl: string | null
}

export interface ApiTeamInvite {
  id: string
  teamId: string
  email: string
  role: InviteRole
  status: InviteStatus
  invitedBy: string
  createdAt: number
  expiresAt: number | null
}

export interface TeamCreateInput {
  name: string
  description?: string | null
  visibility?: TeamVisibility
  avatarKey?: string | null
}

export type TeamUpdateInput = Partial<TeamCreateInput>

export interface InviteCreateInput {
  emails: string[]
  role?: InviteRole
}

export interface TeamListParams {
  limit?: number
  cursor?: string | null
}

export interface TeamListPage {
  items: ApiTeam[]
  nextCursor: string | null
}

export interface ApiTeamProject {
  id: string
  ownerId: string
  name: string
  description: string | null
  thumbnailKey: string | null
  thumbnailUrl: string | null
  createdAt: number
  updatedAt: number
}

export const teamsApi = {
  list: (params?: TeamListParams) => {
    const q = new URLSearchParams()
    if (params?.limit) q.set("limit", String(params.limit))
    if (params?.cursor) q.set("cursor", params.cursor)
    const qs = q.toString()
    return api.get<TeamListPage>(`/teams${qs ? `?${qs}` : ""}`)
  },

  /** Admin: danh sách tất cả nhóm (cho dialog thêm user vào nhóm). */
  allList: (search?: string) => {
    const q = new URLSearchParams()
    if (search) q.set("search", search)
    const qs = q.toString()
    return api.get<{ items: ApiTeam[] }>(`/teams/all${qs ? `?${qs}` : ""}`)
  },

  get: (id: string) => api.get<ApiTeam>(`/teams/${encodeURIComponent(id)}`),

  create: (input: TeamCreateInput) => api.post<ApiTeam>("/teams", input),

  update: (id: string, patch: TeamUpdateInput) =>
    api.put<ApiTeam>(`/teams/${encodeURIComponent(id)}`, patch),

  remove: (id: string) => api.del<{ ok: true }>(`/teams/${encodeURIComponent(id)}`),

  members: (id: string) =>
    api.get<{ items: ApiTeamMember[] }>(`/teams/${encodeURIComponent(id)}/members`),

  setMemberRole: (id: string, userId: string, role: InviteRole) =>
    api.put<{ ok: true }>(
      `/teams/${encodeURIComponent(id)}/members/${encodeURIComponent(userId)}`,
      { role },
    ),

  removeMember: (id: string, userId: string) =>
    api.del<{ ok: true }>(
      `/teams/${encodeURIComponent(id)}/members/${encodeURIComponent(userId)}`,
    ),

  invites: (id: string) =>
    api.get<{ items: ApiTeamInvite[] }>(`/teams/${encodeURIComponent(id)}/invites`),

  invite: (id: string, input: InviteCreateInput) =>
    api.post<{ items: ApiTeamInvite[] }>(
      `/teams/${encodeURIComponent(id)}/invites`,
      input,
    ),

  cancelInvite: (id: string, inviteId: string) =>
    api.del<{ ok: true }>(
      `/teams/${encodeURIComponent(id)}/invites/${encodeURIComponent(inviteId)}`,
    ),

  acceptInvite: (token: string) => api.post<ApiTeam>("/teams/invites/accept", { token }),

  projects: (id: string) =>
    api.get<{ items: ApiTeamProject[] }>(`/teams/${encodeURIComponent(id)}/projects`),

  assignProject: (id: string, projectId: string) =>
    api.post<{ ok: true }>(`/teams/${encodeURIComponent(id)}/projects`, { projectId }),

  unassignProject: (id: string, projectId: string) =>
    api.del<{ ok: true }>(
      `/teams/${encodeURIComponent(id)}/projects/${encodeURIComponent(projectId)}`,
    ),
}
