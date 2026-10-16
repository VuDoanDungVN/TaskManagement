import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { Context } from "hono"
import type { AppEnv, SystemRole, UserStatus } from "../types"
import { requireAuth, requireSystemAdmin } from "../auth-middleware"
import { buildFileUrl } from "../utils"
import {
  FirebaseAdminError,
  createOrGetFirebaseUser,
  generatePasswordResetLink,
  isFirebaseAdminConfigured,
  setFirebaseUserDisabled,
} from "../firebase-admin"
import { sendAccountSetupEmail } from "../mailer"

interface UserRow {
  id: string
  email: string
  display_name: string | null
  avatar_key: string | null
  email_verified: number
  role: SystemRole
  status: UserStatus
  created_at: number
  updated_at: number
}

function serializeUser(
  row: UserRow,
  fileUrl: string | null,
  extra?: { teamCount?: number; projectCount?: number },
) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarKey: row.avatar_key,
    avatarUrl: fileUrl,
    emailVerified: row.email_verified === 1,
    role: row.role,
    status: row.status ?? "active",
    teamCount: extra?.teamCount,
    projectCount: extra?.projectCount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const users = new Hono<AppEnv>()

users.use("*", requireAuth())

users.get("/me", async (c) => {
  const user = c.get("user")
  const row = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
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

// ----------------------------------------------------------------------------
// Danh bạ thành viên hệ thống
// ----------------------------------------------------------------------------

// GET /users — danh sách TẤT CẢ user (keyset pagination + tìm kiếm). Chỉ admin.
// Customer chỉ xem được thành viên cùng dự án qua GET /projects/:id/members.
// Query: ?limit=20&cursor=<createdAt_id>&search=<text>
// Keyset theo (created_at, id) DESC → luôn nhanh nhờ index idx_users_created.
users.get("/", async (c) => {
  requireSystemAdmin(c)
  const limitRaw = Number.parseInt(c.req.query("limit") ?? "", 10)
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 20

  const binds: unknown[] = []
  let where = "WHERE 1 = 1"

  const search = (c.req.query("search") ?? "").trim()
  if (search) {
    // Escape ký tự wildcard của LIKE để tìm kiếm đúng nghĩa
    const safe = search.replace(/[%_\\]/g, (m) => `\\${m}`)
    where += " AND (u.email LIKE ? ESCAPE '\\' OR u.display_name LIKE ? ESCAPE '\\')"
    binds.push(`%${safe}%`, `%${safe}%`)
  }

  const cursor = c.req.query("cursor")
  if (cursor) {
    const sep = cursor.lastIndexOf("_")
    const cCreated = Number(cursor.slice(0, sep))
    const cId = cursor.slice(sep + 1)
    if (Number.isFinite(cCreated) && cId) {
      where += " AND (u.created_at < ? OR (u.created_at = ? AND u.id < ?))"
      binds.push(cCreated, cCreated, cId)
    }
  }
  binds.push(limit + 1)

  const rs = await c.env.DB.prepare(
    `SELECT u.*,
       (SELECT COUNT(*) FROM team_members tm WHERE tm.user_id = u.id) AS team_count,
       (SELECT COUNT(*) FROM project_members pm WHERE pm.user_id = u.id) AS project_count
     FROM users u
     ${where}
     ORDER BY u.created_at DESC, u.id DESC
     LIMIT ?`,
  )
    .bind(...binds)
    .all<UserRow & { team_count: number; project_count: number }>()

  const rows = rs.results ?? []
  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows
  const last = page[page.length - 1]
  const nextCursor = hasMore && last ? `${last.created_at}_${last.id}` : null

  const items = page.map((row) =>
    serializeUser(row, buildFileUrl(c.env, c.req.raw, row.avatar_key), {
      teamCount: row.team_count ?? 0,
      projectCount: row.project_count ?? 0,
    }),
  )
  return c.json({ items, nextCursor })
})

// GET /users/:id/teams — danh sách nhóm mà user thuộc về (chỉ admin).
users.get("/:id/teams", async (c) => {
  requireSystemAdmin(c)
  const id = c.req.param("id")
  const rs = await c.env.DB.prepare(
    `SELECT t.id AS team_id, t.name, t.owner_id, t.avatar_key, tm.role AS member_role,
       (SELECT COUNT(*) FROM team_members x WHERE x.team_id = t.id) AS member_count
     FROM team_members tm
     JOIN teams t ON t.id = tm.team_id
     WHERE tm.user_id = ?
     ORDER BY t.name ASC`,
  )
    .bind(id)
    .all<{
      team_id: string
      name: string
      owner_id: string
      avatar_key: string | null
      member_role: "owner" | "admin" | "member"
      member_count: number
    }>()

  const items = (rs.results ?? []).map((r) => ({
    teamId: r.team_id,
    name: r.name,
    role: r.member_role,
    isOwner: r.owner_id === id,
    memberCount: r.member_count,
    avatarUrl: buildFileUrl(c.env, c.req.raw, r.avatar_key),
  }))
  return c.json({ items })
})

// PUT /users/:id — cập nhật user (chỉ admin): displayName và/hoặc role.
users.put("/:id", async (c) => {
  const admin = requireSystemAdmin(c)
  const id = c.req.param("id")

  let body: { displayName?: unknown; role?: unknown; status?: unknown }
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }

  const target = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(id)
    .first<UserRow>()
  if (!target) throw new HTTPException(404, { message: "Không tìm thấy user." })

  const sets: string[] = []
  const params: unknown[] = []

  if (body.displayName !== undefined) {
    const v = body.displayName
    if (v !== null && (typeof v !== "string" || v.trim().length === 0 || v.length > 200)) {
      throw new HTTPException(400, { message: "displayName không hợp lệ." })
    }
    sets.push("display_name = ?")
    params.push(v === null ? null : (v as string).trim())
  }
  if (body.role !== undefined) {
    if (body.role !== "admin" && body.role !== "user") {
      throw new HTTPException(400, { message: "role phải là 'admin' hoặc 'user'." })
    }
    // Không cho admin tự hạ cấp chính mình (tránh tự khóa quyền)
    if (id === admin.uid && body.role !== "admin") {
      throw new HTTPException(400, { message: "Bạn không thể tự gỡ quyền admin của mình." })
    }
    sets.push("role = ?")
    params.push(body.role)
  }
  let statusChange: UserStatus | null = null
  if (body.status !== undefined) {
    if (body.status !== "active" && body.status !== "disabled") {
      throw new HTTPException(400, { message: "status phải là 'active' hoặc 'disabled'." })
    }
    if (id === admin.uid && body.status === "disabled") {
      throw new HTTPException(400, { message: "Bạn không thể tự khoá tài khoản của mình." })
    }
    sets.push("status = ?")
    params.push(body.status)
    if (body.status !== target.status) statusChange = body.status
  }
  if (sets.length === 0) {
    throw new HTTPException(400, { message: "Không có trường nào để cập nhật." })
  }

  sets.push("updated_at = ?")
  params.push(Date.now(), id)

  await c.env.DB.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...params)
    .run()

  // Khoá cả trên Firebase để user không lấy được token mới (DB status vẫn là nguồn chặn chính)
  if (statusChange && isFirebaseAdminConfigured(c.env)) {
    await setFirebaseUserDisabled(c.env, id, statusChange === "disabled").catch((e) =>
      console.error("Không cập nhật được trạng thái Firebase:", e),
    )
  }

  const row = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(id)
    .first<UserRow>()
  if (!row) throw new HTTPException(500, { message: "Update thành công nhưng không đọc lại được." })
  return c.json(serializeUser(row, buildFileUrl(c.env, c.req.raw, row.avatar_key)))
})

// POST /users/:id/teams — thêm user vào 1 nhóm (chỉ admin). Body: { teamId, role }.
users.post("/:id/teams", async (c) => {
  requireSystemAdmin(c)
  const id = c.req.param("id")

  let body: { teamId?: unknown; role?: unknown }
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }
  const teamId = typeof body.teamId === "string" ? body.teamId : ""
  if (!teamId) throw new HTTPException(400, { message: "Thiếu teamId." })
  const role = body.role === "admin" ? "admin" : "member"

  const userExists = await c.env.DB.prepare("SELECT 1 FROM users WHERE id = ?")
    .bind(id)
    .first()
  if (!userExists) throw new HTTPException(404, { message: "Không tìm thấy user." })

  const team = await c.env.DB.prepare("SELECT owner_id FROM teams WHERE id = ?")
    .bind(teamId)
    .first<{ owner_id: string }>()
  if (!team) throw new HTTPException(404, { message: "Không tìm thấy nhóm." })

  // Chủ nhóm đã là thành viên (role owner) — không đổi vai trò của owner.
  if (team.owner_id === id) {
    return c.json({ ok: true })
  }

  const now = Date.now()
  await c.env.DB.prepare(
    `INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(team_id, user_id) DO UPDATE SET role = excluded.role`,
  )
    .bind(teamId, id, role, now)
    .run()

  return c.json({ ok: true }, 201)
})

// DELETE /users/:id/teams/:teamId — gỡ user khỏi nhóm (chỉ admin).
users.delete("/:id/teams/:teamId", async (c) => {
  requireSystemAdmin(c)
  const id = c.req.param("id")
  const teamId = c.req.param("teamId")

  const team = await c.env.DB.prepare("SELECT owner_id FROM teams WHERE id = ?")
    .bind(teamId)
    .first<{ owner_id: string }>()
  if (!team) throw new HTTPException(404, { message: "Không tìm thấy nhóm." })
  if (team.owner_id === id) {
    throw new HTTPException(400, {
      message: "Không thể gỡ chủ nhóm khỏi nhóm. Hãy chuyển quyền sở hữu hoặc xóa nhóm.",
    })
  }

  const res = await c.env.DB.prepare(
    "DELETE FROM team_members WHERE team_id = ? AND user_id = ?",
  )
    .bind(teamId, id)
    .run()
  if (!res.meta.changes) {
    throw new HTTPException(404, { message: "User không thuộc nhóm này." })
  }
  return c.json({ ok: true })
})

// ----------------------------------------------------------------------------
// Tạo tài khoản khách hàng & gán dự án (chỉ admin)
// ----------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Lọc danh sách projectId hợp lệ (tồn tại trong DB), bỏ trùng. */
async function validProjectIds(c: Context<AppEnv>, raw: unknown): Promise<string[]> {
  if (raw === undefined || raw === null) return []
  if (!Array.isArray(raw) || !raw.every((x) => typeof x === "string")) {
    throw new HTTPException(400, { message: "projectIds phải là mảng string." })
  }
  const ids = [...new Set(raw as string[])]
  if (ids.length === 0) return []
  const rs = await c.env.DB.prepare(
    `SELECT id FROM projects WHERE id IN (${ids.map(() => "?").join(",")})`,
  )
    .bind(...ids)
    .all<{ id: string }>()
  const found = new Set((rs.results ?? []).map((r) => r.id))
  const missing = ids.filter((x) => !found.has(x))
  if (missing.length) {
    throw new HTTPException(400, { message: `Dự án không tồn tại: ${missing.join(", ")}` })
  }
  return ids
}

function firebaseErrorToHttp(e: unknown): never {
  if (e instanceof FirebaseAdminError) {
    console.error("Firebase Admin lỗi:", e.code, e.raw)
    if (e.code.startsWith("INVALID_EMAIL")) {
      throw new HTTPException(400, { message: "Email không hợp lệ." })
    }
    throw new HTTPException(502, { message: `Firebase từ chối yêu cầu: ${e.code}` })
  }
  throw e
}

// POST /users — admin tạo tài khoản. Body: { email, displayName?, role?, projectIds? }
// Trả về user + setPasswordUrl (để admin tự gửi nếu email không tới) + emailSent.
users.post("/", async (c) => {
  const admin = requireSystemAdmin(c)
  let body: { email?: unknown; displayName?: unknown; role?: unknown; projectIds?: unknown }
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!EMAIL_RE.test(email) || email.length > 254) {
    throw new HTTPException(400, { message: "Email không hợp lệ." })
  }
  let displayName: string | null = null
  if (body.displayName !== undefined && body.displayName !== null) {
    if (typeof body.displayName !== "string" || body.displayName.length > 200) {
      throw new HTTPException(400, { message: "displayName không hợp lệ." })
    }
    displayName = body.displayName.trim() || null
  }
  const role: SystemRole = body.role === "admin" ? "admin" : "user"
  const projectIds = await validProjectIds(c, body.projectIds)

  const dup = await c.env.DB.prepare("SELECT 1 FROM users WHERE lower(email) = ?")
    .bind(email)
    .first()
  if (dup) throw new HTTPException(409, { message: "Email này đã có tài khoản trong hệ thống." })

  if (!isFirebaseAdminConfigured(c.env)) {
    throw new HTTPException(500, {
      message: "Chưa cấu hình FIREBASE_SERVICE_ACCOUNT trên Worker — không thể tạo tài khoản.",
    })
  }

  let uid: string
  let setPasswordUrl: string
  try {
    uid = await createOrGetFirebaseUser(c.env, email, displayName)
    setPasswordUrl = await generatePasswordResetLink(c.env, email)
  } catch (e) {
    firebaseErrorToHttp(e)
  }

  const now = Date.now()
  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO users (id, email, display_name, email_verified, role, status, created_at, updated_at)
       VALUES (?, ?, ?, 1, ?, 'active', ?, ?)`,
    ).bind(uid, email, displayName, role, now, now),
    ...projectIds.map((pid) =>
      c.env.DB.prepare(
        `INSERT OR IGNORE INTO project_members (project_id, user_id, added_by, added_at)
         VALUES (?, ?, ?, ?)`,
      ).bind(pid, uid, admin.uid, now),
    ),
  ])

  const emailSent = await sendAccountSetupEmail(c.env, { to: email, displayName, setPasswordUrl })

  const row = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(uid)
    .first<UserRow>()
  if (!row) throw new HTTPException(500, { message: "Tạo tài khoản thất bại." })
  return c.json(
    {
      user: serializeUser(row, null, { teamCount: 0, projectCount: projectIds.length }),
      setPasswordUrl,
      emailSent,
    },
    201,
  )
})

// POST /users/:id/setup-link — sinh lại link đặt mật khẩu + gửi email (chỉ admin)
users.post("/:id/setup-link", async (c) => {
  requireSystemAdmin(c)
  const row = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(c.req.param("id"))
    .first<UserRow>()
  if (!row) throw new HTTPException(404, { message: "Không tìm thấy user." })
  if (!isFirebaseAdminConfigured(c.env)) {
    throw new HTTPException(500, { message: "Chưa cấu hình FIREBASE_SERVICE_ACCOUNT trên Worker." })
  }
  let setPasswordUrl: string
  try {
    setPasswordUrl = await generatePasswordResetLink(c.env, row.email)
  } catch (e) {
    firebaseErrorToHttp(e)
  }
  const emailSent = await sendAccountSetupEmail(c.env, {
    to: row.email,
    displayName: row.display_name,
    setPasswordUrl,
  })
  return c.json({ setPasswordUrl, emailSent })
})

// GET /users/:id/projects — dự án user được gán (chỉ admin)
users.get("/:id/projects", async (c) => {
  requireSystemAdmin(c)
  const rs = await c.env.DB.prepare(
    `SELECT p.id, p.name, p.thumbnail_key, pm.added_at
     FROM project_members pm JOIN projects p ON p.id = pm.project_id
     WHERE pm.user_id = ?
     ORDER BY p.name COLLATE NOCASE ASC`,
  )
    .bind(c.req.param("id"))
    .all<{ id: string; name: string; thumbnail_key: string | null; added_at: number }>()
  const items = (rs.results ?? []).map((r) => ({
    projectId: r.id,
    name: r.name,
    thumbnailUrl: buildFileUrl(c.env, c.req.raw, r.thumbnail_key),
    addedAt: r.added_at,
  }))
  return c.json({ items })
})

// PUT /users/:id/projects — đặt lại toàn bộ danh sách dự án của user (chỉ admin).
// Body: { projectIds: string[] }
users.put("/:id/projects", async (c) => {
  const admin = requireSystemAdmin(c)
  const id = c.req.param("id")
  let body: { projectIds?: unknown }
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }
  if (body.projectIds === undefined) {
    throw new HTTPException(400, { message: "Thiếu projectIds." })
  }
  const userExists = await c.env.DB.prepare("SELECT 1 FROM users WHERE id = ?").bind(id).first()
  if (!userExists) throw new HTTPException(404, { message: "Không tìm thấy user." })
  const projectIds = await validProjectIds(c, body.projectIds)

  const now = Date.now()
  const keep = projectIds.length
    ? `AND project_id NOT IN (${projectIds.map(() => "?").join(",")})`
    : ""
  await c.env.DB.batch([
    c.env.DB.prepare(`DELETE FROM project_members WHERE user_id = ? ${keep}`).bind(id, ...projectIds),
    ...projectIds.map((pid) =>
      c.env.DB.prepare(
        `INSERT OR IGNORE INTO project_members (project_id, user_id, added_by, added_at)
         VALUES (?, ?, ?, ?)`,
      ).bind(pid, id, admin.uid, now),
    ),
  ])
  return c.json({ ok: true, projectIds })
})

export default users
