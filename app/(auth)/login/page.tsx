"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/context"
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

export default function LoginPage() {
  const { signIn, resetPassword, configured } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setInfo(null)
    if (!configured) {
      setFormError("Firebase chưa được cấu hình. Hãy tạo .env.local theo .env.local.example.")
      return
    }
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      // Layout sẽ tự redirect (về returnTo hoặc /dashboard, hoặc /verify-email nếu chưa xác thực)
    } catch (e) {
      setFormError((e as Error).message)
      setSubmitting(false)
    }
  }

  async function handleForgotPassword() {
    setFormError(null)
    setInfo(null)
    if (!email.trim()) {
      setFormError("Nhập email phía trên rồi bấm 'Quên mật khẩu' để nhận link đặt lại.")
      return
    }
    if (!configured) {
      setFormError("Firebase chưa được cấu hình.")
      return
    }
    try {
      await resetPassword(email.trim())
      setInfo("Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.")
    } catch (e) {
      setFormError((e as Error).message)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-[#1F1F23] rounded-xl shadow-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <TaskLogo className="h-10 w-10" />
          <h1 className="mt-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">Đăng nhập</h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Chào mừng bạn quay lại Task Management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className={labelClass}>Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@taskmanagement.app"
              className={cn(fieldClass, formError && fieldErrorClass)}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Mật khẩu</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(fieldClass, "pr-10", formError && fieldErrorClass)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {formError && (
            <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-[11px] text-red-700 dark:text-red-300">
              {formError}
            </div>
          )}
          {info && (
            <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[11px] text-emerald-700 dark:text-emerald-300">
              {info}
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
            <span>{submitting ? "Đang đăng nhập…" : "Đăng nhập"}</span>
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-zinc-600 dark:text-zinc-400">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  )
}
