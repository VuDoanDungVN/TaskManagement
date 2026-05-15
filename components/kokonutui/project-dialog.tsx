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
import type { ProjectDraft } from "@/lib/projects/types"
import FileInput from "./file-input"

interface ProjectDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (draft: ProjectDraft, file: File | null) => void
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

function emptyDraft(): ProjectDraft {
  return {
    name: "",
    description: "",
  }
}

export default function ProjectDialog({ open, onClose, onSubmit }: ProjectDialogProps) {
  const [draft, setDraft] = useState<ProjectDraft>(emptyDraft())
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (open) {
      setDraft(emptyDraft())
      setFile(null)
    }
  }, [open])

  const nameError = useMemo(() => {
    if (!draft.name.trim()) return "Tên dự án là bắt buộc."
    return null
  }, [draft.name])

  const canSubmit = !nameError

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit(
      {
        name: draft.name.trim(),
        description: draft.description?.trim() || null,
      },
      file,
    )
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={cn(
          "max-w-lg",
          "bg-white dark:bg-[#0F0F12]",
          "border border-gray-200 dark:border-[#1F1F23]",
          "text-zinc-900 dark:text-zinc-100",
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100">Tạo dự án mới</DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            Nhập thông tin dự án để bắt đầu quản lý task.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className={labelClass}>
              Tên dự án <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="VD: Website thương mại điện tử"
              className={cn(fieldClass, nameError && fieldErrorClass)}
              aria-invalid={!!nameError}
            />
            {nameError && (
              <p className="text-[11px] text-red-600 dark:text-red-400">{nameError}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Mô tả</label>
            <textarea
              value={draft.description ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="Mục tiêu, phạm vi, deadline tổng…"
              rows={3}
              className={cn(fieldClass, "resize-y min-h-[72px]")}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Thumbnail (tuỳ chọn)</label>
            <FileInput size={96} onFileChange={setFile} />
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
              Tạo dự án
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
