import { api } from "./client"

export interface ApiCommentAuthor {
  id: string
  email: string | null
  displayName: string | null
  avatarUrl: string | null
}

export interface ApiCommentReplyTo {
  id: string
  authorId: string | null
  authorDisplayName: string | null
  authorEmail: string | null
}

export interface ApiCommentAttachment {
  id: string
  fileKey: string
  fileName: string
  fileSize: number
  mimeType: string
  fileUrl: string | null
  createdAt: number
}

export interface ApiComment {
  id: string
  taskId: string
  body: string
  parentId: string | null
  replyTo: ApiCommentReplyTo | null
  attachments: ApiCommentAttachment[]
  createdAt: number
  updatedAt: number
  author: ApiCommentAuthor
}

export interface CommentCreateInput {
  body: string
  parentId?: string | null
  files?: File[]
}

export const commentsApi = {
  listByTask: (taskId: string) =>
    api.get<{ items: ApiComment[] }>(`/tasks/${encodeURIComponent(taskId)}/comments`),

  create: (taskId: string, input: CommentCreateInput) => {
    const files = input.files ?? []
    if (files.length === 0) {
      return api.post<ApiComment>(
        `/tasks/${encodeURIComponent(taskId)}/comments`,
        { body: input.body, parentId: input.parentId ?? null },
      )
    }
    const fd = new FormData()
    fd.append("body", input.body)
    if (input.parentId) fd.append("parentId", input.parentId)
    for (const f of files) fd.append("file", f, f.name)
    return api.upload<ApiComment>(
      `/tasks/${encodeURIComponent(taskId)}/comments`,
      fd,
    )
  },

  update: (id: string, body: string) =>
    api.put<ApiComment>(`/comments/${encodeURIComponent(id)}`, { body }),

  remove: (id: string) =>
    api.del<{ ok: true }>(`/comments/${encodeURIComponent(id)}`),
}
