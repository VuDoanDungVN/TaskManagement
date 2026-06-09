"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useI18n } from "@/lib/i18n/context"

interface TeamDeleteDialogProps {
  open: boolean
  teamName: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function TeamDeleteDialog({
  open,
  teamName,
  onClose,
  onConfirm,
}: TeamDeleteDialogProps) {
  const { t } = useI18n()
  const confirmWord = t("teamsList.deleteConfirmWord")
  const [value, setValue] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setValue("")
      setDeleting(false)
      setError(null)
    }
  }, [open])

  const matched = value.trim() === confirmWord
  const canDelete = matched && !deleting

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    if (!canDelete) return
    setDeleting(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("teamsList.deleteError"))
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !deleting && onClose()}>
      <DialogContent
        className={cn(
          "max-w-md",
          "bg-white dark:bg-[#0F0F12]",
          "border border-gray-200 dark:border-[#1F1F23]",
          "text-zinc-900 dark:text-zinc-100",
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            {t("teamsList.deleteTitle")}
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            {t("teamsList.deleteMessage", { name: teamName })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirm} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t("teamsList.deleteConfirmPrompt", { word: confirmWord })}
            </label>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t("teamsList.deletePlaceholder", { word: confirmWord })}
              className={cn(
                "w-full px-3 py-2 rounded-lg",
                "bg-white dark:bg-[#0F0F12]",
                "border border-zinc-200 dark:border-zinc-700",
                "text-sm text-zinc-900 dark:text-zinc-100",
                "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                "focus:outline-none focus:ring-2 focus:ring-red-400 dark:focus:ring-red-500",
              )}
            />
            {error && <p className="text-[11px] text-red-600 dark:text-red-400">{error}</p>}
          </div>

          <DialogFooter className="pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                "bg-zinc-100 dark:bg-zinc-800",
                "text-zinc-900 dark:text-zinc-100",
                "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                "transition-colors disabled:opacity-50",
              )}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={!canDelete}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                "bg-red-600 text-white",
                "hover:bg-red-700",
                "transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600",
              )}
            >
              {deleting ? t("teamsList.deleting") : t("teamsList.deleteSubmit")}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
