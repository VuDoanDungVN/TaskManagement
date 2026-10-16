"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, ShieldAlert } from "lucide-react"
import { ApiError } from "@/lib/api/client"
import { useAuth } from "@/lib/auth/context"
import { useI18n } from "@/lib/i18n/context"
import { useMe, useRole } from "@/lib/users/store"
import { cn } from "@/lib/utils"

/**
 * Đặt trong Layout: nếu Worker trả 403 cho /users/me (tài khoản chưa được admin tạo
 * hoặc đã bị khoá) → đăng xuất và đưa về trang login kèm thông báo.
 */
export function AccessGate() {
  const { error } = useMe()
  const { signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (error instanceof ApiError && error.status === 403) {
      signOut()
        .catch(() => {})
        .finally(() => router.replace("/login?denied=1"))
    }
  }, [error, signOut, router])

  return null
}

/** Chỉ render children cho admin hệ thống; customer thấy thông báo không có quyền. */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useRole()
  const { t } = useI18n()

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
      </div>
    )
  }
  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-8 flex flex-col items-center text-center gap-3">
        <ShieldAlert className="w-10 h-10 text-amber-500" />
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {t("access.noPermissionTitle")}
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md">
          {t("access.noPermissionDesc")}
        </p>
        <Link
          href="/dashboard"
          className={cn(
            "mt-2 inline-flex items-center px-4 py-2 rounded-lg text-xs font-medium",
            "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900",
            "hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors",
          )}
        >
          {t("access.backToDashboard")}
        </Link>
      </div>
    )
  }
  return <>{children}</>
}
