"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { ApiProject } from "@/lib/api/projects"
import type { ApiTask, ApiTaskStatus } from "@/lib/api/tasks"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

// Khớp với STATUS_CONFIG dot colors (amber/blue/emerald-500) — pin thẳng hex để
// recharts SVG có thể dùng. Đổi ở đây thì donut + bar đều đổi.
const STATUS_COLORS: Record<ApiTaskStatus, string> = {
  pending: "#f59e0b", // amber-500
  "in-progress": "#3b82f6", // blue-500
  completed: "#10b981", // emerald-500
}

interface ChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <section className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23]">
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="h-[220px] flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400 italic text-center px-4">
      {message}
    </div>
  )
}

interface LegendItem {
  color: string
  label: string
  value: number
}

function ChartLegend({ items, totalLabel, total }: { items: LegendItem[]; totalLabel: string; total: number }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it) => {
        const pct = total === 0 ? 0 : Math.round((it.value / total) * 100)
        return (
          <li key={it.label} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: it.color }}
              aria-hidden
            />
            <span className="flex-1 min-w-0 truncate text-zinc-700 dark:text-zinc-300">
              {it.label}
            </span>
            <span className="text-zinc-900 dark:text-zinc-100 tabular-nums font-medium">
              {it.value}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 tabular-nums w-9 text-right">
              {pct}%
            </span>
          </li>
        )
      })}
      <li className="pt-1.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-xs">
        <span className="w-2.5 h-2.5 shrink-0" aria-hidden />
        <span className="flex-1 text-zinc-500 dark:text-zinc-400">{totalLabel}</span>
        <span className="text-zinc-900 dark:text-zinc-100 tabular-nums font-semibold">
          {total}
        </span>
      </li>
    </ul>
  )
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string; payload?: unknown }>
  label?: string | number
}

function NeatTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0F0F12] px-2.5 py-1.5 shadow-md text-[11px]">
      {label !== undefined && label !== "" && (
        <div className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">{label}</div>
      )}
      <ul className="space-y-0.5">
        {payload.map((p, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-sm"
              style={{ backgroundColor: p.color }}
              aria-hidden
            />
            <span className="text-zinc-600 dark:text-zinc-400">{p.name}</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-medium tabular-nums">
              {p.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Donut chart: phân bố pending / in-progress / completed của tất cả task. */
export function StatusDonut({ tasks }: { tasks: ApiTask[] }) {
  const { t } = useI18n()
  const counts = useMemo(() => {
    const c = { pending: 0, "in-progress": 0, completed: 0 }
    for (const x of tasks) c[x.status] += 1
    return c
  }, [tasks])
  const total = tasks.length

  const data = [
    { name: t("tasks.status.pending"), value: counts.pending, color: STATUS_COLORS.pending },
    { name: t("tasks.status.inProgress"), value: counts["in-progress"], color: STATUS_COLORS["in-progress"] },
    { name: t("tasks.status.completed"), value: counts.completed, color: STATUS_COLORS.completed },
  ]

  return (
    <ChartCard title={t("dashboard.sectionStatusDistribution")}>
      {total === 0 ? (
        <ChartEmpty message={t("dashboard.chartNoData")} />
      ) : (
        <div className="grid grid-cols-[180px_1fr] gap-4 items-center">
          <div className="relative h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip content={<NeatTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Trung tâm donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                {total}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t("dashboard.chartTasksLabel")}
              </span>
            </div>
          </div>
          <ChartLegend
            items={data.map((d) => ({ color: d.color, label: d.name, value: d.value }))}
            totalLabel={t("dashboard.chartTotalLabel")}
            total={total}
          />
        </div>
      )}
    </ChartCard>
  )
}

interface TopProjectsBarProps {
  projects: ApiProject[]
  limit?: number
}

/** Horizontal stacked bar: top N project theo tổng số task, breakdown theo status. */
export function TopProjectsBar({ projects, limit = 6 }: TopProjectsBarProps) {
  const { t } = useI18n()
  const ranked = useMemo(
    () =>
      [...projects]
        .filter((p) => p.stats.total > 0)
        .sort((a, b) => b.stats.total - a.stats.total)
        .slice(0, limit)
        .map((p) => ({
          name: p.name.length > 22 ? p.name.slice(0, 21) + "…" : p.name,
          fullName: p.name,
          pending: p.stats.pending,
          inProgress: p.stats["in-progress"],
          completed: p.stats.completed,
        })),
    [projects, limit],
  )

  // Chiều cao tính theo số bar để mỗi bar có chỗ thở (~40px / bar + padding).
  const height = Math.max(180, ranked.length * 44 + 40)

  return (
    <ChartCard title={t("dashboard.sectionTopProjects")}>
      {ranked.length === 0 ? (
        <ChartEmpty message={t("dashboard.chartNoData")} />
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ranked}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
              barCategoryGap={10}
            >
              <CartesianGrid horizontal={false} stroke="currentColor" strokeOpacity={0.08} />
              <XAxis
                type="number"
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "currentColor", fillOpacity: 0.6 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "currentColor", fillOpacity: 0.8 }}
              />
              <Tooltip
                cursor={{ fill: "currentColor", fillOpacity: 0.04 }}
                content={<NeatTooltip />}
              />
              <Bar
                dataKey="pending"
                stackId="s"
                name={t("tasks.status.pending")}
                fill={STATUS_COLORS.pending}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="inProgress"
                stackId="s"
                name={t("tasks.status.inProgress")}
                fill={STATUS_COLORS["in-progress"]}
              />
              <Bar
                dataKey="completed"
                stackId="s"
                name={t("tasks.status.completed")}
                fill={STATUS_COLORS.completed}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {/* Legend chung dưới */}
      {ranked.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px]">
          {(
            [
              ["pending", t("tasks.status.pending")],
              ["in-progress", t("tasks.status.inProgress")],
              ["completed", t("tasks.status.completed")],
            ] as const
          ).map(([k, label]) => (
            <li key={k} className="inline-flex items-center gap-1.5">
              <span
                className={cn("w-2.5 h-2.5 rounded-sm")}
                style={{ backgroundColor: STATUS_COLORS[k] }}
                aria-hidden
              />
              <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  )
}
