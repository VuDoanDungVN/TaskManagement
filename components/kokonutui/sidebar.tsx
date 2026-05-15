"use client"

import {
  BarChart2,
  Receipt,
  Building2,
  CreditCard,
  Folder,
  Wallet,
  Users2,
  Shield,
  MessagesSquare,
  Video,
  Settings,
  HelpCircle,
  Menu,
  FolderKanban,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import TaskLogo from "./task-logo"

interface SidebarProps {
  isCollapsed?: boolean
}

export default function Sidebar({ isCollapsed = false }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  function handleNavigation() {
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let timer: ReturnType<typeof setTimeout> | null = null
    const show = () => {
      el.classList.add("is-scrolling")
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => el.classList.remove("is-scrolling"), 3000)
    }
    el.addEventListener("scroll", show, { passive: true })
    el.addEventListener("mouseenter", show)
    return () => {
      el.removeEventListener("scroll", show)
      el.removeEventListener("mouseenter", show)
      if (timer) clearTimeout(timer)
    }
  }, [])

  function NavItem({
    href,
    icon: Icon,
    children,
  }: {
    href: string
    icon: any
    children: React.ReactNode
  }) {
    return (
      <Link
        href={href}
        onClick={handleNavigation}
        title={isCollapsed ? String(children) : undefined}
        className={cn(
          "flex items-center py-2 text-sm rounded-md transition-colors",
          "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]",
          isCollapsed ? "lg:justify-center lg:px-2 px-3" : "px-3",
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 flex-shrink-0 transition-[margin] duration-300 ease-in-out",
            isCollapsed ? "lg:mr-0 mr-3" : "mr-3",
          )}
        />
        <span
          className={cn(
            "whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-300 ease-in-out",
            isCollapsed
              ? "lg:opacity-0 lg:max-w-0 opacity-100 max-w-[200px]"
              : "opacity-100 max-w-[200px]",
          )}
        >
          {children}
        </span>
      </Link>
    )
  }

  function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
      <div
        className={cn(
          "px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400",
          "overflow-hidden transition-[opacity,max-height,margin] duration-300 ease-in-out",
          isCollapsed
            ? "lg:opacity-0 lg:max-h-0 lg:mb-0 opacity-100 max-h-8 mb-2"
            : "opacity-100 max-h-8 mb-2",
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white dark:bg-[#0F0F12] shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
      <nav
        className={cn(
          "fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-[#0F0F12]",
          "transform transition-[transform,width] duration-300 ease-in-out",
          "lg:translate-x-0 lg:static border-r border-gray-200 dark:border-[#1F1F23]",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-full flex flex-col overflow-hidden">
          <Link
            href="/dashboard"
            className={cn(
              "h-16 flex items-center border-b border-gray-200 dark:border-[#1F1F23] transition-[padding] duration-300 ease-in-out",
              isCollapsed ? "lg:px-3 px-6" : "px-6",
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <TaskLogo className="h-8 w-8 flex-shrink-0" />
              <span
                className={cn(
                  "text-lg font-semibold hover:cursor-pointer text-gray-900 dark:text-white",
                  "whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-300 ease-in-out",
                  isCollapsed
                    ? "lg:opacity-0 lg:max-w-0 opacity-100 max-w-[200px]"
                    : "opacity-100 max-w-[200px]",
                )}
              >
                Task Management
              </span>
            </div>
          </Link>

          <div
            ref={scrollRef}
            className={cn(
              "flex-1 overflow-y-auto overflow-x-hidden py-4 transition-[padding] duration-300 ease-in-out sidebar-scrollbar",
              isCollapsed ? "lg:px-2 px-4" : "px-4",
            )}
          >
            <div className="space-y-6">
              <div>
                <SectionTitle>Overview</SectionTitle>
                <div className="space-y-1">
                  <NavItem href="/dashboard" icon={FolderKanban}>
                    Dashboard
                  </NavItem>
                  <NavItem href="#" icon={BarChart2}>
                    Analytics
                  </NavItem>
                  <NavItem href="#" icon={Building2}>
                    Organization
                  </NavItem>
                  <NavItem href="#" icon={Folder}>
                    Projects
                  </NavItem>
                </div>
              </div>

              <div>
                <SectionTitle>Finance</SectionTitle>
                <div className="space-y-1">
                  <NavItem href="#" icon={Wallet}>
                    Transactions
                  </NavItem>
                  <NavItem href="#" icon={Receipt}>
                    Invoices
                  </NavItem>
                  <NavItem href="#" icon={CreditCard}>
                    Payments
                  </NavItem>
                </div>
              </div>

              <div>
                <SectionTitle>Team</SectionTitle>
                <div className="space-y-1">
                  <NavItem href="#" icon={Users2}>
                    Members
                  </NavItem>
                  <NavItem href="#" icon={Shield}>
                    Permissions
                  </NavItem>
                  <NavItem href="#" icon={MessagesSquare}>
                    Chat
                  </NavItem>
                  <NavItem href="#" icon={Video}>
                    Meetings
                  </NavItem>
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "py-4 border-t border-gray-200 dark:border-[#1F1F23] transition-[padding] duration-300 ease-in-out",
              isCollapsed ? "lg:px-2 px-4" : "px-4",
            )}
          >
            <div className="space-y-1">
              <NavItem href="#" icon={Settings}>
                Settings
              </NavItem>
              <NavItem href="#" icon={HelpCircle}>
                Help
              </NavItem>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
