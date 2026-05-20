"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/context"
import { useI18n } from "@/lib/i18n/context"
import TaskLogo from "@/components/kokonutui/task-logo"

const fieldClass = cn(
  "w-full px-3 py-2.5 rounded-lg",
  "bg-white dark:bg-[#0F0F12]",
  "border border-zinc-200 dark:border-zinc-700",
  "text-sm text-zinc-900 dark:text-zinc-100",
  "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400",
)

const fieldErrorClass = "border-red-400 dark:border-red-500/70 focus:ring-red-400 dark:focus:ring-red-500"

const labelClass = "text-xs font-medium text-zinc-700 dark:text-zinc-300"

export default function RegisterPage() {
  const { signUp, configured } = useAuth()
  const { t } = useI18n()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function validate(): string | null {
    if (!name.trim()) return t("auth.register.errors.fullNameRequired")
    if (!email.trim()) return t("auth.register.errors.emailRequired")
    if (password.length < 6) return t("auth.register.errors.passwordMinLength")
    if (password !== confirm) return t("auth.register.errors.confirmMismatch")
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const v = validate()
    if (v) {
      setFormError(v)
      return
    }
    if (!configured) {
      setFormError(t("auth.register.errors.firebaseNotConfigured"))
      return
    }
    setSubmitting(true)
    try {
      await signUp({ name: name.trim(), email: email.trim(), password })
      // Layout sẽ tự redirect → /verify-email (vì email mới đăng ký chưa xác thực)
    } catch (e) {
      setFormError((e as Error).message)
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-[#1F1F23] rounded-xl shadow-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <TaskLogo className="h-10 w-10" />
          <h1 className="mt-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {t("auth.register.title")}
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            {t("auth.register.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className={labelClass}>
              {t("auth.register.fullNameLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("auth.register.fullNamePlaceholder")}
              className={fieldClass}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>
              {t("auth.register.emailLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.register.emailPlaceholder")}
              className={fieldClass}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>
              {t("auth.register.passwordLabel")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.register.passwordPlaceholder")}
                className={cn(fieldClass, "pr-10")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={
                  showPassword ? t("auth.login.hidePassword") : t("auth.login.showPassword")
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>
              {t("auth.register.confirmLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={t("auth.register.confirmPlaceholder")}
              className={cn(fieldClass, confirm && password !== confirm && fieldErrorClass)}
            />
          </div>

          {formError && (
            <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-[11px] text-red-700 dark:text-red-300">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "w-full flex items-center justify-center gap-2",
              "py-2.5 px-3 rounded-lg",
              "text-sm font-medium",
              "bg-zinc-900 dark:bg-zinc-50",
              "text-zinc-50 dark:text-zinc-900",
              "hover:bg-zinc-800 dark:hover:bg-zinc-200",
              "shadow-sm hover:shadow transition-all duration-200",
              "disabled:opacity-60 disabled:cursor-not-allowed",
            )}
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{submitting ? t("auth.register.submitting") : t("auth.register.submit")}</span>
          </button>
        </form>

        <p className="mt-3 text-center text-[11px] text-zinc-500 dark:text-zinc-500">
          {t("auth.register.disclaimer")}
        </p>

        <div className="mt-5 text-center text-xs text-zinc-600 dark:text-zinc-400">
          {t("auth.register.haveAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
          >
            {t("auth.register.login")}
          </Link>
        </div>
      </div>
    </div>
  )
}
