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
import FileInput from "./file-input"

interface TaskDialogProps {
  open: boolean
  initialTask?: Task | null
  existingNos: number[]
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

function emptyDraft(no: number): TaskDraft {
  return {
    no,
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    assignee: "",
    tags: [],
    startDate: "",
    dueDate: "",
  }
}

function suggestNextNo(nos: number[]) {
  if (nos.length === 0) return 1
  return Math.max(...nos) + 1
}

export default function TaskDialog({
  open,
  initialTask,
  existingNos,
  onClose,
  onSubmit,
}: TaskDialogProps) {
  const suggestedNo = useMemo(() => suggestNextNo(existingNos), [existingNos])
  const [draft, setDraft] = useState<TaskDraft>(() => emptyDraft(suggestedNo))
  const [noText, setNoText] = useState<string>(String(suggestedNo))
  const [tagsText, setTagsText] = useState("")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (!open) return
    if (initialTask) {
      setDraft({
        no: initialTask.no,
        title: initialTask.title,
        description: initialTask.description ?? "",
        status: initialTask.status,
        priority: initialTask.priority,
        assignee: initialTask.assignee ?? "",
        tags: initialTask.tags,
        startDate: initialTask.startDate ?? "",
        dueDate: initialTask.dueDate ?? "",
      })
      setNoText(String(initialTask.no))
      setTagsText(initialTask.tags.join(", "))
      setFile(null)
    } else {
      const nextNo = suggestNextNo(existingNos)
      setDraft(emptyDraft(nextNo))
      setNoText(String(nextNo))
      setTagsText("")
      setFile(null)
    }
  }, [open, initialTask, existingNos])

  const noError = useMemo(() => {
    const trimmed = noText.trim()
    if (!trimmed) return "Số No là bắt buộc."
    if (!/^\d+$/.test(trimmed)) return "Số No phải là số nguyên dương."
    const value = Number.parseInt(trimmed, 10)
    if (value < 1) return "Số No phải lớn hơn 0."
    const collides = existingNos.some(
      (n) => n === value && n !== initialTask?.no,
    )
    if (collides) return `Số No #${value} đã tồn tại trong dự án.`
    return null
  }, [noText, existingNos, initialTask])

  const titleError = useMemo(() => {
    if (!draft.title.trim()) return "Tiêu đề là bắt buộc."
    return null
  }, [draft.title])

  const canSubmit = !noError && !titleError

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
        no: Number.parseInt(noText.trim(), 10),
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
          <DialogTitle className="text-zinc-900 dark:text-zinc-100">
            {initialTask ? "Sửa Task" : "Tạo Task mới"}
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            Nhập thông tin chi tiết của Task.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3">
            <div className="space-y-1">
              <label className={labelClass}>
                Số No <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                step={1}
                required
                value={noText}
                onChange={(e) => setNoText(e.target.value)}
                placeholder="VD: 6"
                className={cn(fieldClass, "tabular-nums", noError && fieldErrorClass)}
                aria-invalid={!!noError}
                aria-describedby="no-help"
              />
              <p
                id="no-help"
                className={cn(
                  "text-[11px]",
                  noError
                    ? "text-red-600 dark:text-red-400"
                    : "text-zinc-500 dark:text-zinc-400",
                )}
              >
                {noError ?? `Gợi ý: #${suggestedNo}`}
              </p>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="VD: Hoàn thành báo cáo tuần"
                className={cn(fieldClass, titleError && fieldErrorClass)}
                aria-invalid={!!titleError}
              />
              {titleError && (
                <p className="text-[11px] text-red-600 dark:text-red-400">{titleError}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Mô tả</label>
            <textarea
              value={draft.description ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="Chi tiết công việc, ghi chú…"
              rows={3}
              className={cn(fieldClass, "resize-y min-h-[72px]")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass}>Trạng thái</label>
              <select
                value={draft.status}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, status: e.target.value as TaskStatus }))
                }
                className={fieldClass}
              >
                <option value="pending">Chưa thực hiện</option>
                <option value="in-progress">Đang thực hiện</option>
                <option value="completed">Đã hoàn thành</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Mức ưu tiên</label>
              <select
                value={draft.priority}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, priority: e.target.value as TaskPriority }))
                }
                className={fieldClass}
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass}>Ngày bắt đầu</label>
              <input
                type="date"
                value={draft.startDate ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
                className={fieldClass}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Hạn chót</label>
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
              <label className={labelClass}>Người phụ trách</label>
              <input
                value={draft.assignee ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, assignee: e.target.value }))}
                placeholder="VD: Dung"
                className={fieldClass}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Tags (phân cách bằng dấu phẩy)</label>
              <input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="backend, urgent"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Thumbnail (tuỳ chọn)</label>
            <FileInput
              size={80}
              currentUrl={initialTask?.thumbnailUrl ?? null}
              onFileChange={setFile}
            />
          </div>

          <DialogFooter className="pt-2">
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
              Huỷ
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
              {initialTask ? "Lưu thay đổi" : "Tạo task"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
