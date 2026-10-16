"use client"

import { FolderKanban, UsersRound } from "lucide-react"
import Layout from "@/components/kokonutui/layout"
import { AdminOnly } from "@/components/kokonutui/access-gate"
import TeamList from "@/components/kokonutui/team-list"
import { useI18n } from "@/lib/i18n/context"

export default function TeamsPage() {
  const { t } = useI18n()
  return (
    <Layout
      breadcrumbs={[
        { label: t("breadcrumbs.dashboard"), href: "/dashboard", icon: FolderKanban },
        { label: t("teamsList.title"), icon: UsersRound },
      ]}
    >
      <AdminOnly>
        <TeamList />
      </AdminOnly>
    </Layout>
  )
}
