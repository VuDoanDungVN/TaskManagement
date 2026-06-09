"use client"

import { useParams } from "next/navigation"
import { FolderKanban, UsersRound } from "lucide-react"
import Layout from "@/components/kokonutui/layout"
import TeamDetail from "@/components/kokonutui/team-detail"
import { useTeam } from "@/lib/teams/store"
import { useI18n } from "@/lib/i18n/context"

export default function TeamDetailPage() {
  const params = useParams<{ teamId: string }>()
  const teamId = params?.teamId ?? ""
  const { t } = useI18n()
  const { data: team } = useTeam(teamId)

  return (
    <Layout
      breadcrumbs={[
        { label: t("breadcrumbs.dashboard"), href: "/dashboard", icon: FolderKanban },
        { label: t("teamsList.title"), href: "/dashboard/teams", icon: UsersRound },
        { label: team?.name ?? "…" },
      ]}
    >
      <TeamDetail teamId={teamId} />
    </Layout>
  )
}
