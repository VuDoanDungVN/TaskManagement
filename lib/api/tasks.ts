import { api, uploadWithProgress } from "./client"

export type ApiTaskStatus = "pending" | "in-progress" | "completed"
export type ApiTaskPriority = "low" | "medium" | "high"

export interface ApiTask {
  id: string
  projectId: string
  no: number
  title: string
  description: string | null
  status: ApiTaskStatus
  priority: ApiTaskPriority
  assignee: string | null
  tags: string[]
  startDate: string | null
  dueDate: string | null
  thumbnailKey: string | null
  thumbnailUrl: string | null
  createdAt: number
  updatedAt: number
  commentCount: number
  /** Số ảnh của task; thumbnailUrl = ảnh đại diện (ảnh đầu tiên). */
  imageCount: number
}

export interface ApiTaskImage {
  id: string
  url: string
  mimeType: string | null
  fileSize: number | null
  position: number
  createdAt: number
}

/** Giới hạn khớp với Worker (task-images.ts / uploads.ts). */
export const TASK_IMAGE_LIMIT = 10
export const TASK_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const TASK_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"]

/** Không có `no`: server tự cấp số No khi tạo và số này cố định về sau. */
export interface TaskCreateInput {
  projectId: string
  title: string
  description?: string | null
  status?: ApiTaskStatus
  priority?: ApiTaskPriority
  assignee?: string | null
  tags?: string[]
  startDate?: string | null
  dueDate?: string | null
  thumbnailKey?: string | null
}

export type TaskUpdateInput = Partial<Omit<TaskCreateInput, "projectId">>

export const tasksApi = {
  listByProject: (projectId: string) =>
    api.get<{ items: ApiTask[] }>(`/tasks?projectId=${encodeURIComponent(projectId)}`),

  /** Tất cả task của các project user sở hữu — dùng cho Dashboard tổng quan. */
  listAll: () => api.get<{ items: ApiTask[] }>("/tasks"),

  get: (id: string) => api.get<ApiTask>(`/tasks/${encodeURIComponent(id)}`),

  create: (input: TaskCreateInput) => api.post<ApiTask>("/tasks", input),

  update: (id: string, patch: TaskUpdateInput) =>
    api.put<ApiTask>(`/tasks/${encodeURIComponent(id)}`, patch),

  remove: (id: string) => api.del<{ ok: true }>(`/tasks/${encodeURIComponent(id)}`),

  images: (id: string) =>
    api.get<{ items: ApiTaskImage[] }>(`/tasks/${encodeURIComponent(id)}/images`),

  /** Upload 1 ảnh (gọi tuần tự từng ảnh để có tiến trình riêng). */
  uploadImage: (id: string, file: File, onProgress?: (fraction: number) => void) => {
    const fd = new FormData()
    fd.append("file", file)
    return uploadWithProgress<{ items: ApiTaskImage[] }>(
      `/tasks/${encodeURIComponent(id)}/images`,
      fd,
      onProgress,
    )
  },

  reorderImages: (id: string, ids: string[]) =>
    api.put<{ items: ApiTaskImage[] }>(`/tasks/${encodeURIComponent(id)}/images/order`, { ids }),

  deleteImage: (id: string, imageId: string) =>
    api.del<{ ok: true }>(
      `/tasks/${encodeURIComponent(id)}/images/${encodeURIComponent(imageId)}`,
    ),
}
