"use client"

import { FolderKanban, Users2 } from "lucide-react"
import Layout from "@/components/kokonutui/layout"
import { AdminOnly } from "@/components/kokonutui/access-gate"
import MemberList from "@/components/kokonutui/member-list"
import { useI18n } from "@/lib/i18n/context"

export default function MembersPage() {
  const { t } = useI18n()
  return (
    <Layout
      breadcrumbs={[
        { label: t("breadcrumbs.dashboard"), href: "/dashboard", icon: FolderKanban },
        { label: t("membersList.title"), icon: Users2 },
      ]}
    >
      <AdminOnly>
        <MemberList />
      </AdminOnly>
    </Layout>
  )
}
