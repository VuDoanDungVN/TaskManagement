import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppEnv } from "../types"
import { requireAuth } from "../auth-middleware"
import { buildFileUrl } from "../utils"

interface UserRow {
  id: string
  email: string
  display_name: string | null
  avatar_key: string | null
  email_verified: number
  created_at: number
  updated_at: number
}

function serializeUser(row: UserRow, fileUrl: string | null) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarKey: row.avatar_key,
    avatarUrl: fileUrl,
    emailVerified: row.email_verified === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const users = new Hono<AppEnv>()

users.use("*", requireAuth())

users.get("/me", async (c) => {
  const user = c.get("user")
  const row = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?",
  )
    .bind(user.uid)
    .first<UserRow>()

  if (!row) {
    throw new HTTPException(404, { message: "Không tìm thấy user trong DB." })
  }
  const avatarUrl = buildFileUrl(c.env, c.req.raw, row.avatar_key)
  return c.json(serializeUser(row, avatarUrl))
})

users.put("/me", async (c) => {
  const user = c.get("user")
  let body: { displayName?: string | null; avatarKey?: string | null }
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }

  const now = Date.now()
  const sets: string[] = []
  const params: unknown[] = []

  if (body.displayName !== undefined) {
    const v = body.displayName
    if (v !== null && (typeof v !== "string" || v.trim().length === 0 || v.length > 200)) {
      throw new HTTPException(400, { message: "displayName không hợp lệ." })
    }
    sets.push("display_name = ?")
    params.push(v === null ? null : v.trim())
  }
  if (body.avatarKey !== undefined) {
    const v = body.avatarKey
    if (v !== null && (typeof v !== "string" || v.length > 500)) {
      throw new HTTPException(400, { message: "avatarKey không hợp lệ." })
    }
    sets.push("avatar_key = ?")
    params.push(v)
  }
  if (sets.length === 0) {
    throw new HTTPException(400, { message: "Không có trường nào để cập nhật." })
  }

  sets.push("updated_at = ?")
  params.push(now)
  params.push(user.uid)

  await c.env.DB.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...params)
    .run()

  const row = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(user.uid)
    .first<UserRow>()
  if (!row) {
    throw new HTTPException(500, { message: "Update thành công nhưng không đọc lại được user." })
  }
  return c.json(serializeUser(row, buildFileUrl(c.env, c.req.raw, row.avatar_key)))
})

export default users
