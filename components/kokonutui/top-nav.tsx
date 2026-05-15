"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Bell,
  ChevronRight,
  FolderKanban,
  LogIn,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import Profile01 from "./profile-01"
import Link from "next/link"
import { ThemeToggle } from "../theme-toggle"
import { cn } from "@/lib/utils"
import type { BreadcrumbItem } from "@/lib/breadcrumbs"
import UserAvatar from "./user-avatar"
import { useAuth } from "@/lib/auth/context"
import { useMe } from "@/lib/users/store"

interface TopNavProps {
  onToggleSidebar?: () => void
  isSidebarCollapsed?: boolean
  breadcrumbs?: BreadcrumbItem[]
}

const DEFAULT_BREADCRUMBS: BreadcrumbItem[] = [
  { label: "Dashboard", icon: FolderKanban },
]

export default function TopNav({
  onToggleSidebar,
  isSidebarCollapsed = false,
  breadcrumbs = DEFAULT_BREADCRUMBS,
}: TopNavProps) {
  const { user, verified } = useAuth()
  const { data: me } = useMe()
  const isLoggedIn = !!user && verified
  const displayName =
    me?.displayName || user?.displayName || user?.email?.split("@")[0] || "Người dùng"
  const displayEmail = me?.email ?? user?.email ?? ""
  const avatarSrc = me?.avatarUrl ?? user?.photoURL ?? undefined

  return (
    <nav className="px-3 sm:px-6 flex items-center justify-between bg-white dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#1F1F23] h-full">
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarCollapsed ? "Mở sidebar" : "Đóng sidebar"}
            className={cn(
              "hidden lg:inline-flex items-center justify-center",
              "p-1.5 rounded-md transition-colors",
              "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100",
              "hover:bg-gray-100 dark:hover:bg-[#1F1F23]",
            )}
          >
            <span className="relative inline-flex items-center justify-center w-4 h-4">
              <PanelLeftClose
                className={cn(
                  "absolute h-4 w-4 transition-all duration-300 ease-in-out",
                  isSidebarCollapsed ? "opacity-0 rotate-180 scale-75" : "opacity-100 rotate-0 scale-100",
                )}
              />
              <PanelLeftOpen
                className={cn(
                  "absolute h-4 w-4 transition-all duration-300 ease-in-out",
                  isSidebarCollapsed ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-180 scale-75",
                )}
              />
            </span>
          </button>
        )}

        <nav aria-label="Breadcrumb" className="hidden sm:block">
          <ol className="flex items-center gap-0.5 text-sm">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1
              const Icon = item.icon
              return (
                <li key={item.label} className="flex items-center gap-0.5">
                  {index > 0 && (
                    <ChevronRight
                      className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600 shrink-0 mx-0.5"
                      aria-hidden
                    />
                  )}
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md",
                        "text-xs font-medium",
                        "text-zinc-500 dark:text-zinc-400",
                        "hover:text-zinc-900 dark:hover:text-zinc-100",
                        "hover:bg-zinc-100 dark:hover:bg-[#1F1F23]",
                        "transition-colors",
                      )}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <span
                      aria-current="page"
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md",
                        "bg-zinc-100 dark:bg-[#1F1F23]",
                        "ring-1 ring-inset ring-zinc-200 dark:ring-[#2B2B30]",
                        "text-xs font-semibold text-zinc-900 dark:text-zinc-100",
                      )}
                    >
                      {Icon && (
                        <Icon className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" aria-hidden />
                      )}
                      <span>{item.label}</span>
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
        {isLoggedIn && (
          <button
            type="button"
            className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-full transition-colors"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
          </button>
        )}

        <ThemeToggle />

        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Mở menu người dùng"
              className={cn(
                "focus:outline-none rounded-full",
                "ring-2 ring-gray-200 dark:ring-[#2B2B30]",
                "hover:ring-zinc-300 dark:hover:ring-zinc-600",
                "transition-colors cursor-pointer",
              )}
            >
              <UserAvatar
                name={displayName}
                src={avatarSrc}
                size={32}
                className="text-xs"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg p-0"
            >
              <Profile01
                name={displayName}
                email={displayEmail}
                avatar={avatarSrc}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/login"
            className={cn(
              "inline-flex items-center justify-center gap-1.5",
              "py-1.5 px-3 rounded-lg",
              "text-xs font-medium",
              "bg-zinc-900 dark:bg-zinc-50",
              "text-zinc-50 dark:text-zinc-900",
              "hover:bg-zinc-800 dark:hover:bg-zinc-200",
              "shadow-sm hover:shadow transition-all duration-200",
            )}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng nhập</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
