"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2, Mail, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { teamsApi, type ApiTeam } from "@/lib/api/teams"
import { useAuth } from "@/lib/auth/context"
import { useI18n } from "@/lib/i18n/context"

type Status = "idle" | "accepting" | "success" | "error"

function InviteAccept() {
  const { t } = useI18n()
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token") ?? ""
  const { user, loading: authLoading } = useAuth()

  const [status, setStatus] = useState<Status>("idle")
  const [team, setTeam] = useState<ApiTeam | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const returnTo = `/invite?token=${encodeURIComponent(token)}`

  async function handleAccept() {
    setStatus("accepting")
    setErrorMsg(null)
    try {
      const joined = await teamsApi.acceptInvite(token)
      setTeam(joined)
      setStatus("success")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("invitePage.errorTitle"))
      setStatus("error")
    }
  }

  const cardClass = cn(
    "w-full max-w-md mx-auto",
    "bg-white dark:bg-[#0F0F12]",
    "border border-gray-200 dark:border-[#1F1F23]",
    "rounded-2xl shadow-sm p-8 text-center",
  )
  const primaryBtn = cn(
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium",
    "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900",
    "hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  )
  const secondaryBtn = cn(
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium",
    "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
    "hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors",
  )

  // Auth đang load
  if (authLoading) {
    return (
      <div className={cardClass}>
        <Loader2 className="w-6 h-6 mx-auto animate-spin text-zinc-400" />
      </div>
    )
  }

  // Thiếu token
  if (!token) {
    return (
      <div className={cardClass}>
        <XCircle className="w-10 h-10 mx-auto text-red-500" />
        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
          {t("invitePage.missingToken")}
        </p>
        <Link href="/dashboard/teams" className={cn(secondaryBtn, "mt-5")}>
          {t("invitePage.backToTeams")}
        </Link>
      </div>
    )
  }

  // Chưa đăng nhập
  if (!user) {
    return (
      <div className={cardClass}>
        <Mail className="w-10 h-10 mx-auto text-zinc-400" />
        <h1 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {t("invitePage.title")}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {t("invitePage.signInRequired")}
        </p>
        <Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`} className={cn(primaryBtn, "mt-5")}>
          {t("invitePage.signInButton")}
        </Link>
      </div>
    )
  }

  // Thành công
  if (status === "success") {
    return (
      <div className={cardClass}>
        <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
        <h1 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {t("invitePage.successTitle")}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {t("invitePage.successDesc")}
        </p>
        <button
          type="button"
          onClick={() => router.push(team ? `/dashboard/teams/${team.id}` : "/dashboard/teams")}
          className={cn(primaryBtn, "mt-5")}
        >
          {t("invitePage.goToTeam")}
        </button>
      </div>
    )
  }

  // Lỗi
  if (status === "error") {
    return (
      <div className={cardClass}>
        <XCircle className="w-10 h-10 mx-auto text-red-500" />
        <h1 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {t("invitePage.errorTitle")}
        </h1>
        {errorMsg && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
        )}
        <Link href="/dashboard/teams" className={cn(secondaryBtn, "mt-5")}>
          {t("invitePage.backToTeams")}
        </Link>
      </div>
    )
  }

  // Sẵn sàng chấp nhận
  return (
    <div className={cardClass}>
      <Mail className="w-10 h-10 mx-auto text-zinc-400" />
      <h1 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
        {t("invitePage.title")}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {t("invitePage.description")}
      </p>
      <button
        type="button"
        onClick={handleAccept}
        disabled={status === "accepting"}
        className={cn(primaryBtn, "mt-5")}
      >
        {status === "accepting" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("invitePage.accepting")}
          </>
        ) : (
          t("invitePage.accept")
        )}
      </button>
    </div>
  )
}

export default function InvitePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0a0a0c] px-4">
      <Suspense
        fallback={<Loader2 className="w-6 h-6 animate-spin text-zinc-400" />}
      >
        <InviteAccept />
      </Suspense>
    </div>
  )
}
