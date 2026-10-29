"use client"

import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"
import {
  ChevronDown,
  Loader2,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  Users2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useI18n } from "@/lib/i18n/context"
import {
  useAddProjectMember,
  useProjectMembers,
  useRemoveProjectMember,
} from "@/lib/projects/store"
import { useInfiniteUsers, useIsAdmin } from "@/lib/users/store"
import UserAvatar from "./user-avatar"
import Collapse from "./collapse"

const fieldClass = cn(
  "w-full pl-9 pr-3 py-2 rounded-lg",
  "bg-white dark:bg-[#0F0F12]",
  "border border-zinc-200 dark:border-zinc-700",
  "text-sm text-zinc-900 dark:text-zinc-100",
  "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400",
)

const MOBILE_AVATAR_LIMIT = 5

/** Thẻ "Thành viên dự án": customer xem danh sách, admin mở dialog để thêm/gỡ. */
export default function ProjectMembers({ projectId }: { projectId: string }) {
  const { t } = useI18n()
  const isAdmin = useIsAdmin()
  const { data: members = [], isLoading } = useProjectMembers(projectId)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expanded, setExpanded] = useState(false) // mobile: mở danh sách thành viên

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl px-4 py-3 border border-gray-200 dark:border-[#1F1F23]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Users2 className="w-4 h-4 shrink-0 text-zinc-700 dark:text-zinc-300" />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {t("access.projectMembers")}
          </h2>
          <span className="hidden sm:inline text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0">
            · {t("access.projectMembersCount", { count: members.length })}
          </span>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            aria-label={t("access.manageMembers")}
            title={t("access.manageMembers")}
            className={cn(
              "shrink-0 inline-flex items-center justify-center gap-1.5 w-8 h-8 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1.5 rounded-lg text-[11px] font-medium",
              "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
              "hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors",
            )}
          >
            <Settings2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">{t("access.manageMembers")}</span>
          </button>
        )}
      </div>

      {/* ---------- Mobile: tóm tắt + danh sách dọc khi mở ---------- */}
      <div className="sm:hidden mt-2">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
        ) : members.length === 0 ? (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("access.noMembers")}</span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="w-full flex items-center gap-2.5 py-1 text-left"
            >
              <div className="flex -space-x-2 shrink-0">
                {members.slice(0, MOBILE_AVATAR_LIMIT).map((m) => (
                  <UserAvatar
                    key={m.id}
                    name={m.displayName || m.email}
                    src={m.avatarUrl ?? undefined}
                    size={28}
                    className="ring-2 ring-white dark:ring-[#0F0F12]"
                  />
                ))}
                {members.length > MOBILE_AVATAR_LIMIT && (
                  <span className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-[#0F0F12] bg-zinc-200 dark:bg-zinc-700 text-[10px] font-semibold text-zinc-700 dark:text-zinc-200 flex items-center justify-center">
                    +{members.length - MOBILE_AVATAR_LIMIT}
                  </span>
                )}
              </div>
              <span className="flex-1 text-xs text-zinc-600 dark:text-zinc-400">
                {t("access.projectMembersCount", { count: members.length })}
              </span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 shrink-0 text-zinc-400 transition-transform duration-200",
                  expanded && "rotate-180",
                )}
              />
            </button>

            <Collapse open={expanded}>
              <ul className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800 border-t border-zinc-100 dark:border-zinc-800">
                {members.map((m) => {
                  const name = m.displayName || m.email
                  return (
                    <li key={m.id} className="flex items-center gap-2.5 py-2">
                      <UserAvatar name={name} src={m.avatarUrl ?? undefined} size={30} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{name}</div>
                        {m.displayName && (
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{m.email}</div>
                        )}
                      </div>
                      <span
                        className={cn(
                          "shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium",
                          m.role === "admin"
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300",
                        )}
                      >
                        {m.role === "admin" && <ShieldCheck className="w-3 h-3" />}
                        {m.role === "admin" ? t("access.roleAdmin") : t("access.roleCustomer")}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Collapse>
          </>
        )}
      </div>

      {/* ---------- Tablet/desktop: chip tên từng người ---------- */}
      <div className="hidden sm:flex mt-2.5 flex-wrap gap-1.5">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
        ) : members.length === 0 ? (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("access.noMembers")}</span>
        ) : (
          members.map((m) => {
            const name = m.displayName || m.email
            return (
              <span
                key={m.id}
                title={m.email}
                className="inline-flex items-center gap-1.5 max-w-full pl-0.5 pr-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800"
              >
                <UserAvatar name={name} src={m.avatarUrl ?? undefined} size={20} />
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate">
                  {name}
                </span>
                {m.role === "admin" && <ShieldCheck className="w-3 h-3 shrink-0 text-amber-500" />}
              </span>
            )
          })
        )}
      </div>

      {/* Chỉ mount khi mở → không tải danh sách user khi chưa cần */}
      {isAdmin && dialogOpen && (
        <ProjectMembersDialog
          open={dialogOpen}
          projectId={projectId}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  )
}

function ProjectMembersDialog({
  open,
  projectId,
  onClose,
}: {
  open: boolean
  projectId: string
  onClose: () => void
}) {
  const { t } = useI18n()
  const { data: members = [], isLoading } = useProjectMembers(projectId)
  const addMutation = useAddProjectMember()
  const removeMutation = useRemoveProjectMember()
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(id)
  }, [search])
  useEffect(() => {
    if (open) {
      setSearch("")
      setDebounced("")
      setError(null)
    }
  }, [open])

  const usersQuery = useInfiniteUsers(20, debounced)
  const memberIds = useMemo(() => new Set(members.map((m) => m.id)), [members])
  const candidates = useMemo(
    () =>
      (usersQuery.data?.pages.flatMap((p) => p.items) ?? []).filter(
        (u) => !memberIds.has(u.id) && u.status !== "disabled",
      ),
    [usersQuery.data, memberIds],
  )

  async function handleAdd(userId: string) {
    setError(null)
    try {
      await addMutation.mutateAsync({ projectId, userId })
    } catch (err) {
      setError(err instanceof Error ? err.message : t("access.memberError"))
    }
  }

  async function handleRemove(userId: string) {
    setError(null)
    try {
      await removeMutation.mutateAsync({ projectId, userId })
    } catch (err) {
      setError(err instanceof Error ? err.message : t("access.memberError"))
    }
  }

  const busy = addMutation.isPending || removeMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={cn(
          "max-w-lg",
          "bg-white dark:bg-[#0F0F12]",
          "border border-gray-200 dark:border-[#1F1F23]",
          "text-zinc-900 dark:text-zinc-100",
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100">
            {t("access.membersDialogTitle")}
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            {t("access.membersDialogDesc")}
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-[11px] text-red-600 dark:text-red-400">{error}</p>}

        {/* Thêm thành viên */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {t("access.addMemberTitle")}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("access.searchUsers")}
              className={fieldClass}
            />
          </div>
          <div className="max-h-44 overflow-y-auto rounded-lg border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
            {usersQuery.isLoading ? (
              <div className="px-3 py-4 flex justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              </div>
            ) : candidates.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                {t("access.noCandidates")}
              </div>
            ) : (
              candidates.map((u) => {
                const name = u.displayName || u.email
                return (
                  <div key={u.id} className="flex items-center gap-2.5 px-3 py-2">
                    <UserAvatar name={name} src={u.avatarUrl ?? undefined} size={28} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-zinc-900 dark:text-zinc-100 truncate">{name}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{u.email}</div>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleAdd(u.id)}
                      title={t("access.addMemberTitle")}
                      aria-label={t("access.addMemberTitle")}
                      className={cn(
                        "shrink-0 flex items-center justify-center w-7 h-7 rounded-md",
                        "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900",
                        "hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                      )}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Thành viên hiện tại */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {t("access.projectMembersCount", { count: members.length })}
          </div>
          {isLoading ? (
            <div className="px-3 py-4 flex justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            </div>
          ) : members.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {t("access.noMembers")}
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto rounded-lg border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
              {members.map((m) => {
                const name = m.displayName || m.email
                return (
                  <div key={m.id} className="flex items-center gap-2.5 px-3 py-2">
                    <UserAvatar name={name} src={m.avatarUrl ?? undefined} size={28} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-zinc-900 dark:text-zinc-100 truncate">{name}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{m.email}</div>
                    </div>
                    <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
                      {m.role === "admin" ? t("access.roleAdmin") : t("access.roleCustomer")}
                    </span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleRemove(m.id)}
                      title={t("access.removeMember")}
                      aria-label={t("access.removeMember")}
                      className={cn(
                        "shrink-0 flex items-center justify-center w-7 h-7 rounded-md",
                        "text-zinc-400 dark:text-zinc-500",
                        "hover:text-red-600 dark:hover:text-red-400",
                        "hover:bg-red-50 dark:hover:bg-red-900/20",
                        "transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
                      )}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
