"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth/context"

function isSafeInternalPath(p: string | null) {
  return !!p && p.startsWith("/") && !p.startsWith("//")
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { theme } = useTheme()
  const { user, verified, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (loading) return
    if (!user) return
    if (verified) {
      const returnTo = searchParams.get("returnTo")
      router.replace(isSafeInternalPath(returnTo) ? returnTo! : "/dashboard")
    } else if (pathname !== "/verify-email") {
      router.replace("/verify-email")
    }
  }, [loading, user, verified, pathname, searchParams, router])

  if (!mounted) return null

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0F0F12] px-4 py-10">
        {children}
      </div>
    </div>
  )
}
