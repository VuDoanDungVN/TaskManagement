"use client"

import { cn } from "@/lib/utils"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  FolderKanban,
  Loader2,
  Lock,
  LockOpen,
  Mail,
  MoreHorizontal,
  Search,
  ShieldCheck,
  UserCog,
  UserPlus,
  UsersRound,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n/context"
import {
  useInfiniteUsers,
  useIsAdmin,
  useMe,
  useResendSetupLink,
  useUpdateUser,
} from "@/lib/users/store"
import type { ApiUser, SetupLinkResult } from "@/lib/api/users"
import MemberEditDialog from "./member-edit-dialog"
import UserAvatar from "./user-avatar"
import MemberTeamsDialog from "./member-teams-dialog"
import {
  CreateAccountDialog,
  MemberProjectsDialog,
  SetupLinkDialog,
} from "./member-account-dialogs"

const PAGE_SIZE = 20

const badgeBase = "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap"

/** Unix ms → DD/MM/YYYY */
function formatCreated(ms: number) {
  const d = new Date(ms)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

function UserCell({ user, isMe, youLabel }: { user: ApiUser; isMe: boolean; youLabel: string }) {
  const name = user.displayName || user.email
  return (
    <div className="flex items-center gap-3 min-w-0">
      <UserAvatar name={name} src={user.avatarUrl ?? undefined} size={32} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{name}</span>
          {isMe && (
            <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-[10px] font-medium text-blue-600 dark:text-blue-400">
              {youLabel}
            </span>
          )}
        </div>
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{user.email}</div>
      </div>
    </div>
  )
}

function RoleBadge({ user }: { user: ApiUser }) {
  const { t } = useI18n()
  return user.role === "admin" ? (
    <span className={cn(badgeBase, "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400")}>
      <ShieldCheck className="w-3 h-3" />
      {t("access.roleAdmin")}
    </span>
  ) : (
    <span className={cn(badgeBase, "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400")}>
      {t("access.roleCustomer")}
    </span>
  )
}

function StatusBadge({ user }: { user: ApiUser }) {
  const { t } = useI18n()
  return user.status === "disabled" ? (
    <span className={cn(badgeBase, "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400")}>
      <Lock className="w-3 h-3" />
      {t("access.statusDisabled")}
    </span>
  ) : (
    <span className={cn(badgeBase, "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400")}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      {t("access.statusActive")}
    </span>
  )
}

/** Customer: số dự án được gán; admin: số nhóm nội bộ */
function AccessBadge({ user }: { user: ApiUser }) {
  const { t } = useI18n()
  return (
    <span className={cn(badgeBase, "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300")}>
      {user.role === "admin" ? (
        <>
          <UsersRound className="w-3 h-3" />
          {t("membersList.teamCountLabel", { count: user.teamCount ?? 0 })}
        </>
      ) : (
        <>
          <FolderKanban className="w-3 h-3" />
          {t("access.projectCountLabel", { count: user.projectCount ?? 0 })}
        </>
      )}
    </span>
  )
}

function RowActions({
  user,
  isMe,
  busy,
  onEdit,
  onTeams,
  onProjects,
  onResend,
  onToggleLock,
}: {
  user: ApiUser
  isMe: boolean
  busy: boolean
  onEdit: (u: ApiUser) => void
  onTeams: (u: ApiUser) => void
  onProjects: (u: ApiUser) => void
  onResend: (u: ApiUser) => void
  onToggleLock: (u: ApiUser) => void
}) {
  const { t } = useI18n()
  const locked = user.status === "disabled"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={busy}
          aria-label={t("access.moreActions")}
          title={t("access.moreActions")}
          className={cn(
            "inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
            "text-zinc-500 dark:text-zinc-400",
            "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100",
            "transition-colors disabled:opacity-50",
          )}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => onEdit(user)} className="text-xs gap-2">
          <UserCog className="w-3.5 h-3.5" />
          {t("membersList.actionEdit")}
        </DropdownMenuItem>
        {user.role === "admin" ? (
          <DropdownMenuItem onSelect={() => onTeams(user)} className="text-xs gap-2">
            <UsersRound className="w-3.5 h-3.5" />
            {t("membersList.actionManageTeams")}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => onProjects(user)} className="text-xs gap-2">
            <FolderKanban className="w-3.5 h-3.5" />
            {t("access.actionProjects")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => onResend(user)} className="text-xs gap-2">
          <Mail className="w-3.5 h-3.5" />
          {t("access.actionResendLink")}
        </DropdownMenuItem>
        {!isMe && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onToggleLock(user)}
              className={cn(
                "text-xs gap-2",
                !locked && "text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400",
              )}
            >
              {locked ? <LockOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {locked ? t("access.actionUnlock") : t("access.actionLock")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function MemberList() {
  const { t } = useI18n()
  const isAdmin = useIsAdmin()
  const meQuery = useMe()
  const myId = meQuery.data?.id

  // Tìm kiếm với debounce → tránh gọi API mỗi lần gõ phím
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(id)
  }, [search])

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteUsers(PAGE_SIZE, debounced)

  const users = useMemo<ApiUser[]>(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  )

  // IntersectionObserver: tự fetch trang sau khi sentinel lọt vào khung nhìn
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasNextPage) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: "200px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const [editTarget, setEditTarget] = useState<ApiUser | null>(null)
  const [teamsTarget, setTeamsTarget] = useState<ApiUser | null>(null)
  const [projectsTarget, setProjectsTarget] = useState<ApiUser | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [linkResult, setLinkResult] = useState<{ email: string; result: SetupLinkResult } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const updateUser = useUpdateUser()
  const resendLink = useResendSetupLink()

  async function handleToggleLock(u: ApiUser) {
    const locking = u.status !== "disabled"
    const msg = locking
      ? t("access.lockConfirm", { email: u.email })
      : t("access.unlockConfirm", { email: u.email })
    if (!window.confirm(msg)) return
    setActionError(null)
    try {
      await updateUser.mutateAsync({ id: u.id, patch: { status: locking ? "disabled" : "active" } })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("access.memberError"))
    }
  }

  async function handleResend(u: ApiUser) {
    setActionError(null)
    try {
      const result = await resendLink.mutateAsync(u.id)
      setLinkResult({ email: u.email, result })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("access.resendError"))
    }
  }

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 sm:p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UsersRound className="w-4 h-4 text-zinc-900 dark:text-zinc-50" />
            {t("membersList.title")}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t("membersList.subtitle")}
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
        {/* Ô tìm kiếm */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("membersList.searchPlaceholder")}
            className={cn(
              "w-full pl-9 pr-3 py-2 rounded-lg",
              "bg-white dark:bg-[#0F0F12]",
              "border border-zinc-200 dark:border-zinc-700",
              "text-sm text-zinc-900 dark:text-zinc-100",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
              "focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400",
            )}
          />
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium shrink-0",
              "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900",
              "hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm transition-colors",
            )}
          >
            <UserPlus className="w-3.5 h-3.5" />
            {t("access.createAccount")}
          </button>
        )}
        </div>
      </div>

      {actionError && (
        <p className="mb-3 text-[11px] text-red-600 dark:text-red-400">{actionError}</p>
      )}

      {isLoading ? (
        <div className="p-6 text-xs text-zinc-600 dark:text-zinc-400 text-center flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {t("membersList.loading")}
        </div>
      ) : error ? (
        <div className="p-6 text-xs text-red-600 dark:text-red-400 text-center">
          {t("membersList.error", { message: (error as Error).message })}
        </div>
      ) : users.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {t("membersList.emptyTitle")}
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            {debounced ? t("membersList.emptyHelpSearch") : t("membersList.emptyHelp")}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop/tablet: bảng */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
            <table className="w-full table-fixed text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/70">
                <tr className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  <th className="px-4 py-2.5 w-[38%]">{t("access.colUser")}</th>
                  <th className="px-3 py-2.5 w-[14%]">{t("access.colRole")}</th>
                  <th className="px-3 py-2.5 w-[14%]">{t("access.colStatus")}</th>
                  <th className="px-3 py-2.5 w-[14%]">{t("access.colAccess")}</th>
                  <th className="px-3 py-2.5 w-[12%] hidden lg:table-cell">{t("access.colCreated")}</th>
                  {isAdmin && (
                    <th className="px-3 py-2.5 w-[8%] text-right">
                      <span className="sr-only">{t("access.colActions")}</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {users.map((u) => {
                  const isMe = !!myId && u.id === myId
                  return (
                    <tr
                      key={u.id}
                      className={cn(
                        "hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors",
                        u.status === "disabled" && "opacity-60",
                      )}
                    >
                      <td className="px-4 py-2.5">
                        <UserCell user={u} isMe={isMe} youLabel={t("membersList.you")} />
                      </td>
                      <td className="px-3 py-2.5">
                        <RoleBadge user={u} />
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge user={u} />
                      </td>
                      <td className="px-3 py-2.5">
                        <AccessBadge user={u} />
                      </td>
                      <td className="px-3 py-2.5 hidden lg:table-cell text-xs text-zinc-600 dark:text-zinc-400 tabular-nums">
                        {formatCreated(u.createdAt)}
                      </td>
                      {isAdmin && (
                        <td className="px-3 py-2.5 text-right">
                          <RowActions
                            user={u}
                            isMe={isMe}
                            busy={updateUser.isPending || resendLink.isPending}
                            onEdit={setEditTarget}
                            onTeams={setTeamsTarget}
                            onProjects={setProjectsTarget}
                            onResend={handleResend}
                            onToggleLock={handleToggleLock}
                          />
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: danh sách gọn (bảng nhiều cột sẽ phải cuộn ngang) */}
          <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800 border-y border-zinc-100 dark:border-zinc-800">
            {users.map((u) => {
              const isMe = !!myId && u.id === myId
              return (
                <div
                  key={u.id}
                  className={cn("py-3 flex items-start gap-2", u.status === "disabled" && "opacity-60")}
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <UserCell user={u} isMe={isMe} youLabel={t("membersList.you")} />
                    <div className="flex flex-wrap items-center gap-1.5 pl-11">
                      <RoleBadge user={u} />
                      <StatusBadge user={u} />
                      <AccessBadge user={u} />
                    </div>
                  </div>
                  {isAdmin && (
                    <RowActions
                      user={u}
                      isMe={isMe}
                      busy={updateUser.isPending || resendLink.isPending}
                      onEdit={setEditTarget}
                      onTeams={setTeamsTarget}
                      onProjects={setProjectsTarget}
                      onResend={handleResend}
                      onToggleLock={handleToggleLock}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Sentinel + trạng thái tải thêm */}
          <div ref={sentinelRef} className="h-px" />
          <div className="pt-4 text-center">
            {isFetchingNextPage ? (
              <span className="inline-flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t("membersList.loadingMore")}
              </span>
            ) : hasNextPage ? (
              <button
                type="button"
                onClick={() => fetchNextPage()}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-medium",
                  "bg-zinc-100 dark:bg-zinc-800",
                  "text-zinc-900 dark:text-zinc-100",
                  "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                  "transition-colors",
                )}
              >
                {t("membersList.loadMore")}
              </button>
            ) : (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {t("membersList.endOfList")}
              </span>
            )}
          </div>
        </>
      )}

      {isAdmin && (
        <>
          <MemberEditDialog
            open={!!editTarget}
            user={editTarget}
            isSelf={!!editTarget && editTarget.id === myId}
            onClose={() => setEditTarget(null)}
          />
          <MemberTeamsDialog
            open={!!teamsTarget}
            user={teamsTarget}
            onClose={() => setTeamsTarget(null)}
          />
          <MemberProjectsDialog
            open={!!projectsTarget}
            user={projectsTarget}
            onClose={() => setProjectsTarget(null)}
          />
          <CreateAccountDialog open={createOpen} onClose={() => setCreateOpen(false)} />
          <SetupLinkDialog
            open={!!linkResult}
            email={linkResult?.email ?? ""}
            result={linkResult?.result ?? null}
            onClose={() => setLinkResult(null)}
          />
        </>
      )}
    </div>
  )
}
