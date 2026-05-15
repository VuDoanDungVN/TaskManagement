export type {
  ApiTask as Task,
  ApiTaskStatus as TaskStatus,
  ApiTaskPriority as TaskPriority,
  TaskCreateInput,
  TaskUpdateInput,
} from "@/lib/api/tasks"

// Local draft: dùng trong task-dialog, KHÔNG có projectId (TaskManager set khi submit)
export interface TaskDraft {
  no: number
  title: string
  description?: string | null
  status: import("@/lib/api/tasks").ApiTaskStatus
  priority: import("@/lib/api/tasks").ApiTaskPriority
  assignee?: string | null
  tags: string[]
  startDate?: string | null
  dueDate?: string | null
  thumbnailKey?: string | null
}
