"use client"

import { useParams } from "next/navigation"
import { FolderKanban, ListChecks } from "lucide-react"
import Layout from "@/components/kokonutui/layout"
import TaskManager from "@/components/kokonutui/task-manager"
import { useProject } from "@/lib/projects/store"
import { useI18n } from "@/lib/i18n/context"

export default function ProjectTasksPage() {
  const params = useParams<{ projectId: string }>()
  const projectId = params.projectId
  const { data: project } = useProject(projectId)
  const { t } = useI18n()

  return (
    <Layout
      breadcrumbs={[
        { label: t("breadcrumbs.dashboard"), href: "/dashboard", icon: FolderKanban },
        { label: project?.name ?? t("breadcrumbs.projectFallback"), icon: ListChecks },
      ]}
    >
      <TaskManager projectId={projectId} />
    </Layout>
  )
}
