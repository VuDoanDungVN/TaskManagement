import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppEnv } from "../types"
import { requireAuth } from "../auth-middleware"
import { buildFileUrl } from "../utils"

export interface CommentRow {
  id: string
  task_id: string
  author_id: string
  body: string
  created_at: number
  updated_at: number
  author_email: string | null
  author_display_name: string | null
  author_avatar_key: string | null
}

export function serializeComment(row: CommentRow, avatarUrl: string | null) {
  return {
    id: row.id,
    taskId: row.task_id,
    body: row.body,
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
  u.avatar_key   AS author_avatar_key
FROM task_comments c
LEFT JOIN users u ON u.id = c.author_id`

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
  return c.json(serializeComment(row, buildFileUrl(c.env, c.req.raw, row.author_avatar_key)))
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
  await c.env.DB.prepare("DELETE FROM task_comments WHERE id = ?").bind(id).run()
  return c.json({ ok: true })
})

export { validateBody as validateCommentBody }
export default comments
