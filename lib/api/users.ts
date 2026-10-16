import { api } from "./client"
import type { TeamRole } from "./teams"

/** 'user' = khách hàng (customer): chỉ truy cập dự án được admin gán. */
export type SystemRole = "admin" | "user"
export type UserStatus = "active" | "disabled"

export interface ApiUser {
  id: string
  email: string
  displayName: string | null
  avatarKey: string | null
  avatarUrl: string | null
  emailVerified: boolean
  role: SystemRole
  status: UserStatus
  /** Số nhóm user tham gia (chỉ có ở danh sách). */
  teamCount?: number
  /** Số dự án user được gán (chỉ có ở danh sách). */
  projectCount?: number
  createdAt: number
  updatedAt: number
}

export interface UserCreateInput {
  email: string
  displayName?: string | null
  role?: SystemRole
  projectIds?: string[]
}

export interface SetupLinkResult {
  setPasswordUrl: string
  emailSent: boolean
}

export interface ApiUserProject {
  projectId: string
  name: string
  thumbnailUrl: string | null
  addedAt: number
}

export interface UserUpdateInput {
  displayName?: string | null
  avatarKey?: string | null
}

/** Patch dành cho admin (sửa tên, đổi vai trò hệ thống, khoá/mở khoá). */
export interface AdminUserUpdateInput {
  displayName?: string | null
  role?: SystemRole
  status?: UserStatus
}

export interface UserListParams {
  limit?: number
  cursor?: string | null
  search?: string
}

export interface UserListPage {
  items: ApiUser[]
  nextCursor: string | null
}

/** Một nhóm mà user đang tham gia (dùng cho dialog quản lý nhóm của user). */
export interface ApiUserTeam {
  teamId: string
  name: string
  role: TeamRole
  isOwner: boolean
  memberCount: number
  avatarUrl: string | null
}

export const usersApi = {
  me: () => api.get<ApiUser>("/users/me"),
  updateMe: (patch: UserUpdateInput) => api.put<ApiUser>("/users/me", patch),

  list: (params?: UserListParams) => {
    const q = new URLSearchParams()
    if (params?.limit) q.set("limit", String(params.limit))
    if (params?.cursor) q.set("cursor", params.cursor)
    if (params?.search) q.set("search", params.search)
    const qs = q.toString()
    return api.get<UserListPage>(`/users${qs ? `?${qs}` : ""}`)
  },

  // Admin
  create: (input: UserCreateInput) =>
    api.post<SetupLinkResult & { user: ApiUser }>("/users", input),

  update: (id: string, patch: AdminUserUpdateInput) =>
    api.put<ApiUser>(`/users/${encodeURIComponent(id)}`, patch),

  resendSetupLink: (id: string) =>
    api.post<SetupLinkResult>(`/users/${encodeURIComponent(id)}/setup-link`, {}),

  projects: (id: string) =>
    api.get<{ items: ApiUserProject[] }>(`/users/${encodeURIComponent(id)}/projects`),

  setProjects: (id: string, projectIds: string[]) =>
    api.put<{ ok: true; projectIds: string[] }>(
      `/users/${encodeURIComponent(id)}/projects`,
      { projectIds },
    ),

  teams: (id: string) =>
    api.get<{ items: ApiUserTeam[] }>(`/users/${encodeURIComponent(id)}/teams`),

  addToTeam: (id: string, input: { teamId: string; role?: "admin" | "member" }) =>
    api.post<{ ok: true }>(`/users/${encodeURIComponent(id)}/teams`, input),

  removeFromTeam: (id: string, teamId: string) =>
    api.del<{ ok: true }>(
      `/users/${encodeURIComponent(id)}/teams/${encodeURIComponent(teamId)}`,
    ),
}
