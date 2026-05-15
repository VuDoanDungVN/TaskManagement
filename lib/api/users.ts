import { api } from "./client"

export interface ApiUser {
  id: string
  email: string
  displayName: string | null
  avatarKey: string | null
  avatarUrl: string | null
  emailVerified: boolean
  createdAt: number
  updatedAt: number
}

export interface UserUpdateInput {
  displayName?: string | null
  avatarKey?: string | null
}

export const usersApi = {
  me: () => api.get<ApiUser>("/users/me"),
  updateMe: (patch: UserUpdateInput) => api.put<ApiUser>("/users/me", patch),
}
