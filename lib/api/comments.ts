import { api } from "./client"

export interface ApiCommentAuthor {
  id: string
  email: string | null
  displayName: string | null
  avatarUrl: string | null
}

export interface ApiComment {
  id: string
  taskId: string
  body: string
  createdAt: number
  updatedAt: number
  author: ApiCommentAuthor
}

export const commentsApi = {
  listByTask: (taskId: string) =>
    api.get<{ items: ApiComment[] }>(`/tasks/${encodeURIComponent(taskId)}/comments`),

  create: (taskId: string, body: string) =>
    api.post<ApiComment>(`/tasks/${encodeURIComponent(taskId)}/comments`, { body }),

  update: (id: string, body: string) =>
    api.put<ApiComment>(`/comments/${encodeURIComponent(id)}`, { body }),

  remove: (id: string) =>
    api.del<{ ok: true }>(`/comments/${encodeURIComponent(id)}`),
}
