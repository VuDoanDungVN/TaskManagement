"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, LogOut, MailCheck, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/context"
import TaskLogo from "@/components/kokonutui/task-logo"

const RESEND_COOLDOWN = 30

export default function VerifyEmailPage() {
  const { user, sendVerification, reloadUser, signOut } = useAuth()
  const router = useRouter()

  const [checking, setChecking] = useState(false)
  const [sending, setSending] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [info, setInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function handleCheck() {
    setChecking(true)
    setError(null)
    setInfo(null)
    try {
      const verified = await reloadUser()
      if (verified) {
        setInfo("Xác thực thành công! Đang chuyển hướng…")
        router.replace("/dashboard")
        // Giữ checking=true cho đến khi unmount để spinner hiển thị liên tục
      } else {
        setError(
          "Email vẫn chưa được xác thực. Vui lòng đảm bảo đã nhấn link trong email rồi thử lại. " +
            "Nếu link đã được mở từ thiết bị khác, hãy đăng xuất và đăng nhập lại để cập nhật.",
        )
        setChecking(false)
      }
    } catch (e) {
      setError((e as Error).message)
      setChecking(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0 || sending) return
    setSending(true)
    setError(null)
    setInfo(null)
    try {
      await sendVerification()
      setInfo("Đã gửi lại email xác thực. Hãy kiểm tra hộp thư (kể cả Spam).")
      setCooldown(RESEND_COOLDOWN)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSending(false)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      router.replace("/login")
    } catch {
      setSigningOut(false)
    }
  }

  if (!user) return null

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-[#1F1F23] rounded-xl shadow-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative">
            <TaskLogo className="h-10 w-10" />
            <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#0F0F12]">
              <MailCheck className="w-3 h-3 text-white" />
            </span>
          </div>
          <h1 className="mt-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Xác thực email
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Chúng tôi đã gửi link xác thực đến
          </p>
          <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-all">
            {user.email}
          </p>
        </div>

        <div className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-lg px-3 py-2 mb-4">
          Mở email, nhấn vào link xác thực rồi quay lại đây và bấm{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">Tôi đã xác thực</span>.
          Đừng quên kiểm tra cả thư mục Spam.
        </div>

        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-[11px] text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[11px] text-emerald-700 dark:text-emerald-300">
            {info}
          </div>
        )}

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
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
            {checking && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{checking ? "Đang kiểm tra…" : "Tôi đã xác thực"}</span>
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || sending}
            className={cn(
              "w-full flex items-center justify-center gap-2",
              "py-2.5 px-3 rounded-lg",
              "text-sm font-medium",
              "bg-zinc-100 dark:bg-zinc-800",
              "text-zinc-900 dark:text-zinc-100",
              "hover:bg-zinc-200 dark:hover:bg-zinc-700",
              "transition-colors duration-200",
              "disabled:opacity-60 disabled:cursor-not-allowed",
            )}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>
              {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi lại email xác thực"}
            </span>
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-[#1F1F23] text-center">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium",
              "text-zinc-600 dark:text-zinc-400",
              "hover:text-zinc-900 dark:hover:text-zinc-100",
              "transition-colors",
              "disabled:opacity-60",
            )}
          >
            {signingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span>Đăng xuất và dùng tài khoản khác</span>
          </button>
        </div>
      </div>
    </div>
  )
}
