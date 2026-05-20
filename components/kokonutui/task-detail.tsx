"use client"

import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  ImageIcon,
  Pencil,
  Tag,
  Trash2,
  User2,
} from "lucide-react"
import React from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { Task, TaskDraft } from "@/lib/tasks/types"
import {
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  formatDate,
  isOverdue,
} from "@/lib/tasks/utils"
import {
  TASKS_QUERY_KEY,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from "@/lib/tasks/store"
import { uploadsApi } from "@/lib/api/uploads"
import { useI18n } from "@/lib/i18n/context"
import TaskDialog from "./task-dialog"

interface TaskDetailProps {
  task: Task
  projectId: string
  canManage: boolean
}

export default function TaskDetail({ task, projectId, canManage }: TaskDetailProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const status = STATUS_CONFIG[task.status]
  const priority = PRIORITY_CONFIG[task.priority]
  const overdue = isOverdue(task)
  const start = formatDate(task.startDate)
  const due = formatDate(task.dueDate)

  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: siblingTasks = [] } = useTasks(canManage ? projectId : null)
  const existingNos = useMemo(() => siblingTasks.map((t) => t.no), [siblingTasks])

  const updateMutation = useUpdateTask(projectId)
  const deleteMutation = useDeleteTask(projectId)

  async function handleEditSubmit(draft: TaskDraft, file: File | null) {
    await updateMutation.mutateAsync({ id: task.id, patch: draft })
    if (file) {
      try {
        await uploadsApi.taskThumbnail(task.id, file)
      } catch (e) {
        console.error("Upload thumbnail thất bại:", e)
      }
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY(projectId) })
    }
    setDialogOpen(false)
  }

  function handleDelete() {
    if (typeof window !== "undefined" && !window.confirm(t("taskDetail.deleteConfirm"))) return
    deleteMutation.mutate(task.id, {
      onSuccess: () => router.push(`/dashboard/${projectId}`),
    })
  }

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
      <div className="p-4 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => router.push(`/dashboard/${projectId}`)}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
            "text-xs font-medium",
            "text-zinc-700 dark:text-zinc-300",
            "border border-zinc-200 dark:border-zinc-800",
            "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
            "transition-colors",
          )}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t("taskDetail.back")}
        </button>

        {canManage && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
                "text-xs font-medium",
                "text-zinc-700 dark:text-zinc-300",
                "border border-zinc-200 dark:border-zinc-800",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                "transition-colors",
              )}
            >
              <Pencil className="w-3.5 h-3.5" />
              {t("taskDetail.edit")}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
                "text-xs font-medium",
                "text-red-600 dark:text-red-400",
                "border border-red-200 dark:border-red-900/50",
                "hover:bg-red-50 dark:hover:bg-red-900/20",
                "disabled:opacity-50",
                "transition-colors",
              )}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleteMutation.isPending ? t("common.deleting") : t("taskDetail.delete")}
            </button>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col md:flex-row gap-6">
        <div
          className={cn(
            "w-full md:w-56 h-40 md:h-44 shrink-0 rounded-xl overflow-hidden",
            "border border-zinc-200 dark:border-zinc-700",
            "bg-zinc-100 dark:bg-zinc-800",
            "flex items-center justify-center",
          )}
        >
          {task.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={task.thumbnailUrl}
              alt={task.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center justify-center px-2 py-0.5 rounded-md",
                "bg-zinc-100 dark:bg-zinc-800",
                "ring-1 ring-inset ring-zinc-200 dark:ring-zinc-700",
                "text-[11px] font-semibold tabular-nums",
                "text-zinc-600 dark:text-zinc-300",
              )}
            >
              #{String(task.no).padStart(2, "0")}
            </span>
            <span
              className={cn(
                "px-2 py-1 rounded-full text-[11px] font-medium flex items-center gap-1",
                status.pill,
              )}
            >
              {React.createElement(status.icon, { className: "w-3 h-3" })}
              {t(status.labelKey)}
            </span>
            <span
              className={cn(
                "px-2 py-1 rounded-full text-[11px] font-medium",
                priority.pill,
              )}
            >
              {t("taskDetail.priorityWithLabel", { value: t(priority.labelKey) })}
            </span>
            {overdue && (
              <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                {t("taskDetail.overdue")}
              </span>
            )}
          </div>

          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 break-words">
            {task.title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <User2 className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {t("taskDetail.assignee")}
              </span>
              <span>{task.assignee?.trim() || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {t("taskDetail.startDate")}
              </span>
              <span>{start ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {t("taskDetail.dueDate")}
              </span>
              <span className={cn(overdue && "text-red-600 dark:text-red-400")}>
                {due ?? "—"}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Tag className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="font-medium text-zinc-700 dark:text-zinc-300 shrink-0">
                {t("taskDetail.tags")}
              </span>
              <div className="flex flex-wrap items-center gap-1">
                {task.tags.length === 0 ? (
                  <span>—</span>
                ) : (
                  task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px]"
                    >
                      #{tag}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-2">
            <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              {t("taskDetail.descriptionHeading")}
            </div>
            {task.description ? (
              <p className="text-sm text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap break-words">
                {task.description}
              </p>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-500 italic">
                {t("taskDetail.noDescription")}
              </p>
            )}
          </div>
        </div>
      </div>

      {canManage && (
        <TaskDialog
          open={dialogOpen}
          initialTask={task}
          existingNos={existingNos}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  )
}
