"use client"

import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Task, TaskDraft, TaskPriority, TaskStatus } from "@/lib/tasks/types"
import { useI18n } from "@/lib/i18n/context"
import FileInput from "./file-input"
import { useMe } from "@/lib/users/store"

interface TaskDialogProps {
  open: boolean
  initialTask?: Task | null
  /** Tên thành viên dự án để chọn người phụ trách; không truyền → ô nhập tự do. */
  assigneeOptions?: string[]
  onClose: () => void
  onSubmit: (draft: TaskDraft, file: File | null) => void
}

const fieldClass = cn(
  "w-full px-3 py-2 rounded-lg",
  "bg-white dark:bg-[#0F0F12]",
  "border border-zinc-200 dark:border-zinc-700",
  "text-sm text-zinc-900 dark:text-zinc-100",
  "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400",
)

const fieldErrorClass = cn(
  "border-red-400 dark:border-red-500/70",
  "focus:ring-red-400 dark:focus:ring-red-500",
)

const labelClass = "text-xs font-medium text-zinc-700 dark:text-zinc-300"

/** Ngày hôm nay theo giờ máy người dùng, dạng YYYY-MM-DD (giá trị của input type="date"). */
function todayYMD(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// Số No không nằm trong form: server tự cấp khi tạo và giữ cố định về sau.
// Task mới mặc định: bắt đầu hôm nay, người phụ trách là người đang đăng nhập (đều đổi được).
function emptyDraft(assignee = ""): TaskDraft {
  return {
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    assignee,
    tags: [],
    startDate: todayYMD(),
    dueDate: "",
  }
}


export default function TaskDialog({
  open,
  initialTask,
  assigneeOptions,
  onClose,
  onSubmit,
}: TaskDialogProps) {
  const { t } = useI18n()
  const { data: me } = useMe()
  // Cùng định dạng với assigneeOptions (displayName || email) để dropdown chọn đúng
  const myName = me ? me.displayName || me.email : ""
  const [draft, setDraft] = useState<TaskDraft>(() => emptyDraft())
  const [tagsText, setTagsText] = useState("")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (!open) return
    if (initialTask) {
      setDraft({
        title: initialTask.title,
        description: initialTask.description ?? "",
        status: initialTask.status,
        priority: initialTask.priority,
        assignee: initialTask.assignee ?? "",
        tags: initialTask.tags,
        startDate: initialTask.startDate ?? "",
        dueDate: initialTask.dueDate ?? "",
      })
      setTagsText(initialTask.tags.join(", "))
      setFile(null)
    } else {
      setDraft(emptyDraft(myName))
      setTagsText("")
      setFile(null)
    }
    // myName cố ý không nằm trong deps: chỉ reset form khi mở dialog, không reset khi /users/me refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialTask])

  // /users/me về muộn hơn lúc mở dialog → điền người phụ trách mặc định nếu ô vẫn trống
  useEffect(() => {
    if (open && !initialTask && myName) {
      setDraft((d) => (d.assignee ? d : { ...d, assignee: myName }))
    }
  }, [open, initialTask, myName])

  const titleError = useMemo(() => {
    if (!draft.title.trim()) return t("taskDialog.titleRequired")
    return null
  }, [draft.title, t])

  const canSubmit = !titleError

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const tags = tagsText
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean)
    onSubmit(
      {
        ...draft,
        title: draft.title.trim(),
        tags,
      },
      file,
    )
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={cn(
          "max-w-xl",
          "bg-white dark:bg-[#0F0F12]",
          "border border-gray-200 dark:border-[#1F1F23]",
          "text-zinc-900 dark:text-zinc-100",
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100 flex items-center gap-2 justify-center sm:justify-start">
            {initialTask ? t("taskDialog.editTitle") : t("taskDialog.createTitle")}
            {/* Số No cố định → chỉ hiển thị khi sửa, không cho nhập */}
            {initialTask && (
              <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 ring-1 ring-inset ring-zinc-200 dark:ring-zinc-700 text-xs font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">
                #{String(initialTask.no).padStart(2, "0")}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            {t("taskDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="space-y-1">
              <label className={labelClass}>
                {t("taskDialog.titleLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder={t("taskDialog.titlePlaceholder")}
                className={cn(fieldClass, titleError && fieldErrorClass)}
                aria-invalid={!!titleError}
              />
              {titleError && (
                <p className="text-[11px] text-red-600 dark:text-red-400">{titleError}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{t("taskDialog.descriptionLabel")}</label>
            <textarea
              value={draft.description ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder={t("taskDialog.descriptionPlaceholder")}
              rows={3}
              className={cn(fieldClass, "resize-y min-h-[72px]")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass}>{t("taskDialog.statusLabel")}</label>
              <select
                value={draft.status}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, status: e.target.value as TaskStatus }))
                }
                className={fieldClass}
              >
                <option value="pending">{t("tasks.status.pending")}</option>
                <option value="in-progress">{t("tasks.status.inProgress")}</option>
                <option value="completed">{t("tasks.status.completed")}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>{t("taskDialog.priorityLabel")}</label>
              <select
                value={draft.priority}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, priority: e.target.value as TaskPriority }))
                }
                className={fieldClass}
              >
                <option value="low">{t("tasks.priority.low")}</option>
                <option value="medium">{t("tasks.priority.medium")}</option>
                <option value="high">{t("tasks.priority.high")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass}>{t("taskDialog.startDateLabel")}</label>
              <input
                type="date"
                value={draft.startDate ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
                className={fieldClass}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>{t("taskDialog.dueDateLabel")}</label>
              <input
                type="date"
                value={draft.dueDate ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass}>{t("taskDialog.assigneeLabel")}</label>
              {assigneeOptions ? (
                <select
                  value={draft.assignee ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, assignee: e.target.value }))}
                  className={fieldClass}
                >
                  <option value="">{t("access.assigneeNone")}</option>
                  {/* Giữ giá trị cũ (nhập tự do trước đây) nếu không còn trong danh sách */}
                  {draft.assignee && !assigneeOptions.includes(draft.assignee) && (
                    <option value={draft.assignee}>{draft.assignee}</option>
                  )}
                  {assigneeOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={draft.assignee ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, assignee: e.target.value }))}
                  placeholder={t("taskDialog.assigneePlaceholder")}
                  className={fieldClass}
                />
              )}
            </div>
            <div className="space-y-1">
              <label className={labelClass}>{t("taskDialog.tagsLabel")}</label>
              <input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder={t("taskDialog.tagsPlaceholder")}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{t("taskDialog.thumbnailLabel")}</label>
            <FileInput
              size={80}
              currentUrl={initialTask?.thumbnailUrl ?? null}
              onFileChange={setFile}
            />
          </div>

          {/* Footer dính đáy vùng cuộn → nút Huỷ/Lưu luôn trong tầm tay khi form dài */}
          <DialogFooter
            className={cn(
              "sticky bottom-0 z-10 flex-row justify-end",
              "-mx-4 -mb-4 px-4 py-3 sm:-mx-6 sm:-mb-6 sm:px-6",
              "bg-white dark:bg-[#0F0F12]",
              "border-t border-zinc-100 dark:border-zinc-800",
            )}
          >
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                "bg-zinc-100 dark:bg-zinc-800",
                "text-zinc-900 dark:text-zinc-100",
                "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                "transition-colors",
              )}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                "bg-zinc-900 dark:bg-zinc-50",
                "text-zinc-50 dark:text-zinc-900",
                "hover:bg-zinc-800 dark:hover:bg-zinc-200",
                "transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-900 dark:disabled:hover:bg-zinc-50",
              )}
            >
              {initialTask ? t("taskDialog.submitEdit") : t("taskDialog.submitCreate")}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
