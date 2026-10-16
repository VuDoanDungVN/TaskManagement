"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Globe, ImageIcon, Lock, Plus, Trash2, UsersRound } from "lucide-react"
import {
  TEAMS_QUERY_KEY,
  useCreateTeam,
  useDeleteTeam,
  useInfiniteTeams,
} from "@/lib/teams/store"
import { teamsApi, type ApiTeam, type TeamRole } from "@/lib/api/teams"
import { uploadsApi } from "@/lib/api/uploads"
import { useAuth } from "@/lib/auth/context"
import { useI18n } from "@/lib/i18n/context"
import TeamDeleteDialog from "./team-delete-dialog"
import TeamDialog, { type TeamDialogDraft } from "./team-dialog"

const PAGE_SIZE = 20

export default function TeamList() {
  const { t } = useI18n()
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTeams(PAGE_SIZE)

  const teams = useMemo<ApiTeam[]>(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  )

  const deleteMutation = useDeleteTeam()
  const [deleteTarget, setDeleteTarget] = useState<ApiTeam | null>(null)

  // Tạo nhóm ngay từ trang danh sách (dùng lại luồng giống nút + trên sidebar)
  const queryClient = useQueryClient()
  const createTeam = useCreateTeam()
  const { user, verified, loading: authLoading } = useAuth()
  const canCreateTeam = !authLoading && !!user && verified
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  async function handleCreateTeam(
    draft: TeamDialogDraft,
    file: File | null,
    emails: string[],
  ) {
    const team = await createTeam.mutateAsync(draft)
    // Avatar + lời mời không chặn luồng: lỗi chỉ log, nhóm vẫn được tạo
    if (file) {
      try {
        await uploadsApi.teamAvatar(team.id, file)
      } catch (e) {
        console.error("Upload avatar nhóm thất bại:", e)
      }
    }
    if (emails.length > 0) {
      try {
        await teamsApi.invite(team.id, { emails })
      } catch (e) {
        console.error("Gửi lời mời thất bại:", e)
      }
    }
    queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY })
  }

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

  function roleLabel(role: TeamRole | null): string | null {
    switch (role) {
      case "owner":
        return t("teamsList.card.roleOwner")
      case "admin":
        return t("teamsList.card.roleAdmin")
      case "member":
        return t("teamsList.card.roleMember")
      default:
        return null
    }
  }

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UsersRound className="w-4 h-4 text-zinc-900 dark:text-zinc-50" />
          {t("teamsList.title")}
        </h2>
        <span className="text-xs text-zinc-600 dark:text-zinc-400">
          {t("teamsList.countLabel", { count: teams.length })}
        </span>
      </div>

      {isLoading ? (
        <div className="p-6 text-xs text-zinc-600 dark:text-zinc-400 text-center">
          {t("teamsList.loading")}
        </div>
      ) : error ? (
        <div className="p-6 text-xs text-red-600 dark:text-red-400 text-center">
          {t("teamsList.error", { message: (error as Error).message })}
        </div>
      ) : teams.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {t("teamsList.emptyTitle")}
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            {t("teamsList.emptyHelp")}
          </div>
          {canCreateTeam && (
            <button
              type="button"
              onClick={() => setCreateDialogOpen(true)}
              className={cn(
                "inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg",
                "text-xs font-medium",
                "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900",
                "hover:bg-zinc-800 dark:hover:bg-zinc-200",
                "transition-colors",
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              {t("nav.createTeam")}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {teams.map((team) => {
              const role = roleLabel(team.myRole)
              const isPublic = team.visibility === "public"
              const isOwner = team.myRole === "owner"
              return (
                <Link
                  key={team.id}
                  href={`/dashboard/teams/${team.id}`}
                  className={cn(
                    "group relative flex flex-row items-center gap-3",
                    "bg-white dark:bg-zinc-900/70",
                    "border border-zinc-100 dark:border-zinc-800",
                    "hover:border-zinc-200 dark:hover:border-zinc-700",
                    "rounded-xl shadow-sm p-4",
                    "transition-colors duration-200",
                  )}
                >
                  {isOwner && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setDeleteTarget(team)
                      }}
                      title={t("teamsList.deleteAria")}
                      aria-label={t("teamsList.deleteAria")}
                      className={cn(
                        "absolute top-2 right-2 z-10 flex items-center justify-center w-7 h-7 rounded-md",
                        "text-zinc-400 dark:text-zinc-500",
                        "hover:text-red-600 dark:hover:text-red-400",
                        "hover:bg-red-50 dark:hover:bg-red-900/20",
                        "opacity-0 group-hover:opacity-100 focus:opacity-100",
                        "transition-all",
                      )}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div
                    className={cn(
                      "w-12 h-12 shrink-0 rounded-lg overflow-hidden",
                      "bg-zinc-100 dark:bg-zinc-800",
                      "flex items-center justify-center",
                      "border border-zinc-100 dark:border-zinc-800",
                    )}
                  >
                    {team.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={team.avatarUrl}
                        alt={team.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
                    )}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0 gap-1 pr-6">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {team.name}
                      </h3>
                      {isPublic ? (
                        <Globe className="w-3 h-3 shrink-0 text-zinc-400 dark:text-zinc-500" />
                      ) : (
                        <Lock className="w-3 h-3 shrink-0 text-zinc-400 dark:text-zinc-500" />
                      )}
                    </div>
                    {team.description && (
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-1">
                        {team.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
                        <UsersRound className="w-3 h-3" />
                        {t("teamsList.card.membersCount", { count: team.memberCount })}
                      </span>
                      {role && (
                        <span className="px-2 py-0.5 rounded-md bg-zinc-900/5 dark:bg-zinc-50/10 text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
                          {role}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Sentinel + trạng thái tải thêm */}
          <div ref={sentinelRef} className="h-px" />
          <div className="pt-4 text-center">
            {isFetchingNextPage ? (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {t("teamsList.loadingMore")}
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
                {t("teamsList.loadMore")}
              </button>
            ) : (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {t("teamsList.endOfList")}
              </span>
            )}
          </div>
        </>
      )}

      <TeamDeleteDialog
        open={!!deleteTarget}
        teamName={deleteTarget?.name ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await deleteMutation.mutateAsync(deleteTarget.id)
        }}
      />

      <TeamDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateTeam}
      />
    </div>
  )
}
