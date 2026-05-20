"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FolderKanban,
  ImageIcon,
  ListChecks,
  Loader2,
  Plus,
  Timer,
} from "lucide-react"
import Layout from "@/components/kokonutui/layout"
import { StatusDonut, TopProjectsBar } from "@/components/kokonutui/dashboard-charts"
import { useProjects } from "@/lib/projects/store"
import { useAllTasks } from "@/lib/tasks/store"
import type { ApiProject } from "@/lib/api/projects"
import type { ApiTask } from "@/lib/api/tasks"
import { PRIORITY_CONFIG, STATUS_CONFIG } from "@/lib/tasks/utils"
import { useI18n } from "@/lib/i18n/context"
import type { TranslationKey } from "@/lib/i18n/types"
import { cn } from "@/lib/utils"

type TFn = (key: TranslationKey, params?: Record<string, string | number>) => string

function todayYMD(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function ymdPlusDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function daysBetween(later: string, earlier: string): number {
  const a = new Date(later + "T00:00:00")
  const b = new Date(earlier + "T00:00:00")
  return Math.round((a.getTime() - b.getTime()) / 86_400_000)
}

function formatDueRelative(due: string, today: string, t: TFn): string {
  if (due < today) {
    return t("dashboard.overdueByDays", { days: daysBetween(today, due) })
  }
  if (due === today) return t("dashboard.dueToday")
  const diff = daysBetween(due, today)
  if (diff === 1) return t("dashboard.dueTomorrow")
  return t("dashboard.dueInDays", { days: diff })
}

function formatRelativeTime(ms: number, t: TFn): string {
  const diff = Date.now() - ms
  const m = Math.round(diff / 60_000)
  if (m < 1) return t("dashboard.dueToday").includes("Hôm") ? "vừa xong" : "now"
  if (m < 60) return `${m}m`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.round(h / 24)
  return `${d}d`
}

function formatDateShort(ymd: string): string {
  // ymd = "YYYY-MM-DD" → "DD/MM"
  const parts = ymd.split("-")
  if (parts.length !== 3) return ymd
  return `${parts[2]}/${parts[1]}`
}

interface StatCardProps {
  icon: typeof Timer
  label: string
  value: string | number
  hint?: string
  tone?: "default" | "warning" | "success" | "info"
}

function StatCard({ icon: Icon, label, value, hint, tone = "default" }: StatCardProps) {
  const toneClass = {
    default: "text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800",
    warning: "text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30",
    success: "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30",
    info: "text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30",
  }[tone]
  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-4">
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", toneClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{label}</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {value}
          </p>
        </div>
      </div>
      {hint && (
        <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">{hint}</p>
      )}
    </div>
  )
}

interface TaskRowProps {
  task: ApiTask
  project: ApiProject | undefined
  rightSlot?: React.ReactNode
  t: TFn
}

function TaskRow({ task, project, rightSlot, t }: TaskRowProps) {
  const status = STATUS_CONFIG[task.status]
  const priority = PRIORITY_CONFIG[task.priority]
  return (
    <Link
      href={`/dashboard/${task.projectId}/${task.id}`}
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-lg",
        "hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
        "transition-colors",
      )}
    >
      <span
        className={cn(
          "shrink-0 inline-flex items-center justify-center",
          "px-1.5 py-0.5 rounded-md",
          "bg-zinc-100 dark:bg-zinc-800",
          "text-[10px] font-semibold tabular-nums",
          "text-zinc-600 dark:text-zinc-300",
        )}
      >
        #{String(task.no).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-950 dark:group-hover:text-white">
          {task.title}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[180px]">
            {project?.name ?? "—"}
          </span>
          <span
            className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
              status.pill,
            )}
          >
            {t(status.labelKey)}
          </span>
          <span
            className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px] font-medium hidden sm:inline-flex",
              priority.pill,
            )}
          >
            {t(priority.labelKey)}
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">{rightSlot}</div>
    </Link>
  )
}

interface SectionCardProps {
  icon: typeof Timer
  title: string
  subtitle?: string
  action?: { href: string; label: string }
  variant?: "default" | "danger"
  children: React.ReactNode
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  action,
  variant = "default",
  children,
}: SectionCardProps) {
  const headerColor =
    variant === "danger"
      ? "text-red-600 dark:text-red-400"
      : "text-zinc-700 dark:text-zinc-300"
  return (
    <section
      className={cn(
        "bg-white dark:bg-[#0F0F12] rounded-xl border",
        variant === "danger"
          ? "border-red-200 dark:border-red-900/40"
          : "border-gray-200 dark:border-[#1F1F23]",
      )}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={cn("w-4 h-4 shrink-0", headerColor)} />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {title}
          </h2>
          {subtitle && (
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0">
              · {subtitle}
            </span>
          )}
        </div>
        {action && (
          <Link
            href={action.href}
            className={cn(
              "inline-flex items-center gap-1 text-[11px] font-medium",
              "text-zinc-600 dark:text-zinc-400",
              "hover:text-zinc-900 dark:hover:text-zinc-100",
              "transition-colors shrink-0",
            )}
          >
            {action.label}
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      <div className="p-2">{children}</div>
    </section>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-3 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400 italic">
      {message}
    </div>
  )
}

const UPCOMING_DAYS = 7

export default function DashboardPage() {
  const { t } = useI18n()
  const projectsQuery = useProjects()
  const allTasksQuery = useAllTasks()

  const projects = projectsQuery.data ?? []
  const tasks = allTasksQuery.data ?? []

  const projectById = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects],
  )

  const stats = useMemo(() => {
    const total = tasks.length
    const inProgress = tasks.filter((x) => x.status === "in-progress").length
    const completed = tasks.filter((x) => x.status === "completed").length
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { total, inProgress, completed, pct }
  }, [tasks])

  const today = todayYMD()
  const upperBound = ymdPlusDays(UPCOMING_DAYS)

  const overdue = useMemo(
    () =>
      tasks
        .filter((x) => x.status !== "completed" && x.dueDate && x.dueDate < today)
        .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
        .slice(0, 5),
    [tasks, today],
  )

  const upcoming = useMemo(
    () =>
      tasks
        .filter(
          (x) =>
            x.status !== "completed" &&
            x.dueDate &&
            x.dueDate >= today &&
            x.dueDate <= upperBound,
        )
        .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
        .slice(0, 6),
    [tasks, today, upperBound],
  )

  const recent = useMemo(
    () => [...tasks].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8),
    [tasks],
  )

  const activeProjects = useMemo(
    () => [...projects].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6),
    [projects],
  )

  const isLoading = projectsQuery.isLoading || allTasksQuery.isLoading
  const error = projectsQuery.error ?? allTasksQuery.error

  return (
    <Layout
      breadcrumbs={[
        { label: t("breadcrumbs.dashboard"), icon: FolderKanban },
      ]}
    >
      <div className="space-y-4">
        {/* Active projects — full-width, ở vị trí cũ của header "Tổng quan" */}
        <SectionCard
          icon={FolderKanban}
          title={t("dashboard.sectionActiveProjects")}
          action={{
            href: "/dashboard/projects",
            label: t("dashboard.viewAll"),
          }}
        >
          {projectsQuery.isLoading ? (
            <div className="px-3 py-8 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("dashboard.loading")}
            </div>
          ) : projectsQuery.error ? (
            <div className="px-3 py-6 text-center text-xs text-red-600 dark:text-red-400">
              {t("dashboard.error", { message: (projectsQuery.error as Error).message })}
            </div>
          ) : activeProjects.length === 0 ? (
            <div className="px-3 py-8 flex flex-col items-center text-center gap-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t("dashboard.emptyProjects")}
              </p>
              <Link
                href="/dashboard/projects"
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                  "text-xs font-medium",
                  "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900",
                  "hover:bg-zinc-800 dark:hover:bg-zinc-200",
                )}
              >
                <Plus className="w-3.5 h-3.5" />
                {t("dashboard.emptyProjectsCta")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-1">
              {activeProjects.map((p) => {
                const total = p.stats.total
                const done = p.stats.completed
                const pct = total === 0 ? 0 : Math.round((done / total) * 100)
                const barColor =
                  pct >= 70
                    ? "bg-emerald-500 dark:bg-emerald-400"
                    : pct >= 30
                      ? "bg-amber-500 dark:bg-amber-400"
                      : "bg-red-500 dark:bg-red-400"
                return (
                  <Link
                    key={p.id}
                    href={`/dashboard/${p.id}`}
                    className={cn(
                      "group flex flex-col gap-2 p-3 rounded-lg",
                      "border border-zinc-100 dark:border-zinc-800",
                      "hover:border-zinc-200 dark:hover:border-zinc-700",
                      "hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
                      "transition-colors",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        {p.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.thumbnailUrl}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          {t("projects.card.tasksTotal", { count: total })}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] tabular-nums">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {t("projects.card.progress")}
                        </span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", barColor)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </SectionCard>

        {/* Recent activity — ngay dưới Dự án nổi bật, full-width */}
        <SectionCard icon={Timer} title={t("dashboard.sectionRecent")}>
          {allTasksQuery.isLoading ? (
            <div className="px-3 py-8 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("dashboard.loading")}
            </div>
          ) : allTasksQuery.error ? (
            <div className="px-3 py-6 text-center text-xs text-red-600 dark:text-red-400">
              {t("dashboard.error", { message: (allTasksQuery.error as Error).message })}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState message={t("dashboard.emptyRecent")} />
          ) : (
            recent.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={projectById.get(task.projectId)}
                t={t}
                rightSlot={
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                    {formatRelativeTime(task.updatedAt, t)}
                  </span>
                }
              />
            ))
          )}
        </SectionCard>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FolderKanban}
            label={t("dashboard.statTotalProjects")}
            value={projects.length}
          />
          <StatCard
            icon={ListChecks}
            label={t("dashboard.statTotalTasks")}
            value={stats.total}
          />
          <StatCard
            icon={Clock}
            label={t("dashboard.statInProgress")}
            value={stats.inProgress}
            tone="info"
          />
          <StatCard
            icon={CheckCircle2}
            label={t("dashboard.statCompleted")}
            value={stats.completed}
            hint={t("dashboard.statCompletionPct", { value: stats.pct })}
            tone="success"
          />
        </div>

        {isLoading ? (
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-8 flex items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("dashboard.loading")}
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-red-200 dark:border-red-900/40 p-6 text-xs text-red-600 dark:text-red-400">
            {t("dashboard.error", { message: (error as Error).message })}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <StatusDonut tasks={tasks} />
              <TopProjectsBar projects={projects} />
            </div>

            {/* Overdue — chỉ hiển thị khi có */}
            {overdue.length > 0 && (
              <SectionCard
                icon={AlertTriangle}
                title={t("dashboard.sectionOverdue")}
                subtitle={String(overdue.length)}
                variant="danger"
              >
                {overdue.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    project={projectById.get(task.projectId)}
                    t={t}
                    rightSlot={
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        {formatDueRelative(task.dueDate!, today, t)}
                      </span>
                    }
                  />
                ))}
              </SectionCard>
            )}

            {/* Upcoming */}
            <SectionCard
              icon={Calendar}
              title={t("dashboard.sectionUpcoming")}
              subtitle={t("dashboard.upcomingWindow", { days: UPCOMING_DAYS })}
            >
              {upcoming.length === 0 ? (
                <EmptyState message={t("dashboard.emptyUpcoming")} />
              ) : (
                upcoming.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    project={projectById.get(task.projectId)}
                    t={t}
                    rightSlot={
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 tabular-nums">
                          {formatDateShort(task.dueDate!)}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          {formatDueRelative(task.dueDate!, today, t)}
                        </span>
                      </div>
                    }
                  />
                ))
              )}
            </SectionCard>
          </div>
        )}
      </div>
    </Layout>
  )
}
