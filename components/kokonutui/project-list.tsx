"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { ArrowRight, FolderKanban, ImageIcon, Info, ListChecks, Plus } from "lucide-react"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { PROJECTS_QUERY_KEY, useCreateProject, useProjects } from "@/lib/projects/store"
import { STATUS_CONFIG } from "@/lib/tasks/utils"
import type { ProjectDraft } from "@/lib/projects/types"
import { uploadsApi } from "@/lib/api/uploads"
import ProjectDialog from "./project-dialog"
import { useAuth } from "@/lib/auth/context"

export default function ProjectList() {
  const { user, verified, loading: authLoading } = useAuth()
  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useProjects()
  const createMutation = useCreateProject()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)

  const isGuest = !authLoading && (!user || !verified)

  async function handleCreate(draft: ProjectDraft, file: File | null) {
    const project = await createMutation.mutateAsync(draft)
    if (file) {
      try {
        await uploadsApi.projectThumbnail(project.id, file)
      } catch (e) {
        console.error("Upload thumbnail thất bại:", e)
      }
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
    }
  }

  return (
    <div className="space-y-4">
      {isGuest && (
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
            "bg-white dark:bg-[#0F0F12]",
            "border border-amber-200 dark:border-amber-900/40",
            "ring-1 ring-inset ring-amber-100 dark:ring-amber-900/20",
            "rounded-xl px-4 py-3",
          )}
        >
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Bạn đang xem ở chế độ khách
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                Đăng nhập để xem chi tiết task của từng dự án, tạo dự án mới và quản lý công việc.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
            Dự án
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              {projects.length} dự án
            </span>
            {!isGuest && (
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className={cn(
                  "flex items-center justify-center gap-2",
                  "py-2 px-3 rounded-lg",
                  "text-xs font-medium",
                  "bg-zinc-900 dark:bg-zinc-50",
                  "text-zinc-50 dark:text-zinc-900",
                  "hover:bg-zinc-800 dark:hover:bg-zinc-200",
                  "shadow-sm hover:shadow",
                  "transition-all duration-200",
                )}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo dự án mới</span>
              </button>
            )}
          </div>
        </div>

        {isGuest ? (
          <div className="p-8 text-center">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Đăng nhập để xem dự án
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Tạo tài khoản hoặc đăng nhập bằng banner phía trên.
            </div>
          </div>
        ) : projectsLoading ? (
          <div className="p-6 text-xs text-zinc-600 dark:text-zinc-400 text-center">
            Đang tải dữ liệu…
          </div>
        ) : projectsError ? (
          <div className="p-6 text-xs text-red-600 dark:text-red-400 text-center">
            Lỗi: {(projectsError as Error).message}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Chưa có dự án nào
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Tạo dự án đầu tiên để bắt đầu quản lý công việc.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((p) => {
              const stats = p.stats
              const progress =
                stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100)
              const progressColor =
                progress <= 30
                  ? "bg-red-500 dark:bg-red-400"
                  : progress < 60
                    ? "bg-amber-500 dark:bg-amber-400"
                    : "bg-emerald-500 dark:bg-emerald-400"
              return (
                <Link
                  key={p.id}
                  href={`/dashboard/${p.id}`}
                  className={cn(
                    "group flex flex-row",
                    "bg-white dark:bg-zinc-900/70",
                    "border border-zinc-100 dark:border-zinc-800",
                    "hover:border-zinc-200 dark:hover:border-zinc-700",
                    "rounded-xl shadow-sm backdrop-blur-xl",
                    "transition-colors duration-200",
                    "overflow-hidden",
                  )}
                >
                  <div
                    className={cn(
                      "w-28 h-28 sm:w-32 sm:h-32 shrink-0 aspect-square",
                      "bg-zinc-100 dark:bg-zinc-800",
                      "flex items-center justify-center",
                      "border-r border-zinc-100 dark:border-zinc-800",
                    )}
                  >
                    {p.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.thumbnailUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1 gap-2 min-w-0">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1">
                          {p.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
                        <ListChecks className="w-3 h-3" />
                        {stats.total} task
                      </span>
                      {stats.pending > 0 && (
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-medium",
                            STATUS_CONFIG.pending.pill,
                          )}
                        >
                          {stats.pending} chưa
                        </span>
                      )}
                      {stats["in-progress"] > 0 && (
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-medium",
                            STATUS_CONFIG["in-progress"].pill,
                          )}
                        >
                          {stats["in-progress"]} đang
                        </span>
                      )}
                      {stats.completed > 0 && (
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-medium",
                            STATUS_CONFIG.completed.pill,
                          )}
                        >
                          {stats.completed} xong
                        </span>
                      )}
                    </div>

                    {stats.total > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-600 dark:text-zinc-400">Tiến độ</span>
                          <span className="text-zinc-900 dark:text-zinc-100 tabular-nums">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              progressColor,
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-auto pt-2 flex items-center justify-end text-[11px] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                      <span>Xem chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <ProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}
