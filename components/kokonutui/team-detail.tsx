"use client"

import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FolderKanban,
  Globe,
  ImageIcon,
  Lock,
  LogOut,
  Mail,
  Plus,
  UsersRound,
  X,
} from "lucide-react"
import {
  useCancelInvite,
  useInviteMembers,
  useRemoveMember,
  useSetMemberRole,
  useTeam,
  useTeamInvites,
  useTeamMembers,
  useTeamProjects,
  useUnassignProject,
} from "@/lib/teams/store"
import type { TeamRole } from "@/lib/api/teams"
import { useAuth } from "@/lib/auth/context"
import { useI18n } from "@/lib/i18n/context"
import TeamAddProjectDialog from "./team-add-project-dialog"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface TeamDetailProps {
  teamId: string
}

export default function TeamDetail({ teamId }: TeamDetailProps) {
  const { t } = useI18n()
  const router = useRouter()
  const { user } = useAuth()
  const currentUid = user?.uid ?? null

  const { data: team, isLoading, error } = useTeam(teamId)
  const { data: members = [] } = useTeamMembers(teamId)

  const canManage = team?.myRole === "owner" || team?.myRole === "admin"
  const isOwner = team?.myRole === "owner"

  const { data: invites = [] } = useTeamInvites(canManage ? teamId : null)

  const { data: teamProjects = [] } = useTeamProjects(teamId)

  const inviteMutation = useInviteMembers(teamId)
  const cancelMutation = useCancelInvite(teamId)
  const setRoleMutation = useSetMemberRole(teamId)
  const removeMutation = useRemoveMember(teamId)
  const unassignProjectMutation = useUnassignProject(teamId)

  const [emails, setEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState("")
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [addProjectOpen, setAddProjectOpen] = useState(false)

  function roleLabel(role: TeamRole): string {
    switch (role) {
      case "owner":
        return t("teamDetail.roleOwner")
      case "admin":
        return t("teamDetail.roleAdmin")
      default:
        return t("teamDetail.roleMember")
    }
  }

  function commitEmail(): boolean {
    const value = emailInput.trim().toLowerCase()
    if (!value) return true
    if (!EMAIL_RE.test(value)) {
      setInviteError(t("teamDetail.inviteInvalid"))
      return false
    }
    if (!emails.includes(value)) setEmails((prev) => [...prev, value])
    setEmailInput("")
    setInviteError(null)
    return true
  }

  function handleEmailKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      commitEmail()
    } else if (e.key === "Backspace" && !emailInput && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1))
    }
  }

  async function handleSendInvites(e: React.FormEvent) {
    e.preventDefault()
    const pending = emailInput.trim().toLowerCase()
    let finalEmails = emails
    if (pending) {
      if (!EMAIL_RE.test(pending)) {
        setInviteError(t("teamDetail.inviteInvalid"))
        return
      }
      finalEmails = emails.includes(pending) ? emails : [...emails, pending]
    }
    if (finalEmails.length === 0) return
    setInviteError(null)
    try {
      await inviteMutation.mutateAsync({ emails: finalEmails })
      setEmails([])
      setEmailInput("")
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : t("teamDetail.inviteError"))
    }
  }

  async function handleRemove(userId: string) {
    if (!window.confirm(t("teamDetail.removeConfirm"))) return
    await removeMutation.mutateAsync(userId)
  }

  async function handleLeave() {
    if (!currentUid) return
    if (!window.confirm(t("teamDetail.leaveConfirm"))) return
    await removeMutation.mutateAsync(currentUid)
    router.push("/dashboard/teams")
  }

  async function handleRemoveProject(projectId: string) {
    if (!window.confirm(t("teamDetail.removeProjectConfirm"))) return
    await unassignProjectMutation.mutateAsync(projectId)
  }

  const sortedMembers = useMemo(() => members, [members])

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-zinc-600 dark:text-zinc-400">
        {t("teamDetail.loading")}
      </div>
    )
  }
  if (error) {
    return (
      <div className="p-8 text-center text-xs text-red-600 dark:text-red-400">
        {t("teamDetail.error", { message: (error as Error).message })}
      </div>
    )
  }
  if (!team) {
    return (
      <div className="p-8 text-center text-xs text-zinc-600 dark:text-zinc-400">
        {t("teamDetail.notFound")}
      </div>
    )
  }

  const isPublic = team.visibility === "public"

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 shrink-0 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
            {team.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={team.avatarUrl} alt={team.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-7 h-7 text-zinc-400 dark:text-zinc-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {team.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
                {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {isPublic ? t("teamDetail.visibilityPublic") : t("teamDetail.visibilityPrivate")}
              </span>
            </div>
            {team.description && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{team.description}</p>
            )}
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
              <UsersRound className="w-3.5 h-3.5" />
              {t("teamDetail.membersCount", { count: team.memberCount })}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canManage && (
              <button
                type="button"
                onClick={() => setAddProjectOpen(true)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
                  "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900",
                  "hover:bg-zinc-800 dark:hover:bg-zinc-200",
                  "transition-colors",
                )}
              >
                <Plus className="w-3.5 h-3.5" />
                {t("teamDetail.addProject")}
              </button>
            )}
            {!isOwner && (
              <button
                type="button"
                onClick={handleLeave}
                disabled={removeMutation.isPending}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
                  "text-red-600 dark:text-red-400",
                  "hover:bg-red-50 dark:hover:bg-red-900/20",
                  "transition-colors disabled:opacity-50",
                )}
              >
                <LogOut className="w-3.5 h-3.5" />
                {t("teamDetail.leaveTeam")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Projects của nhóm */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-3">
          <FolderKanban className="w-4 h-4" />
          {t("teamDetail.projectsTitle")} · {teamProjects.length}
        </h2>
        {teamProjects.length === 0 ? (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
            {t("teamDetail.projectsEmpty")}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {teamProjects.map((p) => (
              <div
                key={p.id}
                className="group flex items-center gap-3 px-3 py-2 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
              >
                <Link
                  href={`/dashboard/${p.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="w-9 h-9 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    {p.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {p.name}
                  </span>
                </Link>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(p.id)}
                    disabled={unassignProjectMutation.isPending}
                    className="text-[11px] text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0 disabled:opacity-50"
                  >
                    {t("teamDetail.removeProject")}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite section (owner/admin) */}
      {canManage && (
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4" />
            {t("teamDetail.inviteTitle")}
          </h2>

          <form onSubmit={handleSendInvites} className="space-y-2">
            <div
              className={cn(
                "w-full px-3 py-1.5 rounded-lg flex flex-wrap items-center gap-1.5 min-h-[40px]",
                "bg-white dark:bg-[#0F0F12] border border-zinc-200 dark:border-zinc-700",
                "focus-within:ring-2 focus-within:ring-zinc-500 dark:focus-within:ring-zinc-400",
                inviteError && "border-red-400 dark:border-red-500/70",
              )}
            >
              {emails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px] text-zinc-800 dark:text-zinc-200"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => setEmails((prev) => prev.filter((e) => e !== email))}
                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    aria-label="remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value)
                  if (inviteError) setInviteError(null)
                }}
                onKeyDown={handleEmailKeyDown}
                onBlur={commitEmail}
                placeholder={emails.length === 0 ? t("teamDetail.invitePlaceholder") : ""}
                className="flex-1 min-w-[160px] bg-transparent outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              {inviteError ? (
                <p className="text-[11px] text-red-600 dark:text-red-400">{inviteError}</p>
              ) : (
                <p className="text-[10px] text-zinc-500 dark:text-zinc-500">
                  {t("teamDetail.inviteHint")}
                </p>
              )}
              <button
                type="submit"
                disabled={inviteMutation.isPending || (emails.length === 0 && !emailInput.trim())}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium shrink-0",
                  "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900",
                  "hover:bg-zinc-800 dark:hover:bg-zinc-200",
                  "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {inviteMutation.isPending
                  ? t("teamDetail.inviteSending")
                  : t("teamDetail.inviteSubmit")}
              </button>
            </div>
          </form>

          {/* Pending invites */}
          <div className="mt-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              {t("teamDetail.pendingTitle")}
            </h3>
            {invites.length === 0 ? (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                {t("teamDetail.pendingEmpty")}
              </p>
            ) : (
              <div className="space-y-1.5">
                {invites.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="text-xs text-zinc-800 dark:text-zinc-200 truncate">
                        {inv.email}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-[10px] text-amber-700 dark:text-amber-400">
                        {t("teamDetail.statusPending")}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => cancelMutation.mutate(inv.id)}
                      className="text-[11px] text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0"
                    >
                      {t("teamDetail.cancelInvite")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-3">
          <UsersRound className="w-4 h-4" />
          {t("teamDetail.membersTitle")} · {sortedMembers.length}
        </h2>
        <div className="space-y-1.5">
          {sortedMembers.map((m) => {
            const isSelf = m.userId === currentUid
            const isMemberOwner = m.role === "owner"
            return (
              <div
                key={m.userId}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    {m.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {(m.displayName || m.email || "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {m.displayName || m.email || m.userId}
                      </span>
                      {isSelf && (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[9px] text-zinc-500 dark:text-zinc-400">
                          {t("teamDetail.you")}
                        </span>
                      )}
                    </div>
                    {m.email && (
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate block">
                        {m.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-medium",
                      isMemberOwner
                        ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
                    )}
                  >
                    {roleLabel(m.role)}
                  </span>

                  {/* Owner: đổi vai trò cho thành viên không phải owner */}
                  {isOwner && !isMemberOwner && (
                    <button
                      type="button"
                      onClick={() =>
                        setRoleMutation.mutate({
                          userId: m.userId,
                          role: m.role === "admin" ? "member" : "admin",
                        })
                      }
                      disabled={setRoleMutation.isPending}
                      className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-50"
                    >
                      {m.role === "admin" ? t("teamDetail.makeMember") : t("teamDetail.makeAdmin")}
                    </button>
                  )}

                  {/* Owner/admin: xoá thành viên (không phải owner, không phải chính mình) */}
                  {canManage && !isMemberOwner && !isSelf && (
                    <button
                      type="button"
                      onClick={() => handleRemove(m.userId)}
                      disabled={removeMutation.isPending}
                      className="text-[11px] text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {t("teamDetail.removeMember")}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <TeamAddProjectDialog
        open={addProjectOpen}
        teamId={teamId}
        onClose={() => setAddProjectOpen(false)}
      />
    </div>
  )
}
