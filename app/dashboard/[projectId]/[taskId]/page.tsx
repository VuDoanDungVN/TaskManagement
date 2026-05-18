"use client"

import { useParams } from "next/navigation"
import { FolderKanban, ListChecks } from "lucide-react"
import Layout from "@/components/kokonutui/layout"
import TaskDetail from "@/components/kokonutui/task-detail"
import TaskComments from "@/components/kokonutui/task-comments"
import { useProject } from "@/lib/projects/store"
import { useTask } from "@/lib/tasks/store"

export default function TaskDetailPage() {
  const params = useParams<{ projectId: string; taskId: string }>()
  const projectId = params.projectId
  const taskId = params.taskId

  const projectQuery = useProject(projectId)
  const taskQuery = useTask(taskId)

  const project = projectQuery.data
  const isOwner = !!project // GET /projects/:id chỉ trả về cho owner
  const task = taskQuery.data

  const breadcrumbLabel = task
    ? `#${String(task.no).padStart(2, "0")} ${task.title}`
    : "Task"

  return (
    <Layout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard", icon: FolderKanban },
        {
          label: project?.name ?? "Dự án",
          href: `/dashboard/${projectId}`,
          icon: ListChecks,
        },
        { label: breadcrumbLabel },
      ]}
    >
      {taskQuery.isLoading ? (
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23] text-xs text-zinc-600 dark:text-zinc-400 text-center">
          Đang tải task…
        </div>
      ) : taskQuery.error || !task ? (
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23] text-xs text-red-600 dark:text-red-400 text-center">
          {(taskQuery.error as Error)?.message ?? "Không tải được task."}
        </div>
      ) : (
        <div className="space-y-4">
          <TaskDetail task={task} projectId={projectId} canManage={isOwner} />
          <TaskComments taskId={task.id} />
        </div>
      )}
    </Layout>
  )
}
