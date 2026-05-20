"use client"

import {
  Bell,
  Camera,
  ChevronRight,
  FileText,
  HelpCircle,
  Loader2,
  LogOut,
  MoveUpRight,
  Settings,
  User2,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/context"
import { ME_QUERY_KEY } from "@/lib/users/store"
import { uploadsApi } from "@/lib/api/uploads"
import { useI18n } from "@/lib/i18n/context"
import type { TranslationKey } from "@/lib/i18n/types"
import UserAvatar from "./user-avatar"

type ProfileStatus = "online" | "away" | "offline"

interface Profile01Props {
  name?: string
  email?: string
  avatar?: string
  status?: ProfileStatus
}

const STATUS_DOTS: Record<ProfileStatus, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-zinc-400 dark:bg-zinc-500",
}

const STATUS_LABEL_KEYS: Record<ProfileStatus, TranslationKey> = {
  online: "profile.statusActive",
  away: "profile.statusAway",
  offline: "profile.statusOffline",
}

interface MenuItemData {
  labelKey: TranslationKey
  href: string
  icon: LucideIcon
  badge?: number | string
  external?: boolean
}

const ACCOUNT_ITEMS: MenuItemData[] = [
  { labelKey: "profile.profile", href: "#", icon: User2 },
  { labelKey: "profile.settings", href: "/dashboard/settings", icon: Settings },
  { labelKey: "profile.notifications", href: "#", icon: Bell, badge: 3 },
]

const SUPPORT_ITEMS: MenuItemData[] = [
  { labelKey: "profile.help", href: "#", icon: HelpCircle },
  { labelKey: "profile.terms", href: "#", icon: FileText, external: true },
]

export default function Profile01({
  name,
  email,
  avatar,
  status = "online",
}: Profile01Props = {}) {
  const { t } = useI18n()
  const displayName = name ?? t("comments.userFallback")
  const displayEmail = email ?? ""
  const statusDot = STATUS_DOTS[status]
  const statusLabel = t(STATUS_LABEL_KEYS[status])
  const { signOut } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [signingOut, setSigningOut] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploadingAvatar(true)
    try {
      await uploadsApi.avatar(file)
      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY })
    } catch (err) {
      setUploadError((err as Error).message || t("profile.uploadFailed"))
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleLogout() {
    if (signingOut) return
    setSigningOut(true)
    try {
      await signOut()
      router.replace("/login")
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#0F0F12]">
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-br from-zinc-100 via-zinc-50 to-white dark:from-zinc-800/60 dark:via-zinc-900/60 dark:to-[#0F0F12]" />

        <div className="relative px-5 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0 group/avatar">
              <UserAvatar
                name={displayName}
                src={avatar}
                size={56}
                className="ring-2 ring-white dark:ring-[#1F1F23]"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                aria-label={t("profile.changeAvatar")}
                className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "rounded-full bg-black/40 backdrop-blur-[1px]",
                  "opacity-0 group-hover/avatar:opacity-100",
                  "transition-opacity duration-200",
                  "cursor-pointer disabled:cursor-wait",
                )}
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </button>
              <span
                className={cn(
                  "absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white dark:ring-[#0F0F12]",
                  statusDot,
                )}
                aria-hidden
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {displayName}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {displayEmail}
              </p>
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/60">
                <span className={cn("w-1.5 h-1.5 rounded-full", statusDot)} />
                <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-zinc-200 dark:bg-[#1F1F23]" />

        <Section title={t("profile.sectionAccount")} items={ACCOUNT_ITEMS} t={t} />

        <div className="h-px bg-zinc-200 dark:bg-[#1F1F23]" />

        <Section title={t("profile.sectionSupport")} items={SUPPORT_ITEMS} t={t} />

        <div className="h-px bg-zinc-200 dark:bg-[#1F1F23]" />

        <div className="p-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className={cn(
              "w-full group flex items-center justify-between",
              "px-2 py-2 rounded-md",
              "text-red-600 dark:text-red-400",
              "hover:bg-red-50 dark:hover:bg-red-950/40",
              "transition-colors",
              "disabled:opacity-60 disabled:cursor-not-allowed",
            )}
          >
            <div className="flex items-center gap-2.5">
              {signingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {signingOut ? t("profile.signingOut") : t("profile.signOut")}
              </span>
            </div>
            <ChevronRight
              className={cn(
                "w-3.5 h-3.5 opacity-0 -translate-x-1",
                "group-hover:opacity-100 group-hover:translate-x-0",
                "transition-all duration-200",
              )}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  items,
  t,
}: {
  title: string
  items: MenuItemData[]
  t: (k: TranslationKey) => string
}) {
  return (
    <div className="p-3">
      <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map((item) => (
          <MenuRow key={item.labelKey} {...item} label={t(item.labelKey)} />
        ))}
      </div>
    </div>
  )
}

function MenuRow({
  label,
  href,
  icon: Icon,
  badge,
  external,
}: MenuItemData & { label: string }) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "group flex items-center justify-between",
        "px-2 py-2 rounded-md",
        "text-zinc-700 dark:text-zinc-300",
        "hover:bg-zinc-100 dark:hover:bg-[#1F1F23]",
        "transition-colors",
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon
          className={cn(
            "w-4 h-4 shrink-0",
            "text-zinc-500 dark:text-zinc-400",
            "group-hover:text-zinc-900 dark:group-hover:text-zinc-100",
            "transition-colors",
          )}
        />
        <span className="text-sm font-medium truncate">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {badge !== undefined && (
          <span
            className={cn(
              "min-w-[20px] h-[18px] px-1.5 inline-flex items-center justify-center",
              "rounded-full bg-zinc-900 dark:bg-zinc-50",
              "text-zinc-50 dark:text-zinc-900",
              "text-[10px] font-semibold tabular-nums",
            )}
          >
            {badge}
          </span>
        )}
        {external ? (
          <MoveUpRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
        ) : (
          <ChevronRight
            className={cn(
              "w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500",
              "group-hover:translate-x-0.5 transition-transform",
            )}
          />
        )}
      </div>
    </Link>
  )
}
