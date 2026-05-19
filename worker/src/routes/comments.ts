import { Hono, type Context } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppEnv, Bindings } from "../types"
import { requireAuth } from "../auth-middleware"
import { buildFileUrl } from "../utils"

export interface CommentRow {
  id: string
  task_id: string
  author_id: string
  body: string
  parent_id: string | null
  reply_to_id: string | null
  created_at: number
  updated_at: number
  author_email: string | null
  author_display_name: string | null
  author_avatar_key: string | null
  reply_to_author_id: string | null
  reply_to_author_email: string | null
  reply_to_author_display_name: string | null
  attachments_json: string | null
}

interface AttachmentJsonRow {
  id: string
  fileKey: string
  fileName: string
  fileSize: number
  mimeType: string
  createdAt: number
}

interface ReplyToInfo {
  id: string
  authorId: string | null
  authorDisplayName: string | null
  authorEmail: string | null
}

function parseAttachments(
  env: Bindings,
  request: Request,
  raw: string | null,
) {
  if (!raw) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  return (parsed as AttachmentJsonRow[])
    .filter((a) => a && typeof a.id === "string")
    .map((a) => ({
      id: a.id,
      fileName: a.fileName,
      fileSize: a.fileSize,
      mimeType: a.mimeType,
      createdAt: a.createdAt,
      fileKey: a.fileKey,
      fileUrl: buildFileUrl(env, request, a.fileKey),
    }))
}

export function serializeComment(
  row: CommentRow,
  avatarUrl: string | null,
  env: Bindings,
  request: Request,
) {
  const replyTo: ReplyToInfo | null = row.reply_to_id
    ? {
        id: row.reply_to_id,
        authorId: row.reply_to_author_id,
        authorDisplayName: row.reply_to_author_display_name,
        authorEmail: row.reply_to_author_email,
      }
    : null
  return {
    id: row.id,
    taskId: row.task_id,
    body: row.body,
    parentId: row.parent_id,
    replyTo,
    attachments: parseAttachments(env, request, row.attachments_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: {
      id: row.author_id,
      email: row.author_email,
      displayName: row.author_display_name,
      avatarUrl,
    },
  }
}

export const COMMENT_SELECT = `SELECT c.*,
  u.email        AS author_email,
  u.display_name AS author_display_name,
  u.avatar_key   AS author_avatar_key,
  ru.id          AS reply_to_author_id,
  ru.email       AS reply_to_author_email,
  ru.display_name AS reply_to_author_display_name,
  (SELECT json_group_array(json_object(
     'id', a.id,
     'fileKey', a.file_key,
     'fileName', a.file_name,
     'fileSize', a.file_size,
     'mimeType', a.mime_type,
     'createdAt', a.created_at
   )) FROM comment_attachments a WHERE a.comment_id = c.id) AS attachments_json
FROM task_comments c
LEFT JOIN users u ON u.id = c.author_id
LEFT JOIN task_comments rc ON rc.id = c.reply_to_id
LEFT JOIN users ru ON ru.id = rc.author_id`

/** Xoá toàn bộ R2 object liên quan tới comment (gồm cả replies cascade nếu là root). */
export async function deleteCommentR2Files(
  c: Context<AppEnv>,
  commentId: string,
): Promise<void> {
  // Tất cả attachment thuộc comment này + thuộc reply có parent_id = commentId
  const rs = await c.env.DB.prepare(
    `SELECT a.file_key
     FROM comment_attachments a
     WHERE a.comment_id = ?
        OR a.comment_id IN (SELECT id FROM task_comments WHERE parent_id = ?)`,
  )
    .bind(commentId, commentId)
    .all<{ file_key: string }>()
  const keys = (rs.results ?? []).map((r) => r.file_key)
  await Promise.all(keys.map((k) => c.env.FILES.delete(k).catch(() => {})))
}

function validateBody(v: unknown): string {
  if (typeof v !== "string") {
    throw new HTTPException(400, { message: "Nội dung bình luận phải là chuỗi." })
  }
  const text = v.trim()
  if (!text) {
    throw new HTTPException(400, { message: "Nội dung bình luận không được để trống." })
  }
  if (text.length > 5000) {
    throw new HTTPException(400, { message: "Bình luận tối đa 5000 ký tự." })
  }
  return text
}

const comments = new Hono<AppEnv>()
comments.use("*", requireAuth())

// PUT /comments/:id — chỉ author mới được sửa
comments.put("/:id", async (c) => {
  const user = c.get("user")
  const id = c.req.param("id")
  const existing = await c.env.DB.prepare(
    "SELECT author_id FROM task_comments WHERE id = ?",
  )
    .bind(id)
    .first<{ author_id: string }>()
  if (!existing) throw new HTTPException(404, { message: "Không tìm thấy bình luận." })
  if (existing.author_id !== user.uid) {
    throw new HTTPException(403, { message: "Bạn không có quyền sửa bình luận này." })
  }

  let body: { body?: unknown }
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }
  const text = validateBody(body.body)

  const now = Date.now()
  await c.env.DB.prepare(
    "UPDATE task_comments SET body = ?, updated_at = ? WHERE id = ?",
  )
    .bind(text, now, id)
    .run()

  const row = await c.env.DB.prepare(`${COMMENT_SELECT} WHERE c.id = ?`)
    .bind(id)
    .first<CommentRow>()
  if (!row) throw new HTTPException(500, { message: "Update bình luận thất bại." })
  return c.json(
    serializeComment(
      row,
      buildFileUrl(c.env, c.req.raw, row.author_avatar_key),
      c.env,
      c.req.raw,
    ),
  )
})

// DELETE /comments/:id — chỉ author
comments.delete("/:id", async (c) => {
  const user = c.get("user")
  const id = c.req.param("id")
  const existing = await c.env.DB.prepare(
    "SELECT author_id FROM task_comments WHERE id = ?",
  )
    .bind(id)
    .first<{ author_id: string }>()
  if (!existing) throw new HTTPException(404, { message: "Không tìm thấy bình luận." })
  if (existing.author_id !== user.uid) {
    throw new HTTPException(403, { message: "Bạn không có quyền xoá bình luận này." })
  }
  // R2 không có cascade — xoá object trước, sau đó DB sẽ CASCADE rows attachment.
  await deleteCommentR2Files(c, id)
  await c.env.DB.prepare("DELETE FROM task_comments WHERE id = ?").bind(id).run()
  return c.json({ ok: true })
})

export { validateBody as validateCommentBody }
export default comments
