"use client"

import { Folder, FolderKanban } from "lucide-react"
import Layout from "@/components/kokonutui/layout"
import ProjectList from "@/components/kokonutui/project-list"
import { useI18n } from "@/lib/i18n/context"

export default function ProjectsPage() {
  const { t } = useI18n()
  return (
    <Layout
      breadcrumbs={[
        { label: t("breadcrumbs.dashboard"), href: "/dashboard", icon: FolderKanban },
        { label: t("nav.projects"), icon: Folder },
      ]}
    >
      <ProjectList />
    </Layout>
  )
}
