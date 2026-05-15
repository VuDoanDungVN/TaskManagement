import { api } from "./client"

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
}

export interface TaskCreateInput {
  projectId: string
  no: number
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

  get: (id: string) => api.get<ApiTask>(`/tasks/${encodeURIComponent(id)}`),

  create: (input: TaskCreateInput) => api.post<ApiTask>("/tasks", input),

  update: (id: string, patch: TaskUpdateInput) =>
    api.put<ApiTask>(`/tasks/${encodeURIComponent(id)}`, patch),

  remove: (id: string) => api.del<{ ok: true }>(`/tasks/${encodeURIComponent(id)}`),
}
