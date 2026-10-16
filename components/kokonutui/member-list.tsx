"use client"

import { cn } from "@/lib/utils"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  FolderKanban,
  ImageIcon,
  Loader2,
  Lock,
  LockOpen,
  Mail,
  Search,
  ShieldCheck,
  UserCog,
  UserPlus,
  UsersRound,
} from "lucide-react"
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
import MemberTeamsDialog from "./member-teams-dialog"
import {
  CreateAccountDialog,
  MemberProjectsDialog,
  SetupLinkDialog,
} from "./member-account-dialogs"

const actionBtn = cn(
  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium",
  "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
  "hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors",
  "disabled:opacity-50 disabled:cursor-not-allowed",
)

const PAGE_SIZE = 20

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
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {users.map((u) => {
              const name = u.displayName || u.email
              const isMe = !!myId && u.id === myId
              return (
                <div
                  key={u.id}
                  className={cn(
                    "relative flex flex-col gap-3",
                    "bg-white dark:bg-zinc-900/70",
                    "border border-zinc-100 dark:border-zinc-800",
                    "rounded-xl shadow-sm p-4",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 shrink-0 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatarUrl} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                          {name}
                        </h3>
                        {isMe && (
                          <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                            {t("membersList.you")}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium",
                        u.role === "admin"
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
                      )}
                    >
                      {u.role === "admin" && <ShieldCheck className="w-3 h-3" />}
                      {u.role === "admin"
                        ? t("membersList.roleAdmin")
                        : t("membersList.roleUser")}
                    </span>
                    {u.status === "disabled" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-[10px] font-medium text-red-700 dark:text-red-400">
                        <Lock className="w-3 h-3" />
                        {t("access.statusDisabled")}
                      </span>
                    )}
                    {/* Customer: số dự án được gán; admin: số nhóm nội bộ */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
                      {u.role === "admin" ? (
                        <>
                          <UsersRound className="w-3 h-3" />
                          {t("membersList.teamCountLabel", { count: u.teamCount ?? 0 })}
                        </>
                      ) : (
                        <>
                          <FolderKanban className="w-3 h-3" />
                          {t("access.projectCountLabel", { count: u.projectCount ?? 0 })}
                        </>
                      )}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-medium",
                        u.emailVerified
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400",
                      )}
                    >
                      {u.emailVerified
                        ? t("membersList.verified")
                        : t("membersList.unverified")}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2 flex-wrap pt-2 mt-auto border-t border-zinc-100 dark:border-zinc-800">
                      <button type="button" onClick={() => setEditTarget(u)} className={actionBtn}>
                        <UserCog className="w-3.5 h-3.5" />
                        {t("membersList.actionEdit")}
                      </button>
                      {u.role === "admin" ? (
                        <button type="button" onClick={() => setTeamsTarget(u)} className={actionBtn}>
                          <UsersRound className="w-3.5 h-3.5" />
                          {t("membersList.actionManageTeams")}
                        </button>
                      ) : (
                        <button type="button" onClick={() => setProjectsTarget(u)} className={actionBtn}>
                          <FolderKanban className="w-3.5 h-3.5" />
                          {t("access.actionProjects")}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleResend(u)}
                        disabled={resendLink.isPending}
                        className={actionBtn}
                      >
                        {resendLink.isPending && resendLink.variables === u.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Mail className="w-3.5 h-3.5" />
                        )}
                        {t("access.actionResendLink")}
                      </button>
                      {!isMe && (
                        <button
                          type="button"
                          onClick={() => handleToggleLock(u)}
                          disabled={updateUser.isPending}
                          className={cn(
                            actionBtn,
                            u.status !== "disabled" &&
                              "hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400",
                          )}
                        >
                          {u.status === "disabled" ? (
                            <LockOpen className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                          {u.status === "disabled" ? t("access.actionUnlock") : t("access.actionLock")}
                        </button>
                      )}
                    </div>
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
