"use client"

import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"
import { Check, ImageIcon, Loader2, Plus, Search, Trash2, UsersRound } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useI18n } from "@/lib/i18n/context"
import { useAddUserToTeam, useRemoveUserFromTeam, useUserTeams } from "@/lib/users/store"
import { useAllTeams } from "@/lib/teams/store"
import type { ApiUser } from "@/lib/api/users"

interface MemberTeamsDialogProps {
  open: boolean
  user: ApiUser | null
  onClose: () => void
}

const fieldClass = cn(
  "w-full pl-9 pr-3 py-2 rounded-lg",
  "bg-white dark:bg-[#0F0F12]",
  "border border-zinc-200 dark:border-zinc-700",
  "text-sm text-zinc-900 dark:text-zinc-100",
  "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400",
)

export default function MemberTeamsDialog({ open, user, onClose }: MemberTeamsDialogProps) {
  const { t } = useI18n()

  const userTeamsQuery = useUserTeams(user?.id, open)
  const addMutation = useAddUserToTeam()
  const removeMutation = useRemoveUserFromTeam()

  // Tìm kiếm nhóm (debounce) — chỉ fetch khi dialog mở
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(id)
  }, [search])
  const allTeamsQuery = useAllTeams(debounced, open)

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [addRole, setAddRole] = useState<"member" | "admin">("member")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setSearch("")
      setDebounced("")
      setSelectedTeamId(null)
      setAddRole("member")
      setError(null)
    }
  }, [open])

  const joinedIds = useMemo(
    () => new Set((userTeamsQuery.data ?? []).map((tm) => tm.teamId)),
    [userTeamsQuery.data],
  )
  const candidates = useMemo(
    () => (allTeamsQuery.data ?? []).filter((tm) => !joinedIds.has(tm.id)),
    [allTeamsQuery.data, joinedIds],
  )

  async function handleAdd() {
    if (!user || !selectedTeamId || addMutation.isPending) return
    setError(null)
    try {
      await addMutation.mutateAsync({ id: user.id, teamId: selectedTeamId, role: addRole })
      setSelectedTeamId(null)
      setSearch("")
    } catch (err) {
      setError(err instanceof Error ? err.message : t("membersList.teams.addError"))
    }
  }

  async function handleRemove(teamId: string) {
    if (!user || removeMutation.isPending) return
    setError(null)
    try {
      await removeMutation.mutateAsync({ id: user.id, teamId })
    } catch (err) {
      setError(err instanceof Error ? err.message : t("membersList.teams.removeError"))
    }
  }

  const displayName = user?.displayName || user?.email || ""

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
            {t("membersList.teams.title", { name: displayName })}
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            {t("membersList.teams.desc")}
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-[11px] text-red-600 dark:text-red-400">{error}</p>}

        {/* Thêm vào nhóm */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {t("membersList.teams.addTitle")}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("membersList.teams.searchPlaceholder")}
              className={fieldClass}
            />
          </div>

          <div className="max-h-40 overflow-y-auto rounded-lg border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
            {allTeamsQuery.isLoading ? (
              <div className="px-3 py-4 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t("membersList.teams.loading")}
              </div>
            ) : candidates.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                {t("membersList.teams.noTeams")}
              </div>
            ) : (
              candidates.map((tm) => {
                const selected = selectedTeamId === tm.id
                return (
                  <button
                    key={tm.id}
                    type="button"
                    onClick={() => setSelectedTeamId(selected ? null : tm.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors",
                      selected
                        ? "bg-zinc-50 dark:bg-zinc-800/60"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
                    )}
                  >
                    <div className="w-7 h-7 shrink-0 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      {tm.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={tm.avatarUrl} alt={tm.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </div>
                    <span className="flex-1 min-w-0 truncate text-sm text-zinc-900 dark:text-zinc-100">
                      {tm.name}
                    </span>
                    {selected && <Check className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />}
                  </button>
                )
              })
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              {(["member", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAddRole(r)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-colors",
                    addRole === r
                      ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900"
                      : "bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  )}
                >
                  {r === "admin"
                    ? t("membersList.teams.addRoleAdmin")
                    : t("membersList.teams.addRoleMember")}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedTeamId || addMutation.isPending}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
                "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900",
                "hover:bg-zinc-800 dark:hover:bg-zinc-200",
                "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {addMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              {addMutation.isPending
                ? t("membersList.teams.adding")
                : t("membersList.teams.addSubmit")}
            </button>
          </div>
        </div>

        {/* Nhóm hiện tại */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <UsersRound className="w-3.5 h-3.5" />
            {userTeamsQuery.data
              ? t("membersList.teamCountLabel", { count: userTeamsQuery.data.length })
              : null}
          </div>
          {userTeamsQuery.isLoading ? (
            <div className="px-3 py-4 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {t("membersList.teams.loading")}
            </div>
          ) : (userTeamsQuery.data ?? []).length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {t("membersList.teams.empty")}
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
              {(userTeamsQuery.data ?? []).map((tm) => (
                <div key={tm.teamId} className="flex items-center gap-2.5 px-3 py-2">
                  <div className="w-7 h-7 shrink-0 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    {tm.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tm.avatarUrl} alt={tm.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </div>
                  <span className="flex-1 min-w-0 truncate text-sm text-zinc-900 dark:text-zinc-100">
                    {tm.name}
                  </span>
                  <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
                    {tm.isOwner
                      ? t("membersList.teams.ownerBadge")
                      : tm.role === "admin"
                        ? t("membersList.teams.roleAdmin")
                        : t("membersList.teams.roleMember")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(tm.teamId)}
                    disabled={tm.isOwner || removeMutation.isPending}
                    title={t("membersList.teams.remove")}
                    aria-label={t("membersList.teams.remove")}
                    className={cn(
                      "shrink-0 flex items-center justify-center w-7 h-7 rounded-md",
                      "text-zinc-400 dark:text-zinc-500",
                      "hover:text-red-600 dark:hover:text-red-400",
                      "hover:bg-red-50 dark:hover:bg-red-900/20",
                      "transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-400",
                    )}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
