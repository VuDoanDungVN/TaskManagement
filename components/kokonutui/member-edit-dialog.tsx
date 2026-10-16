"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useI18n } from "@/lib/i18n/context"
import { useUpdateUser } from "@/lib/users/store"
import type { ApiUser, SystemRole } from "@/lib/api/users"

interface MemberEditDialogProps {
  open: boolean
  user: ApiUser | null
  isSelf: boolean
  onClose: () => void
}

const fieldClass = cn(
  "w-full px-3 py-2 rounded-lg",
  "bg-white dark:bg-[#0F0F12]",
  "border border-zinc-200 dark:border-zinc-700",
  "text-sm text-zinc-900 dark:text-zinc-100",
  "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400",
)
const labelClass = "text-xs font-medium text-zinc-700 dark:text-zinc-300"

export default function MemberEditDialog({
  open,
  user,
  isSelf,
  onClose,
}: MemberEditDialogProps) {
  const { t } = useI18n()
  const updateUser = useUpdateUser()
  const [name, setName] = useState("")
  const [role, setRole] = useState<SystemRole>("user")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && user) {
      setName(user.displayName ?? "")
      setRole(user.role)
      setError(null)
    }
  }, [open, user])

  const submitting = updateUser.isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || submitting) return
    setError(null)
    try {
      await updateUser.mutateAsync({
        id: user.id,
        patch: { displayName: name.trim() || null, role },
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("membersList.edit.error"))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !submitting && onClose()}>
      <DialogContent
        className={cn(
          "max-w-md",
          "bg-white dark:bg-[#0F0F12]",
          "border border-gray-200 dark:border-[#1F1F23]",
          "text-zinc-900 dark:text-zinc-100",
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100">
            {t("membersList.edit.title")}
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            {user?.email}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className={labelClass}>{t("membersList.edit.nameLabel")}</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("membersList.edit.namePlaceholder")}
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>{t("membersList.edit.roleLabel")}</label>
            <div className="grid grid-cols-2 gap-2">
              {(["user", "admin"] as const).map((r) => {
                const selected = role === r
                // Không cho admin tự hạ cấp chính mình
                const disabled = isSelf && r === "user"
                return (
                  <button
                    key={r}
                    type="button"
                    disabled={disabled}
                    onClick={() => setRole(r)}
                    className={cn(
                      "text-left px-3 py-2 rounded-lg border transition-colors",
                      selected
                        ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/60"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600",
                      disabled && "opacity-40 cursor-not-allowed",
                    )}
                  >
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {r === "admin"
                        ? t("membersList.edit.roleAdmin")
                        : t("membersList.edit.roleUser")}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {error && <p className="text-[11px] text-red-600 dark:text-red-400">{error}</p>}

          <DialogFooter className="pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
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
              disabled={submitting}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                "bg-zinc-900 dark:bg-zinc-50",
                "text-zinc-50 dark:text-zinc-900",
                "hover:bg-zinc-800 dark:hover:bg-zinc-200",
                "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {submitting ? t("common.saving") : t("membersList.edit.submit")}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
