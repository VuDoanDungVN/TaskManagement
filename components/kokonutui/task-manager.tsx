"use client"

import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"
import { ListChecks, Plus, Search } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import {
  TASKS_QUERY_KEY,
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from "@/lib/tasks/store"
import type { Task, TaskDraft, TaskStatus } from "@/lib/tasks/types"
import { STATUS_CONFIG } from "@/lib/tasks/utils"
import { uploadsApi } from "@/lib/api/uploads"
import TaskItem from "./task-item"
import TaskDialog from "./task-dialog"

type FilterValue = "all" | TaskStatus

interface TaskManagerProps {
  projectId: string
}

export default function TaskManager({ projectId }: TaskManagerProps) {
  const { data: tasks = [], isLoading, error } = useTasks(projectId)
  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask(projectId)
  const deleteMutation = useDeleteTask(projectId)
  const queryClient = useQueryClient()

  const [filter, setFilter] = useState<FilterValue>("all")
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)

  const counts = useMemo(() => {
    const c = { all: tasks.length, pending: 0, "in-progress": 0, completed: 0 }
    for (const t of tasks) c[t.status] += 1
    return c
  }, [tasks])

  const existingNos = useMemo(() => tasks.map((t) => t.no), [tasks])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tasks
      .filter((t) => (filter === "all" ? true : t.status === filter))
      .filter((t) => {
        if (!q) return true
        const hay = [
          t.title,
          t.description ?? "",
          t.assignee ?? "",
          t.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase()
        return hay.includes(q)
      })
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  }, [tasks, filter, search])

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(task: Task) {
    setEditing(task)
    setDialogOpen(true)
  }

  async function handleSubmit(draft: TaskDraft, file: File | null) {
    let taskId: string
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, patch: draft })
      taskId = editing.id
    } else {
      const created = await createMutation.mutateAsync({ projectId, ...draft })
      taskId = created.id
    }
    if (file) {
      try {
        await uploadsApi.taskThumbnail(taskId, file)
      } catch (e) {
        console.error("Upload thumbnail thất bại:", e)
      }
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY(projectId) })
    }
  }

  function handleDelete(id: string) {
    if (typeof window !== "undefined" && !window.confirm("Xoá task này?")) return
    deleteMutation.mutate(id)
  }

  const filters: { value: FilterValue; label: string }[] = [
    { value: "all", label: "Tất cả" },
    { value: "pending", label: STATUS_CONFIG.pending.label },
    { value: "in-progress", label: STATUS_CONFIG["in-progress"].label },
    { value: "completed", label: STATUS_CONFIG.completed.label },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ListChecks className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
            Quản lý Task
          </h2>
          <button
            type="button"
            onClick={openCreate}
            className={cn(
              "flex items-center justify-center gap-2",
              "py-2 px-3 rounded-lg",
              "text-xs font-medium",
              "bg-zinc-900 dark:bg-zinc-50",
              "text-zinc-50 dark:text-zinc-900",
              "hover:bg-zinc-800 dark:hover:bg-zinc-200",
              "shadow-sm hover:shadow",
              "transition-all duration-200",
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo task mới</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {filters.map((f) => {
              const active = filter === f.value
              const count = counts[f.value as keyof typeof counts]
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium",
                    "border transition-colors",
                    active
                      ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 border-zinc-900 dark:border-zinc-50"
                      : "bg-white dark:bg-zinc-900/70 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                  )}
                >
                  <span>{f.label}</span>
                  <span
                    className={cn(
                      "ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px]",
                      active
                        ? "bg-zinc-50/20 dark:bg-zinc-900/20 text-current"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="relative md:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm task theo tên, tag, người phụ trách…"
              className={cn(
                "w-full pl-8 pr-3 py-2 rounded-lg text-xs",
                "bg-white dark:bg-zinc-900/70",
                "border border-zinc-200 dark:border-zinc-800",
                "text-zinc-900 dark:text-zinc-100",
                "placeholder:text-zinc-500 dark:placeholder:text-zinc-500",
                "focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400",
              )}
            />
          </div>
        </div>

        <div
          className={cn(
            "w-full",
            "bg-white dark:bg-zinc-900/70",
            "border border-zinc-100 dark:border-zinc-800",
            "rounded-xl shadow-sm backdrop-blur-xl",
          )}
        >
          {isLoading ? (
            <div className="p-6 text-xs text-zinc-600 dark:text-zinc-400 text-center">
              Đang tải dữ liệu…
            </div>
          ) : error ? (
            <div className="p-6 text-xs text-red-600 dark:text-red-400 text-center">
              Lỗi: {(error as Error).message}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Không có task nào
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                {search
                  ? "Thử từ khoá khác hoặc xoá bộ lọc."
                  : "Tạo task đầu tiên để bắt đầu quản lý công việc."}
              </div>
            </div>
          ) : (
            <div className="p-2 divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  no={t.no}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <TaskDialog
        open={dialogOpen}
        initialTask={editing}
        existingNos={existingNos}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
