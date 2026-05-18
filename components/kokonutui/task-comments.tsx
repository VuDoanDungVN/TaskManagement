"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { MessageSquare, Pencil, Send, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/auth/context"
import {
  useCreateComment,
  useDeleteComment,
  useTaskComments,
  useUpdateComment,
  type TaskComment,
} from "@/lib/comments/store"
import UserAvatar from "./user-avatar"

interface TaskCommentsProps {
  taskId: string
}

function formatTimestamp(ms: number) {
  const d = new Date(ms)
  if (Number.isNaN(d.getTime())) return ""
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, "0")
  const mi = String(d.getMinutes()).padStart(2, "0")
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`
}

function authorDisplayName(c: TaskComment) {
  return (
    c.author.displayName?.trim() ||
    c.author.email?.split("@")[0] ||
    "Người dùng"
  )
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
  const { user } = useAuth()
  const commentsQuery = useTaskComments(taskId)
  const createMutation = useCreateComment(taskId)
  const updateMutation = useUpdateComment(taskId)
  const deleteMutation = useDeleteComment(taskId)

  const [draft, setDraft] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const items = commentsQuery.data ?? []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const text = draft.trim()
    if (!text) return
    try {
      await createMutation.mutateAsync(text)
      setDraft("")
    } catch (err) {
      setError((err as Error).message)
    }
  }

  function startEdit(c: TaskComment) {
    setEditingId(c.id)
    setEditingText(c.body)
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingText("")
  }

  async function saveEdit(id: string) {
    const text = editingText.trim()
    if (!text) return
    try {
      await updateMutation.mutateAsync({ id, body: text })
      cancelEdit()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleDelete(id: string) {
    if (typeof window !== "undefined" && !window.confirm("Xoá bình luận này?"))
      return
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23]">
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Bình luận
        </h2>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          ({items.length})
        </span>
      </div>

      <div className="p-6 space-y-4">
        {commentsQuery.isLoading ? (
          <div className="text-xs text-zinc-600 dark:text-zinc-400 text-center py-4">
            Đang tải bình luận…
          </div>
        ) : commentsQuery.error ? (
          <div className="text-xs text-red-600 dark:text-red-400 text-center py-4">
            {(commentsQuery.error as Error).message}
          </div>
        ) : items.length === 0 ? (
          <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-4 italic">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((c) => {
              const isMine = !!user && user.uid === c.author.id
              const name = authorDisplayName(c)
              const edited = c.updatedAt > c.createdAt
              const isEditing = editingId === c.id
              return (
                <li
                  key={c.id}
                  className="flex gap-3 items-start"
                >
                  <UserAvatar
                    name={name}
                    src={c.author.avatarUrl ?? undefined}
                    size={36}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {name}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                        · {formatTimestamp(c.createdAt)}
                        {edited && " (đã sửa)"}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="mt-1.5 space-y-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          rows={3}
                          className={cn(
                            "w-full px-3 py-2 rounded-lg text-sm",
                            "bg-white dark:bg-[#0F0F12]",
                            "border border-zinc-200 dark:border-zinc-700",
                            "text-zinc-900 dark:text-zinc-100",
                            "focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400",
                          )}
                        />
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => saveEdit(c.id)}
                            disabled={
                              updateMutation.isPending || !editingText.trim()
                            }
                            className={cn(
                              "px-2.5 py-1 rounded-md text-xs font-medium",
                              "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900",
                              "hover:bg-zinc-800 dark:hover:bg-zinc-200",
                              "disabled:opacity-50",
                            )}
                          >
                            {updateMutation.isPending ? "Đang lưu…" : "Lưu"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-xs font-medium",
                              "text-zinc-700 dark:text-zinc-300",
                              "border border-zinc-200 dark:border-zinc-800",
                              "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                            )}
                          >
                            Huỷ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-0.5 text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words">
                        {c.body}
                      </p>
                    )}

                    {isMine && !isEditing && (
                      <div className="mt-1 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md",
                            "text-[11px] text-zinc-600 dark:text-zinc-400",
                            "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                          )}
                        >
                          <Pencil className="w-3 h-3" />
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          disabled={deleteMutation.isPending}
                          className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md",
                            "text-[11px] text-red-600 dark:text-red-400",
                            "hover:bg-red-50 dark:hover:bg-red-900/20",
                            "disabled:opacity-50",
                          )}
                        >
                          <Trash2 className="w-3 h-3" />
                          Xoá
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <form
          onSubmit={handleSubmit}
          className="pt-2 border-t border-zinc-100 dark:border-zinc-800"
        >
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 mt-3">
            Bình luận của bạn
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Nhập bình luận…"
            className={cn(
              "w-full px-3 py-2 rounded-lg text-sm",
              "bg-white dark:bg-[#0F0F12]",
              "border border-zinc-200 dark:border-zinc-700",
              "text-zinc-900 dark:text-zinc-100",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
              "focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400",
            )}
          />
          {error && (
            <div className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="mt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending || !draft.trim()}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                "text-xs font-medium",
                "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900",
                "hover:bg-zinc-800 dark:hover:bg-zinc-200",
                "disabled:opacity-50",
              )}
            >
              <Send className="w-3.5 h-3.5" />
              {createMutation.isPending ? "Đang gửi…" : "Gửi bình luận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
