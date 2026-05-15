import { AlertCircle, CheckCircle2, Timer } from "lucide-react"
import type { TaskPriority, TaskStatus } from "./types"

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; icon: typeof Timer; pill: string; dot: string }
> = {
  pending: {
    label: "Chưa thực hiện",
    icon: Timer,
    pill: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  "in-progress": {
    label: "Đang thực hiện",
    icon: AlertCircle,
    pill: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  completed: {
    label: "Đã hoàn thành",
    icon: CheckCircle2,
    pill: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
}

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; pill: string }> = {
  low: {
    label: "Thấp",
    pill: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300",
  },
  medium: {
    label: "Trung bình",
    pill: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  },
  high: {
    label: "Cao",
    pill: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  },
}

export function formatDate(iso?: string | null) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function isOverdue(task: { status: string; dueDate?: string | null }) {
  if (!task.dueDate || task.status === "completed") return false
  const due = new Date(task.dueDate)
  if (Number.isNaN(due.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due.getTime() < today.getTime()
}
