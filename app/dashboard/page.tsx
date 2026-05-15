"use client"

import { FolderKanban } from "lucide-react"
import Layout from "@/components/kokonutui/layout"
import ProjectList from "@/components/kokonutui/project-list"

export default function DashboardPage() {
  return (
    <Layout breadcrumbs={[{ label: "Dashboard", icon: FolderKanban }]}>
      <ProjectList />
    </Layout>
  )
}
