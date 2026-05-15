"use client"

import { useParams } from "next/navigation"
import { FolderKanban, ListChecks } from "lucide-react"
import Layout from "@/components/kokonutui/layout"
import TaskManager from "@/components/kokonutui/task-manager"
import { useProject } from "@/lib/projects/store"

export default function ProjectTasksPage() {
  const params = useParams<{ projectId: string }>()
  const projectId = params.projectId
  const { data: project } = useProject(projectId)

  return (
    <Layout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard", icon: FolderKanban },
        { label: project?.name ?? "Dự án", icon: ListChecks },
      ]}
    >
      <TaskManager projectId={projectId} />
    </Layout>
  )
}
