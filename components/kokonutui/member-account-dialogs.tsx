"use client"

import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"
import { Check, CheckCircle2, Copy, ImageIcon, Loader2, Search, TriangleAlert } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useI18n } from "@/lib/i18n/context"
import { useProjects } from "@/lib/projects/store"
import { useCreateUser, useSetUserProjects, useUserProjects } from "@/lib/users/store"
import type { ApiUser, SetupLinkResult, SystemRole } from "@/lib/api/users"

const fieldClass = cn(
  "w-full px-3 py-2 rounded-lg",
  "bg-white dark:bg-[#0F0F12]",
  "border border-zinc-200 dark:border-zinc-700",
  "text-sm text-zinc-900 dark:text-zinc-100",
  "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400",
)
const labelClass = "text-xs font-medium text-zinc-700 dark:text-zinc-300"
const contentClass = cn(
  "bg-white dark:bg-[#0F0F12]",
  "border border-gray-200 dark:border-[#1F1F23]",
  "text-zinc-900 dark:text-zinc-100",
)
const primaryBtn = cn(
  "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium",
  "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900",
  "hover:bg-zinc-800 dark:hover:bg-zinc-200",
  "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
)
const secondaryBtn = cn(
  "px-4 py-2 rounded-lg text-sm font-medium",
  "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
  "hover:bg-zinc-200 dark:hover:bg-zinc-700",
  "transition-colors disabled:opacity-50",
)

// ----------------------------------------------------------------------------
// Danh sách dự án có checkbox (dùng chung cho tạo tài khoản + sửa dự án của user)
// ----------------------------------------------------------------------------

function ProjectPicker({
  selected,
  onChange,
}: {
  selected: Set<string>
  onChange: (next: Set<string>) => void
}) {
  const { t } = useI18n()
  const { data: projects = [], isLoading } = useProjects()
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? projects.filter((p) => p.name.toLowerCase().includes(q)) : projects
  }, [projects, search])

  function toggle(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("access.searchProjects")}
          className={cn(fieldClass, "pl-9")}
        />
      </div>
      <div className="max-h-52 overflow-y-auto rounded-lg border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
        {isLoading ? (
          <div className="px-3 py-4 flex justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {t("access.noProjectsAvailable")}
          </div>
        ) : (
          filtered.map((p) => {
            const checked = selected.has(p.id)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors",
                  checked
                    ? "bg-zinc-50 dark:bg-zinc-800/60"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 shrink-0 rounded border flex items-center justify-center",
                    checked
                      ? "bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50"
                      : "border-zinc-300 dark:border-zinc-600",
                  )}
                >
                  {checked && <Check className="w-3 h-3 text-zinc-50 dark:text-zinc-900" />}
                </span>
                <span className="w-7 h-7 shrink-0 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  {p.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumbnailUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </span>
                <span className="flex-1 min-w-0 truncate text-sm text-zinc-900 dark:text-zinc-100">
                  {p.name}
                </span>
              </button>
            )
          })
        )}
      </div>
      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
        {t("access.selectedCount", { count: selected.size })}
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Hiển thị link đặt mật khẩu (sau khi tạo tài khoản / gửi lại link)
// ----------------------------------------------------------------------------

export function SetupLinkView({ email, result }: { email: string; result: SetupLinkResult }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.setPasswordUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Trình duyệt chặn clipboard → người dùng tự bôi đen ô bên dưới
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs",
          result.emailSent
            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
            : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
        )}
      >
        {result.emailSent ? (
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-px" />
        ) : (
          <TriangleAlert className="w-4 h-4 shrink-0 mt-px" />
        )}
        <span>
          {result.emailSent
            ? t("access.createdEmailSent", { email })
            : t("access.createdEmailFailed", { email })}
        </span>
      </div>
      <div className="space-y-1">
        <label className={labelClass}>{t("access.setPasswordLink")}</label>
        <div className="flex gap-2">
          <input
            readOnly
            value={result.setPasswordUrl}
            onFocus={(e) => e.currentTarget.select()}
            className={cn(fieldClass, "text-xs font-mono")}
          />
          <button type="button" onClick={handleCopy} className={cn(secondaryBtn, "shrink-0 inline-flex items-center gap-1.5")}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t("access.copied") : t("access.copy")}
          </button>
        </div>
      </div>
    </div>
  )
}

export function SetupLinkDialog({
  open,
  email,
  result,
  onClose,
}: {
  open: boolean
  email: string
  result: SetupLinkResult | null
  onClose: () => void
}) {
  const { t } = useI18n()
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={cn("max-w-lg", contentClass)}>
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100">
            {t("access.resendTitle")}
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">{email}</DialogDescription>
        </DialogHeader>
        {result && <SetupLinkView email={email} result={result} />}
        <DialogFooter>
          <button type="button" onClick={onClose} className={primaryBtn}>
            {t("access.done")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ----------------------------------------------------------------------------
// Tạo tài khoản
// ----------------------------------------------------------------------------

export function CreateAccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n()
  const createUser = useCreateUser()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<SystemRole>("user")
  const [projectIds, setProjectIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SetupLinkResult | null>(null)

  useEffect(() => {
    if (open) {
      setEmail("")
      setName("")
      setRole("user")
      setProjectIds(new Set())
      setError(null)
      setResult(null)
    }
  }, [open])

  const submitting = createUser.isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError(null)
    try {
      const res = await createUser.mutateAsync({
        email: email.trim(),
        displayName: name.trim() || null,
        role,
        projectIds: role === "user" ? [...projectIds] : [],
      })
      setResult({ setPasswordUrl: res.setPasswordUrl, emailSent: res.emailSent })
    } catch (err) {
      setError(err instanceof Error ? err.message : t("access.createError"))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !submitting && onClose()}>
      <DialogContent className={cn("max-w-lg", contentClass)}>
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100">
            {result ? t("access.createdTitle") : t("access.createTitle")}
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            {result ? email.trim() : t("access.createDesc")}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <>
            <SetupLinkView email={email.trim()} result={result} />
            <DialogFooter>
              <button type="button" onClick={onClose} className={primaryBtn}>
                {t("access.done")}
              </button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>{t("access.emailLabel")} *</label>
                <input
                  autoFocus
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("access.emailPlaceholder")}
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{t("access.nameLabel")}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("access.namePlaceholder")}
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>{t("access.roleLabel")}</label>
              <div className="grid grid-cols-2 gap-2">
                {(["user", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      "text-left px-3 py-2 rounded-lg border transition-colors",
                      role === r
                        ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/60"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600",
                    )}
                  >
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {r === "admin" ? t("access.roleAdmin") : t("access.roleCustomer")}
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {r === "admin" ? t("access.roleAdminHint") : t("access.roleCustomerHint")}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {role === "user" && (
              <div className="space-y-1.5">
                <label className={labelClass}>{t("access.projectsLabel")}</label>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{t("access.projectsHint")}</p>
                <ProjectPicker selected={projectIds} onChange={setProjectIds} />
              </div>
            )}

            {error && <p className="text-[11px] text-red-600 dark:text-red-400">{error}</p>}

            <DialogFooter className="pt-1">
              <button type="button" onClick={onClose} disabled={submitting} className={secondaryBtn}>
                {t("common.cancel")}
              </button>
              <button type="submit" disabled={submitting || !email.trim()} className={primaryBtn}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? t("access.creating") : t("access.createSubmit")}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ----------------------------------------------------------------------------
// Dự án của user
// ----------------------------------------------------------------------------

export function MemberProjectsDialog({
  open,
  user,
  onClose,
}: {
  open: boolean
  user: ApiUser | null
  onClose: () => void
}) {
  const { t } = useI18n()
  const userProjects = useUserProjects(user?.id, open)
  const setProjects = useSetUserProjects()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  // Khởi tạo lựa chọn từ dữ liệu server mỗi lần mở dialog
  useEffect(() => {
    if (open && userProjects.data) {
      setSelected(new Set(userProjects.data.map((p) => p.projectId)))
    }
  }, [open, userProjects.data])
  useEffect(() => {
    if (open) setError(null)
  }, [open])

  const saving = setProjects.isPending

  async function handleSave() {
    if (!user || saving) return
    setError(null)
    try {
      await setProjects.mutateAsync({ id: user.id, projectIds: [...selected] })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("access.saveError"))
    }
  }

  const name = user?.displayName || user?.email || ""

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className={cn("max-w-lg", contentClass)}>
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100">
            {t("access.userProjectsTitle", { name })}
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            {user?.role === "admin" ? t("access.roleAdminHint") : t("access.userProjectsDesc")}
          </DialogDescription>
        </DialogHeader>

        {userProjects.isLoading ? (
          <div className="py-6 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
          </div>
        ) : (
          <ProjectPicker selected={selected} onChange={setSelected} />
        )}

        {error && <p className="text-[11px] text-red-600 dark:text-red-400">{error}</p>}

        <DialogFooter>
          <button type="button" onClick={onClose} disabled={saving} className={secondaryBtn}>
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || userProjects.isLoading}
            className={primaryBtn}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? t("common.saving") : t("access.saveProjects")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
