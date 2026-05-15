"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth/context"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { configured } = useAuth()

  if (!configured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0F0F12] px-4">
        <div className="max-w-md w-full bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-[#1F1F23] rounded-xl p-6 text-center">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Firebase chưa được cấu hình
          </h2>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
            Tạo file <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">.env.local</code>{" "}
            theo <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">.env.local.example</code>{" "}
            rồi khởi động lại dev server để bật xác thực.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
