"use client"

import { cn } from "@/lib/utils"
import { Calendar, ImageIcon, MessageSquare, Pencil, Trash2, User2 } from "lucide-react"
import React from "react"
import { useRouter } from "next/navigation"
import type { Task } from "@/lib/tasks/types"
import { PRIORITY_CONFIG, STATUS_CONFIG, formatDate, isOverdue } from "@/lib/tasks/utils"
import { useI18n } from "@/lib/i18n/context"

interface TaskItemProps {
  task: Task
  no: number
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export default function TaskItem({ task, no, onEdit, onDelete }: TaskItemProps) {
  const router = useRouter()
  const { t } = useI18n()
  const status = STATUS_CONFIG[task.status]
  const priority = PRIORITY_CONFIG[task.priority]
  const overdue = isOverdue(task)
  const start = formatDate(task.startDate)
  const due = formatDate(task.dueDate)

  const openDetail = () => router.push(`/dashboard/${task.projectId}/${task.id}`)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          openDetail()
        }
      }}
      className={cn(
        "group flex items-stretch gap-3 cursor-pointer",
        "p-3 rounded-lg",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:focus-visible:ring-zinc-400",
        "transition-all duration-200",
      )}
    >
      <div
        className={cn(
          "w-14 h-14 shrink-0 rounded-lg overflow-hidden",
          "border border-zinc-200 dark:border-zinc-700",
          "bg-zinc-100 dark:bg-zinc-800",
          "flex items-center justify-center",
        )}
      >
        {task.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={task.thumbnailUrl} alt={task.title} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-2">
              <span
                className={cn(
                  "shrink-0 inline-flex items-center justify-center",
                  "px-1.5 py-0.5 rounded-md",
                  "bg-zinc-100 dark:bg-zinc-800",
                  "ring-1 ring-inset ring-zinc-200 dark:ring-zinc-700",
                  "text-[10px] font-semibold tabular-nums",
                  "text-zinc-600 dark:text-zinc-300",
                )}
                aria-label={t("taskItem.ariaNumber", { value: no })}
              >
                #{String(no).padStart(2, "0")}
              </span>
              <span className="truncate">{task.title}</span>
            </h3>
            {task.description && (
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-0.5">
                {task.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={cn(
                "px-2 py-1 rounded-full text-[11px] font-medium flex items-center gap-1",
                status.pill,
              )}
            >
              {React.createElement(status.icon, { className: "w-3 h-3" })}
              {t(status.labelKey)}
            </span>
            <span className={cn("px-2 py-1 rounded-full text-[11px] font-medium", priority.pill)}>
              {t(priority.labelKey)}
            </span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-600 dark:text-zinc-400">
          {task.assignee && (
            <span className="inline-flex items-center gap-1">
              <User2 className="w-3 h-3" />
              {task.assignee}
            </span>
          )}
          {(start || due) && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {start ? `${start} → ` : "→ "}
              <span className={cn(overdue && "text-red-600 dark:text-red-400")}>
                {due ?? "—"}
              </span>
            </span>
          )}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <span
            className="inline-flex items-center gap-1 tabular-nums"
            aria-label={t("taskItem.ariaComments", { count: task.commentCount })}
            title={t("taskItem.ariaComments", { count: task.commentCount })}
          >
            <MessageSquare className="w-3 h-3" />
            {task.commentCount}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(task)
          }}
          className={cn(
            "p-1.5 rounded-md",
            "text-zinc-600 dark:text-zinc-400",
            "hover:text-zinc-900 dark:hover:text-zinc-100",
            "hover:bg-zinc-200 dark:hover:bg-zinc-700/60",
            "transition-colors",
          )}
          aria-label={t("taskItem.ariaEdit")}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(task.id)
          }}
          className={cn(
            "p-1.5 rounded-md",
            "text-zinc-600 dark:text-zinc-400",
            "hover:text-red-600 dark:hover:text-red-400",
            "hover:bg-red-100 dark:hover:bg-red-900/30",
            "transition-colors",
          )}
          aria-label={t("taskItem.ariaDelete")}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
