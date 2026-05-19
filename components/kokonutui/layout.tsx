"use client"

import type { ReactNode } from "react"
import Sidebar from "./sidebar"
import TopNav from "./top-nav"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import type { BreadcrumbItem } from "@/lib/breadcrumbs"
import { cn } from "@/lib/utils"

interface LayoutProps {
  children: ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

const COLLAPSE_KEY = "task-manager:sidebar-collapsed:v1"

export default function Layout({ children, breadcrumbs }: LayoutProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(COLLAPSE_KEY)
      if (saved === "1") setCollapsed(true)
    } catch {
      // ignore
    }
    setMounted(true)
  }, [])

  function toggleSidebar() {
    setCollapsed((c) => {
      const next = !c
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0")
      } catch {
        // ignore
      }
      return next
    })
  }

  if (!mounted) {
    return null
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark" : ""}`}>
      <Sidebar isCollapsed={collapsed} />
      <div
        className={cn(
          "min-h-screen flex flex-col",
          "transition-[padding] duration-300 ease-in-out",
          // Sidebar luôn position: fixed → cột phải cần padding-left bù theo
          // độ rộng sidebar. Mobile (< lg) sidebar slide-out nên không cần padding.
          collapsed ? "lg:pl-16" : "lg:pl-64",
        )}
      >
        <header className="sticky top-0 z-40 h-16">
          <TopNav
            onToggleSidebar={toggleSidebar}
            isSidebarCollapsed={collapsed}
            breadcrumbs={breadcrumbs}
          />
        </header>
        <main className="flex-1 p-6 bg-white dark:bg-[#0F0F12]">{children}</main>
      </div>
    </div>
  )
}
