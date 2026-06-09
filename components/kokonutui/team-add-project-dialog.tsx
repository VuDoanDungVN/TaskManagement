"use client"

import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"
import { FolderKanban, ImageIcon, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useProjects } from "@/lib/projects/store"
import { useAssignProject } from "@/lib/teams/store"
import { useI18n } from "@/lib/i18n/context"

interface TeamAddProjectDialogProps {
  open: boolean
  teamId: string
  onClose: () => void
}

export default function TeamAddProjectDialog({
  open,
  teamId,
  onClose,
}: TeamAddProjectDialogProps) {
  const { t } = useI18n()
  const { data: projects = [], isLoading } = useProjects()
  const assignMutation = useAssignProject(teamId)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Chỉ hiện project chưa thuộc nhóm này
  const available = useMemo(
    () => projects.filter((p) => p.teamId !== teamId),
    [projects, teamId],
  )

  async function handleAdd(projectId: string) {
    setPendingId(projectId)
    setError(null)
    try {
      await assignMutation.mutateAsync(projectId)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("teamDetail.addProjectError"))
    } finally {
      setPendingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={cn(
          "max-w-lg",
          "bg-white dark:bg-[#0F0F12]",
          "border border-gray-200 dark:border-[#1F1F23]",
          "text-zinc-900 dark:text-zinc-100",
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100">
            {t("teamDetail.addProjectTitle")}
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            {t("teamDetail.addProjectDesc")}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="p-6 text-center">
            <Loader2 className="w-5 h-5 mx-auto animate-spin text-zinc-400" />
          </div>
        ) : available.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-600 dark:text-zinc-400">
            {t("teamDetail.addProjectEmpty")}
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto -mx-1 px-1">
            {available.map((p) => {
              const busy = pendingId === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleAdd(p.id)}
                  disabled={!!pendingId}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left",
                    "border border-zinc-100 dark:border-zinc-800",
                    "hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
                    "transition-colors disabled:opacity-50",
                  )}
                >
                  <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    {p.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-zinc-400" />
                      {p.name}
                    </div>
                    {p.teamName && (
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 truncate">
                        {p.teamName}
                      </div>
                    )}
                  </div>
                  {busy && <Loader2 className="w-4 h-4 animate-spin text-zinc-400 shrink-0" />}
                </button>
              )
            })}
          </div>
        )}

        {error && (
          <p className="text-[11px] text-red-600 dark:text-red-400 px-1">{error}</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
