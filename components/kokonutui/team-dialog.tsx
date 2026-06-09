"use client"

import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { TeamVisibility } from "@/lib/api/teams"
import { useI18n } from "@/lib/i18n/context"
import FileInput from "./file-input"

export interface TeamDialogDraft {
  name: string
  description: string | null
  visibility: TeamVisibility
}

interface TeamDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (draft: TeamDialogDraft, file: File | null, emails: string[]) => Promise<void> | void
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function TeamDialog({ open, onClose, onSubmit }: TeamDialogProps) {
  const { t } = useI18n()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState<TeamVisibility>("private")
  const [file, setFile] = useState<File | null>(null)
  const [emails, setEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName("")
      setDescription("")
      setVisibility("private")
      setFile(null)
      setEmails([])
      setEmailInput("")
      setEmailError(null)
      setSubmitting(false)
      setSubmitError(null)
    }
  }, [open])

  const nameError = useMemo(() => {
    if (!name.trim()) return t("teamDialog.nameRequired")
    return null
  }, [name, t])

  const canSubmit = !nameError && !submitting

  function commitEmail(): boolean {
    const value = emailInput.trim().toLowerCase()
    if (!value) return true
    if (!EMAIL_RE.test(value)) {
      setEmailError(t("teamDialog.inviteInvalid"))
      return false
    }
    if (!emails.includes(value)) {
      setEmails((prev) => [...prev, value])
    }
    setEmailInput("")
    setEmailError(null)
    return true
  }

  function handleEmailKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      commitEmail()
    } else if (e.key === "Backspace" && !emailInput && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1))
    }
  }

  function removeEmail(target: string) {
    setEmails((prev) => prev.filter((e) => e !== target))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (nameError || submitting) return

    // Gom email còn trong ô nhập (chưa nhấn Enter) vào danh sách
    const pending = emailInput.trim().toLowerCase()
    let finalEmails = emails
    if (pending) {
      if (!EMAIL_RE.test(pending)) {
        setEmailError(t("teamDialog.inviteInvalid"))
        return
      }
      finalEmails = emails.includes(pending) ? emails : [...emails, pending]
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(
        {
          name: name.trim(),
          description: description.trim() || null,
          visibility,
        },
        file,
        finalEmails,
      )
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("teamDialog.createError"))
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !submitting && onClose()}>
      <DialogContent
        className={cn(
          "max-w-lg",
          "bg-white dark:bg-[#0F0F12]",
          "border border-gray-200 dark:border-[#1F1F23]",
          "text-zinc-900 dark:text-zinc-100",
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100">
            {t("teamDialog.createTitle")}
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            {t("teamDialog.createDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className={labelClass}>
              {t("teamDialog.nameLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("teamDialog.namePlaceholder")}
              className={cn(fieldClass, nameError && fieldErrorClass)}
              aria-invalid={!!nameError}
            />
            {nameError && (
              <p className="text-[11px] text-red-600 dark:text-red-400">{nameError}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{t("teamDialog.descriptionLabel")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("teamDialog.descriptionPlaceholder")}
              rows={2}
              className={cn(fieldClass, "resize-y min-h-[60px]")}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{t("teamDialog.avatarLabel")}</label>
            <FileInput size={80} rounded onFileChange={setFile} />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>{t("teamDialog.visibilityLabel")}</label>
            <div className="grid grid-cols-2 gap-2">
              {(["private", "public"] as const).map((v) => {
                const selected = visibility === v
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibility(v)}
                    className={cn(
                      "text-left px-3 py-2 rounded-lg border transition-colors",
                      selected
                        ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/60"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600",
                    )}
                  >
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {v === "private"
                        ? t("teamDialog.visibilityPrivate")
                        : t("teamDialog.visibilityPublic")}
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {v === "private"
                        ? t("teamDialog.visibilityPrivateHint")
                        : t("teamDialog.visibilityPublicHint")}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{t("teamDialog.inviteLabel")}</label>
            <div
              className={cn(
                fieldClass,
                "flex flex-wrap items-center gap-1.5 min-h-[40px] py-1.5",
                emailError && fieldErrorClass,
              )}
            >
              {emails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px] text-zinc-800 dark:text-zinc-200"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => removeEmail(email)}
                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    aria-label="remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value)
                  if (emailError) setEmailError(null)
                }}
                onKeyDown={handleEmailKeyDown}
                onBlur={commitEmail}
                placeholder={emails.length === 0 ? t("teamDialog.invitePlaceholder") : ""}
                className="flex-1 min-w-[140px] bg-transparent outline-none text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
            </div>
            {emailError ? (
              <p className="text-[11px] text-red-600 dark:text-red-400">{emailError}</p>
            ) : (
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500">
                {t("teamDialog.inviteHint")}
              </p>
            )}
          </div>

          {submitError && (
            <p className="text-[11px] text-red-600 dark:text-red-400">{submitError}</p>
          )}

          <DialogFooter className="pt-2">
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
              {submitting ? t("teamDialog.creating") : t("teamDialog.submit")}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
