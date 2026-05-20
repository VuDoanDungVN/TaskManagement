"use client"

import { cn } from "@/lib/utils"
import { useMemo, useRef, useState } from "react"
import {
  CornerDownRight,
  Download,
  ExternalLink,
  FileText,
  MessageSquare,
  Paperclip,
  Pencil,
  Reply,
  Send,
  Trash2,
  X,
} from "lucide-react"
import { useAuth } from "@/lib/auth/context"
import {
  useCreateComment,
  useDeleteComment,
  useTaskComments,
  useUpdateComment,
  type TaskComment,
} from "@/lib/comments/store"
import type { ApiCommentAttachment } from "@/lib/api/comments"
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_PER_COMMENT,
  buildAttachmentDownloadUrl,
  checkAttachmentFile,
  formatBytes,
  isImageMime,
  isPdfMime,
} from "@/lib/comments/attachments"
import { API_URL } from "@/lib/api/client"
import { useI18n } from "@/lib/i18n/context"
import type { TranslationKey } from "@/lib/i18n/types"
import UserAvatar from "./user-avatar"
import ImageLightbox from "./image-lightbox"

type TFn = (key: TranslationKey, params?: Record<string, string | number>) => string

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

function authorDisplayName(c: TaskComment, t: TFn) {
  return (
    c.author.displayName?.trim() ||
    c.author.email?.split("@")[0] ||
    t("comments.userFallback")
  )
}

function replyToDisplayName(c: TaskComment, t: TFn) {
  if (!c.replyTo) return null
  return (
    c.replyTo.authorDisplayName?.trim() ||
    c.replyTo.authorEmail?.split("@")[0] ||
    t("comments.userFallback")
  )
}

interface Thread {
  root: TaskComment
  replies: TaskComment[]
}

function groupThreads(items: TaskComment[]): Thread[] {
  const sorted = [...items].sort((a, b) => a.createdAt - b.createdAt)
  const roots: TaskComment[] = []
  const repliesByParent = new Map<string, TaskComment[]>()
  for (const c of sorted) {
    if (c.parentId) {
      const list = repliesByParent.get(c.parentId) ?? []
      list.push(c)
      repliesByParent.set(c.parentId, list)
    } else {
      roots.push(c)
    }
  }
  return roots.map((root) => ({
    root,
    replies: repliesByParent.get(root.id) ?? [],
  }))
}

interface LightboxImage {
  src: string
  alt: string
}

function AttachmentsView({
  items,
  onOpenImage,
  t,
}: {
  items: ApiCommentAttachment[]
  onOpenImage: (img: LightboxImage) => void
  t: TFn
}) {
  if (items.length === 0) return null
  const images = items.filter((a) => isImageMime(a.mimeType))
  const others = items.filter((a) => !isImageMime(a.mimeType))
  return (
    <div className="mt-2 space-y-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() =>
                a.fileUrl && onOpenImage({ src: a.fileUrl, alt: a.fileName })
              }
              disabled={!a.fileUrl}
              className={cn(
                "block rounded-lg overflow-hidden",
                "border border-zinc-200 dark:border-zinc-700",
                "hover:opacity-90 transition-opacity",
                "focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400",
                "cursor-zoom-in disabled:cursor-not-allowed",
              )}
              title={`${a.fileName} (${formatBytes(a.fileSize)})`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.fileUrl ?? ""}
                alt={a.fileName}
                className="block max-h-40 max-w-[200px] object-cover bg-zinc-100 dark:bg-zinc-800"
              />
            </button>
          ))}
        </div>
      )}
      {others.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {others.map((a) => {
            const pdf = isPdfMime(a.mimeType)
            // PDF: mở tab mới và browser tự render inline (Content-Disposition mặc định)
            // Office: download qua worker (?download=1 → Content-Disposition: attachment)
            const href = pdf
              ? a.fileUrl ?? "#"
              : buildAttachmentDownloadUrl(API_URL, a.fileKey, a.fileName)
            return (
              <a
                key={a.id}
                href={href}
                target={pdf ? "_blank" : undefined}
                rel={pdf ? "noreferrer" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-2 rounded-lg",
                  "bg-zinc-50 dark:bg-zinc-900/50",
                  "border border-zinc-200 dark:border-zinc-700",
                  "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                  "transition-colors max-w-md",
                )}
                title={
                  pdf
                    ? t("comments.openPdfTitle")
                    : t("comments.downloadTitle", {
                        name: a.fileName,
                        size: formatBytes(a.fileSize),
                      })
                }
              >
                <FileText className="w-4 h-4 shrink-0 text-zinc-600 dark:text-zinc-300" />
                <span className="flex-1 min-w-0 text-xs text-zinc-800 dark:text-zinc-200 truncate">
                  {a.fileName}
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0 tabular-nums">
                  {formatBytes(a.fileSize)}
                </span>
                {pdf ? (
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 text-zinc-500 dark:text-zinc-400" />
                ) : (
                  <Download className="w-3.5 h-3.5 shrink-0 text-zinc-500 dark:text-zinc-400" />
                )}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface PendingPickerProps {
  files: File[]
  onChange: (files: File[]) => void
  onError: (msg: string | null) => void
  inputId: string
  t: TFn
}

function AttachmentPicker({ files, onChange, onError, inputId, t }: PendingPickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    e.target.value = "" // cho phép chọn lại cùng file
    if (picked.length === 0) return

    const merged = [...files]
    for (const f of picked) {
      if (merged.length >= ATTACHMENT_MAX_PER_COMMENT) {
        onError(t("comments.maxPerComment", { count: ATTACHMENT_MAX_PER_COMMENT }))
        break
      }
      const err = checkAttachmentFile(f)
      if (err) {
        onError(t(`attachments.error${err.code}` as TranslationKey, err.params))
        continue
      }
      // Tránh thêm trùng (cùng tên + size)
      if (merged.some((m) => m.name === f.name && m.size === f.size)) continue
      merged.push(f)
    }
    onError(null)
    onChange(merged)
  }

  function removeAt(i: number) {
    const next = files.slice()
    next.splice(i, 1)
    onChange(next)
  }

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept={ATTACHMENT_ACCEPT}
        onChange={handlePick}
        className="sr-only"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md",
          "text-[11px] font-medium",
          "text-zinc-700 dark:text-zinc-300",
          "border border-zinc-200 dark:border-zinc-800",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
        )}
      >
        <Paperclip className="w-3 h-3" />
        {t("comments.attach")}
      </button>
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${f.size}-${i}`}
              className={cn(
                "inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-md",
                "bg-zinc-100 dark:bg-zinc-800",
                "text-[11px] text-zinc-700 dark:text-zinc-300",
                "max-w-[260px]",
              )}
              title={`${f.name} (${formatBytes(f.size)})`}
            >
              <span className="truncate">{f.name}</span>
              <span className="text-zinc-500 dark:text-zinc-400 shrink-0 tabular-nums">
                {formatBytes(f.size)}
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 shrink-0"
                aria-label={t("comments.removeFile", { name: f.name })}
              >
                <X className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
  const { user } = useAuth()
  const { t } = useI18n()
  const commentsQuery = useTaskComments(taskId)
  const createMutation = useCreateComment(taskId)
  const updateMutation = useUpdateComment(taskId)
  const deleteMutation = useDeleteComment(taskId)

  const [draft, setDraft] = useState("")
  const [draftFiles, setDraftFiles] = useState<File[]>([])
  const [replyTarget, setReplyTarget] = useState<TaskComment | null>(null)
  const [replyDraft, setReplyDraft] = useState("")
  const [replyFiles, setReplyFiles] = useState<File[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [lightboxImage, setLightboxImage] = useState<LightboxImage | null>(null)

  const items = commentsQuery.data ?? []
  const threads = useMemo(() => groupThreads(items), [items])

  async function handleSubmitRoot(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const text = draft.trim()
    if (!text && draftFiles.length === 0) return
    try {
      await createMutation.mutateAsync({
        body: text || t("comments.attachOnlyFallback"),
        files: draftFiles,
      })
      setDraft("")
      setDraftFiles([])
    } catch (err) {
      setError((err as Error).message)
    }
  }

  function startReply(target: TaskComment) {
    setReplyTarget(target)
    setReplyDraft("")
    setReplyFiles([])
    setError(null)
  }

  function cancelReply() {
    setReplyTarget(null)
    setReplyDraft("")
    setReplyFiles([])
  }

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!replyTarget) return
    const text = replyDraft.trim()
    if (!text && replyFiles.length === 0) return
    try {
      await createMutation.mutateAsync({
        body: text || t("comments.attachOnlyFallback"),
        parentId: replyTarget.id,
        files: replyFiles,
      })
      cancelReply()
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
    if (typeof window !== "undefined" && !window.confirm(t("comments.deleteConfirm")))
      return
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  function renderComment(c: TaskComment, opts: { isReply: boolean }) {
    const isMine = !!user && user.uid === c.author.id
    const name = authorDisplayName(c, t)
    const edited = c.updatedAt > c.createdAt
    const isEditing = editingId === c.id
    const replyToName = replyToDisplayName(c, t)

    return (
      <div className="flex gap-3 items-start">
        <UserAvatar
          name={name}
          src={c.author.avatarUrl ?? undefined}
          size={opts.isReply ? 28 : 36}
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {name}
            </span>
            {replyToName && (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                <CornerDownRight className="w-3 h-3" />
                @{replyToName}
              </span>
            )}
            <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
              · {formatTimestamp(c.createdAt)}
              {edited && t("comments.edited")}
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
                  disabled={updateMutation.isPending || !editingText.trim()}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium",
                    "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900",
                    "hover:bg-zinc-800 dark:hover:bg-zinc-200",
                    "disabled:opacity-50",
                  )}
                >
                  {updateMutation.isPending ? t("common.saving") : t("comments.save")}
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
                  {t("comments.cancel")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-0.5 text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words">
                {c.body}
              </p>
              <AttachmentsView
                items={c.attachments}
                onOpenImage={setLightboxImage}
                t={t}
              />
            </>
          )}

          {!isEditing && (
            <div className="mt-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => startReply(c)}
                className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md",
                  "text-[11px] text-zinc-600 dark:text-zinc-400",
                  "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                )}
              >
                <Reply className="w-3 h-3" />
                {t("comments.reply")}
              </button>
              {isMine && (
                <>
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
                    {t("comments.edit")}
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
                    {t("comments.delete")}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderReplyForm(target: TaskComment) {
    const targetName = authorDisplayName(target, t)
    return (
      <form
        onSubmit={handleSubmitReply}
        className={cn(
          "mt-2 p-3 rounded-lg",
          "bg-zinc-50 dark:bg-zinc-900/40",
          "border border-zinc-200 dark:border-zinc-800",
        )}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-400">
            <CornerDownRight className="w-3 h-3" />
            {t("comments.replyingTo", { name: targetName })}
          </span>
          <button
            type="button"
            onClick={cancelReply}
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md",
              "text-[11px] text-zinc-600 dark:text-zinc-400",
              "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
            )}
          >
            <X className="w-3 h-3" />
            {t("comments.cancel")}
          </button>
        </div>
        <textarea
          autoFocus
          value={replyDraft}
          onChange={(e) => setReplyDraft(e.target.value)}
          rows={2}
          placeholder={t("comments.replyPlaceholder", { name: targetName })}
          className={cn(
            "w-full px-3 py-2 rounded-lg text-sm",
            "bg-white dark:bg-[#0F0F12]",
            "border border-zinc-200 dark:border-zinc-700",
            "text-zinc-900 dark:text-zinc-100",
            "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
            "focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400",
          )}
        />
        <div className="mt-2">
          <AttachmentPicker
            files={replyFiles}
            onChange={setReplyFiles}
            onError={setError}
            inputId={`reply-files-${target.id}`}
            t={t}
          />
        </div>
        <div className="mt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={
              createMutation.isPending ||
              (!replyDraft.trim() && replyFiles.length === 0)
            }
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
              "text-xs font-medium",
              "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900",
              "hover:bg-zinc-800 dark:hover:bg-zinc-200",
              "disabled:opacity-50",
            )}
          >
            <Send className="w-3.5 h-3.5" />
            {createMutation.isPending ? t("comments.sending") : t("comments.sendReply")}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23]">
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t("comments.title")}
        </h2>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          ({items.length})
        </span>
      </div>

      <div className="p-6 space-y-4">
        <form
          onSubmit={handleSubmitRoot}
          className="pb-4 border-b border-zinc-100 dark:border-zinc-800"
        >
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            {t("comments.yourComment")}
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder={t("comments.placeholder")}
            className={cn(
              "w-full px-3 py-2 rounded-lg text-sm",
              "bg-white dark:bg-[#0F0F12]",
              "border border-zinc-200 dark:border-zinc-700",
              "text-zinc-900 dark:text-zinc-100",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
              "focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400",
            )}
          />
          <div className="mt-2">
            <AttachmentPicker
              files={draftFiles}
              onChange={setDraftFiles}
              onError={setError}
              inputId="root-files"
              t={t}
            />
          </div>
          {error && (
            <div className="mt-1.5 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="mt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={
                createMutation.isPending ||
                (!draft.trim() && draftFiles.length === 0)
              }
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                "text-xs font-medium",
                "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900",
                "hover:bg-zinc-800 dark:hover:bg-zinc-200",
                "disabled:opacity-50",
              )}
            >
              <Send className="w-3.5 h-3.5" />
              {createMutation.isPending ? t("comments.sending") : t("comments.send")}
            </button>
          </div>
        </form>

        {commentsQuery.isLoading ? (
          <div className="text-xs text-zinc-600 dark:text-zinc-400 text-center py-4">
            {t("comments.loading")}
          </div>
        ) : commentsQuery.error ? (
          <div className="text-xs text-red-600 dark:text-red-400 text-center py-4">
            {(commentsQuery.error as Error).message}
          </div>
        ) : threads.length === 0 ? (
          <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-4 italic">
            {t("comments.empty")}
          </div>
        ) : (
          <ul className="space-y-5">
            {threads.map(({ root, replies }) => (
              <li key={root.id}>
                {renderComment(root, { isReply: false })}
                {replyTarget?.id === root.id && renderReplyForm(root)}
                {(replies.length > 0 || replyTarget?.parentId === root.id) && (
                  <ul
                    className={cn(
                      "mt-3 ml-5 pl-4 space-y-4",
                      "border-l border-zinc-200 dark:border-zinc-800",
                    )}
                  >
                    {replies.map((r) => (
                      <li key={r.id}>
                        {renderComment(r, { isReply: true })}
                        {replyTarget?.id === r.id && renderReplyForm(r)}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ImageLightbox
        open={!!lightboxImage}
        src={lightboxImage?.src ?? ""}
        alt={lightboxImage?.alt ?? ""}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  )
}
