"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth/context"

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  const { user, verified, loading, configured } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!configured || loading) return
    if (!user) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname || "/dashboard/projects")}`)
    } else if (!verified) {
      router.replace("/verify-email")
    }
  }, [loading, user, verified, configured, pathname, router])

  if (loading || !user || !verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0F0F12]">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
      </div>
    )
  }

  return <>{children}</>
}
