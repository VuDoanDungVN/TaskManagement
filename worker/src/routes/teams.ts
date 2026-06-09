import { Hono, type Context } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppEnv } from "../types"
import { requireAuth } from "../auth-middleware"
import { buildFileUrl, uuid } from "../utils"
import { sendInviteEmail } from "../mailer"

// ============================================================================
// Types & serializers
// ============================================================================
interface TeamRow {
  id: string
  owner_id: string
  name: string
  description: string | null
  avatar_key: string | null
  visibility: "private" | "public"
  created_at: number
  updated_at: number
}

interface TeamRowWithMeta extends TeamRow {
  member_count: number | null
  my_role: string | null
}

interface MemberRow {
  user_id: string
  role: "owner" | "admin" | "member"
  joined_at: number
  email: string | null
  display_name: string | null
  avatar_key: string | null
}

interface InviteRow {
  id: string
  team_id: string
  email: string
  token: string
  role: "admin" | "member"
  status: "pending" | "accepted" | "declined" | "expired"
  invited_by: string
  created_at: number
  expires_at: number | null
}

function serializeTeam(
  c: Context<AppEnv>,
  row: TeamRow,
  extra?: { memberCount?: number; myRole?: string | null },
) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    description: row.description,
    avatarKey: row.avatar_key,
    avatarUrl: buildFileUrl(c.env, c.req.raw, row.avatar_key),
    visibility: row.visibility,
    memberCount: extra?.memberCount ?? 1,
    myRole: extra?.myRole ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function serializeMember(c: Context<AppEnv>, row: MemberRow) {
  return {
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
    email: row.email,
    displayName: row.display_name,
    avatarKey: row.avatar_key,
    avatarUrl: buildFileUrl(c.env, c.req.raw, row.avatar_key),
  }
}

function serializeInvite(row: InviteRow) {
  return {
    id: row.id,
    teamId: row.team_id,
    email: row.email,
    role: row.role,
    status: row.status,
    invitedBy: row.invited_by,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  }
}

// Sinh token ngẫu nhiên (URL-safe) cho lời mời
function inviteToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

// ============================================================================
// Membership helpers
// ============================================================================
type Role = "owner" | "admin" | "member"

/** Trả về role của user trong team, hoặc null nếu không phải thành viên. */
async function getRole(c: Context<AppEnv>, teamId: string, userId: string): Promise<Role | null> {
  const row = await c.env.DB.prepare(
    "SELECT role FROM team_members WHERE team_id = ? AND user_id = ?",
  )
    .bind(teamId, userId)
    .first<{ role: Role }>()
  return row?.role ?? null
}

async function loadTeam(c: Context<AppEnv>, teamId: string): Promise<TeamRow> {
  const row = await c.env.DB.prepare("SELECT * FROM teams WHERE id = ?")
    .bind(teamId)
    .first<TeamRow>()
  if (!row) throw new HTTPException(404, { message: "Không tìm thấy nhóm." })
  return row
}

/** Yêu cầu user là thành viên; trả về { team, role }. */
async function requireMember(c: Context<AppEnv>, teamId: string) {
  const user = c.get("user")
  const team = await loadTeam(c, teamId)
  const role = await getRole(c, teamId, user.uid)
  if (!role) throw new HTTPException(403, { message: "Bạn không phải thành viên của nhóm này." })
  return { team, role, user }
}

/** Yêu cầu user là owner hoặc admin. */
async function requireManager(c: Context<AppEnv>, teamId: string) {
  const ctx = await requireMember(c, teamId)
  if (ctx.role !== "owner" && ctx.role !== "admin") {
    throw new HTTPException(403, { message: "Cần quyền quản trị nhóm (owner/admin)." })
  }
  return ctx
}

// ============================================================================
// Routes
// ============================================================================
const teams = new Hono<AppEnv>()
teams.use("*", requireAuth())

// GET /teams — list các nhóm mà user là thành viên (keyset pagination)
// Query: ?limit=20&cursor=<updatedAt_id>
// Sắp xếp updated_at DESC, id DESC; cursor là (updated_at, id) của item cuối trang trước.
// Keyset (thay vì OFFSET) → luôn nhanh dù số nhóm lớn nhờ index idx_teams_updated.
teams.get("/", async (c) => {
  const user = c.get("user")

  const limitRaw = Number.parseInt(c.req.query("limit") ?? "", 10)
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 20

  const binds: unknown[] = [user.uid]
  let cursorClause = ""
  const cursor = c.req.query("cursor")
  if (cursor) {
    const sep = cursor.lastIndexOf("_")
    const cUpdated = Number(cursor.slice(0, sep))
    const cId = cursor.slice(sep + 1)
    if (Number.isFinite(cUpdated) && cId) {
      // (updated_at, id) < (cursor) theo thứ tự giảm dần
      cursorClause = " AND (t.updated_at < ? OR (t.updated_at = ? AND t.id < ?))"
      binds.push(cUpdated, cUpdated, cId)
    }
  }
  // Lấy limit+1 để biết còn trang sau hay không
  binds.push(limit + 1)

  const rs = await c.env.DB.prepare(
    `SELECT t.*,
       (SELECT COUNT(*) FROM team_members tm2 WHERE tm2.team_id = t.id) AS member_count,
       tm.role AS my_role
     FROM teams t
     JOIN team_members tm ON tm.team_id = t.id
     WHERE tm.user_id = ?${cursorClause}
     ORDER BY t.updated_at DESC, t.id DESC
     LIMIT ?`,
  )
    .bind(...binds)
    .all<TeamRowWithMeta>()

  const rows = rs.results ?? []
  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows
  const last = page[page.length - 1]
  const nextCursor = hasMore && last ? `${last.updated_at}_${last.id}` : null

  const items = page.map((row) =>
    serializeTeam(c, row, {
      memberCount: row.member_count ?? 1,
      myRole: row.my_role,
    }),
  )
  return c.json({ items, nextCursor })
})

// POST /teams — tạo nhóm mới (người tạo = owner)
teams.post("/", async (c) => {
  const user = c.get("user")
  let body: {
    name?: unknown
    description?: unknown
    visibility?: unknown
    avatarKey?: unknown
  }
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }

  const name = typeof body.name === "string" ? body.name.trim() : ""
  if (!name || name.length > 200) {
    throw new HTTPException(400, { message: "Tên nhóm bắt buộc, tối đa 200 ký tự." })
  }
  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim().slice(0, 2000)
      : null
  const visibility = body.visibility === "public" ? "public" : "private"
  const avatarKey =
    typeof body.avatarKey === "string" && body.avatarKey.length > 0
      ? body.avatarKey.slice(0, 500)
      : null

  const id = uuid()
  const now = Date.now()

  // Tạo team + thêm owner vào team_members trong cùng 1 batch
  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO teams (id, owner_id, name, description, avatar_key, visibility, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(id, user.uid, name, description, avatarKey, visibility, now, now),
    c.env.DB.prepare(
      `INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES (?, ?, 'owner', ?)`,
    ).bind(id, user.uid, now),
  ])

  const row = await c.env.DB.prepare("SELECT * FROM teams WHERE id = ?").bind(id).first<TeamRow>()
  if (!row) throw new HTTPException(500, { message: "Tạo nhóm thất bại." })
  return c.json(serializeTeam(c, row, { memberCount: 1, myRole: "owner" }), 201)
})

// GET /teams/:id — chi tiết nhóm (phải là thành viên)
teams.get("/:id", async (c) => {
  const { team, role } = await requireMember(c, c.req.param("id"))
  const countRow = await c.env.DB.prepare(
    "SELECT COUNT(*) AS n FROM team_members WHERE team_id = ?",
  )
    .bind(team.id)
    .first<{ n: number }>()
  return c.json(serializeTeam(c, team, { memberCount: countRow?.n ?? 1, myRole: role }))
})

// PUT /teams/:id — cập nhật (owner/admin)
teams.put("/:id", async (c) => {
  const { team } = await requireManager(c, c.req.param("id"))
  let body: {
    name?: unknown
    description?: unknown
    visibility?: unknown
    avatarKey?: unknown
  }
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }

  const sets: string[] = []
  const params: unknown[] = []

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim() || body.name.length > 200) {
      throw new HTTPException(400, { message: "Tên nhóm không hợp lệ." })
    }
    sets.push("name = ?")
    params.push(body.name.trim())
  }
  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== "string") {
      throw new HTTPException(400, { message: "description không hợp lệ." })
    }
    sets.push("description = ?")
    params.push(body.description === null ? null : (body.description as string).trim().slice(0, 2000))
  }
  if (body.visibility !== undefined) {
    if (body.visibility !== "private" && body.visibility !== "public") {
      throw new HTTPException(400, { message: "visibility không hợp lệ." })
    }
    sets.push("visibility = ?")
    params.push(body.visibility)
  }
  if (body.avatarKey !== undefined) {
    if (body.avatarKey !== null && typeof body.avatarKey !== "string") {
      throw new HTTPException(400, { message: "avatarKey không hợp lệ." })
    }
    sets.push("avatar_key = ?")
    params.push(body.avatarKey)
  }
  if (sets.length === 0) {
    throw new HTTPException(400, { message: "Không có trường nào để cập nhật." })
  }

  const now = Date.now()
  sets.push("updated_at = ?")
  params.push(now, team.id)

  await c.env.DB.prepare(`UPDATE teams SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...params)
    .run()

  const row = await c.env.DB.prepare("SELECT * FROM teams WHERE id = ?").bind(team.id).first<TeamRow>()
  if (!row) throw new HTTPException(500, { message: "Update thành công nhưng không đọc lại được." })
  return c.json(serializeTeam(c, row))
})

// DELETE /teams/:id — xóa nhóm (chỉ owner)
teams.delete("/:id", async (c) => {
  const { team, role } = await requireMember(c, c.req.param("id"))
  if (role !== "owner") {
    throw new HTTPException(403, { message: "Chỉ chủ nhóm (owner) mới được xóa nhóm." })
  }
  await c.env.DB.prepare("DELETE FROM teams WHERE id = ?").bind(team.id).run()
  return c.json({ ok: true })
})

// ----------------------------------------------------------------------------
// Members
// ----------------------------------------------------------------------------

// GET /teams/:id/members — danh sách thành viên (kèm info user)
teams.get("/:id/members", async (c) => {
  const { team } = await requireMember(c, c.req.param("id"))
  const rs = await c.env.DB.prepare(
    `SELECT tm.user_id, tm.role, tm.joined_at,
            u.email, u.display_name, u.avatar_key
     FROM team_members tm
     LEFT JOIN users u ON u.id = tm.user_id
     WHERE tm.team_id = ?
     ORDER BY CASE tm.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, tm.joined_at ASC`,
  )
    .bind(team.id)
    .all<MemberRow>()
  return c.json({ items: (rs.results ?? []).map((r) => serializeMember(c, r)) })
})

// PUT /teams/:id/members/:userId — đổi vai trò (chỉ owner)
teams.put("/:id/members/:userId", async (c) => {
  const { team, role } = await requireMember(c, c.req.param("id"))
  if (role !== "owner") {
    throw new HTTPException(403, { message: "Chỉ chủ nhóm mới được đổi vai trò." })
  }
  const targetId = c.req.param("userId")
  if (targetId === team.owner_id) {
    throw new HTTPException(400, { message: "Không thể đổi vai trò của chủ nhóm." })
  }
  let body: { role?: unknown }
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }
  if (body.role !== "admin" && body.role !== "member") {
    throw new HTTPException(400, { message: "role phải là 'admin' hoặc 'member'." })
  }
  const res = await c.env.DB.prepare(
    "UPDATE team_members SET role = ? WHERE team_id = ? AND user_id = ?",
  )
    .bind(body.role, team.id, targetId)
    .run()
  if (!res.meta.changes) {
    throw new HTTPException(404, { message: "Không tìm thấy thành viên." })
  }
  return c.json({ ok: true })
})

// DELETE /teams/:id/members/:userId — xóa thành viên (owner/admin) hoặc tự rời nhóm
teams.delete("/:id/members/:userId", async (c) => {
  const { team, role, user } = await requireMember(c, c.req.param("id"))
  const targetId = c.req.param("userId")
  const isSelf = targetId === user.uid

  if (targetId === team.owner_id) {
    throw new HTTPException(400, {
      message: "Chủ nhóm không thể bị xóa/rời. Hãy chuyển quyền sở hữu hoặc xóa nhóm.",
    })
  }
  // Không phải tự rời thì cần quyền quản trị
  if (!isSelf && role !== "owner" && role !== "admin") {
    throw new HTTPException(403, { message: "Cần quyền quản trị để xóa thành viên." })
  }
  const res = await c.env.DB.prepare(
    "DELETE FROM team_members WHERE team_id = ? AND user_id = ?",
  )
    .bind(team.id, targetId)
    .run()
  if (!res.meta.changes) {
    throw new HTTPException(404, { message: "Không tìm thấy thành viên." })
  }
  return c.json({ ok: true })
})

// ----------------------------------------------------------------------------
// Invites
// ----------------------------------------------------------------------------

// GET /teams/:id/invites — danh sách lời mời đang chờ (owner/admin)
teams.get("/:id/invites", async (c) => {
  const { team } = await requireManager(c, c.req.param("id"))
  const rs = await c.env.DB.prepare(
    "SELECT * FROM team_invites WHERE team_id = ? AND status = 'pending' ORDER BY created_at DESC",
  )
    .bind(team.id)
    .all<InviteRow>()
  return c.json({ items: (rs.results ?? []).map(serializeInvite) })
})

// POST /teams/:id/invites — tạo lời mời (owner/admin). Nhận 1 email hoặc mảng emails.
teams.post("/:id/invites", async (c) => {
  const { team, user } = await requireManager(c, c.req.param("id"))
  let body: { emails?: unknown; email?: unknown; role?: unknown }
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }

  const rawList: unknown[] = Array.isArray(body.emails)
    ? body.emails
    : body.email !== undefined
      ? [body.email]
      : []
  const emails = Array.from(
    new Set(
      rawList
        .filter((e): e is string => typeof e === "string")
        .map((e) => e.trim().toLowerCase())
        .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)),
    ),
  )
  if (emails.length === 0) {
    throw new HTTPException(400, { message: "Cần ít nhất 1 email hợp lệ." })
  }
  const role = body.role === "admin" ? "admin" : "member"
  const now = Date.now()
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000 // 7 ngày

  const created: ReturnType<typeof serializeInvite>[] = []
  const toSend: { email: string; token: string; role: string }[] = []
  for (const email of emails) {
    // Bỏ qua nếu email đã là thành viên
    const already = await c.env.DB.prepare(
      `SELECT 1 FROM team_members tm JOIN users u ON u.id = tm.user_id
       WHERE tm.team_id = ? AND u.email = ?`,
    )
      .bind(team.id, email)
      .first()
    if (already) continue

    const id = uuid()
    const token = inviteToken()
    // UNIQUE(team_id, email) WHERE pending → upsert: ghi đè token/role nếu đã có pending
    await c.env.DB.prepare(
      `INSERT INTO team_invites (id, team_id, email, token, role, status, invited_by, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
       ON CONFLICT(team_id, email) WHERE status = 'pending'
       DO UPDATE SET token = excluded.token, role = excluded.role,
                     invited_by = excluded.invited_by, created_at = excluded.created_at,
                     expires_at = excluded.expires_at`,
    )
      .bind(id, team.id, email, token, role, user.uid, now, expiresAt)
      .run()

    const row = await c.env.DB.prepare(
      "SELECT * FROM team_invites WHERE team_id = ? AND email = ? AND status = 'pending'",
    )
      .bind(team.id, email)
      .first<InviteRow>()
    if (row) {
      created.push(serializeInvite(row))
      toSend.push({ email: row.email, token: row.token, role: row.role })
    }
  }

  // Gửi email nền (waitUntil) — không chặn response; lỗi gửi mail không làm hỏng lời mời.
  if (toSend.length > 0) {
    const inviterName = user.name || user.email
    const sendAll = Promise.all(
      toSend.map((s) =>
        sendInviteEmail(c.env, {
          to: s.email,
          teamName: team.name,
          inviterName,
          token: s.token,
          role: s.role,
        }),
      ),
    )
    c.executionCtx.waitUntil(sendAll)
  }

  return c.json({ items: created }, 201)
})

// DELETE /teams/:id/invites/:inviteId — hủy lời mời (owner/admin)
teams.delete("/:id/invites/:inviteId", async (c) => {
  const { team } = await requireManager(c, c.req.param("id"))
  const res = await c.env.DB.prepare(
    "DELETE FROM team_invites WHERE id = ? AND team_id = ?",
  )
    .bind(c.req.param("inviteId"), team.id)
    .run()
  if (!res.meta.changes) {
    throw new HTTPException(404, { message: "Không tìm thấy lời mời." })
  }
  return c.json({ ok: true })
})

// POST /teams/invites/accept — chấp nhận lời mời bằng token (user đã đăng nhập)
teams.post("/invites/accept", async (c) => {
  const user = c.get("user")
  let body: { token?: unknown }
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }
  const token = typeof body.token === "string" ? body.token.trim() : ""
  if (!token) throw new HTTPException(400, { message: "Thiếu token." })

  const invite = await c.env.DB.prepare(
    "SELECT * FROM team_invites WHERE token = ?",
  )
    .bind(token)
    .first<InviteRow>()
  if (!invite) throw new HTTPException(404, { message: "Lời mời không tồn tại." })
  if (invite.status !== "pending") {
    throw new HTTPException(409, { message: "Lời mời đã được xử lý hoặc hết hạn." })
  }
  if (invite.expires_at && invite.expires_at < Date.now()) {
    await c.env.DB.prepare("UPDATE team_invites SET status = 'expired' WHERE id = ?")
      .bind(invite.id)
      .run()
    throw new HTTPException(410, { message: "Lời mời đã hết hạn." })
  }
  // Email lời mời phải khớp email tài khoản đang đăng nhập
  if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
    throw new HTTPException(403, {
      message: "Lời mời này dành cho email khác với tài khoản đang đăng nhập.",
    })
  }

  const now = Date.now()
  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(team_id, user_id) DO NOTHING`,
    ).bind(invite.team_id, user.uid, invite.role, now),
    c.env.DB.prepare("UPDATE team_invites SET status = 'accepted' WHERE id = ?").bind(invite.id),
  ])

  const team = await c.env.DB.prepare("SELECT * FROM teams WHERE id = ?")
    .bind(invite.team_id)
    .first<TeamRow>()
  if (!team) throw new HTTPException(500, { message: "Không đọc được nhóm sau khi tham gia." })
  return c.json(serializeTeam(c, team, { myRole: invite.role }))
})

// ----------------------------------------------------------------------------
// Projects của nhóm (gán project vào team)
// ----------------------------------------------------------------------------

interface TeamProjectRow {
  id: string
  owner_id: string
  name: string
  description: string | null
  thumbnail_key: string | null
  created_at: number
  updated_at: number
}

function serializeTeamProject(c: Context<AppEnv>, row: TeamProjectRow) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    description: row.description,
    thumbnailKey: row.thumbnail_key,
    thumbnailUrl: buildFileUrl(c.env, c.req.raw, row.thumbnail_key),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// GET /teams/:id/projects — danh sách project thuộc nhóm (thành viên xem được)
teams.get("/:id/projects", async (c) => {
  const { team } = await requireMember(c, c.req.param("id"))
  const rs = await c.env.DB.prepare(
    `SELECT id, owner_id, name, description, thumbnail_key, created_at, updated_at
     FROM projects WHERE team_id = ? ORDER BY updated_at DESC`,
  )
    .bind(team.id)
    .all<TeamProjectRow>()
  return c.json({ items: (rs.results ?? []).map((r) => serializeTeamProject(c, r)) })
})

// POST /teams/:id/projects — gán 1 project vào nhóm.
// Yêu cầu: là owner/admin của nhóm VÀ là chủ của project.
teams.post("/:id/projects", async (c) => {
  const { team, user } = await requireManager(c, c.req.param("id"))
  let body: { projectId?: unknown }
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }
  const projectId = typeof body.projectId === "string" ? body.projectId : ""
  if (!projectId) throw new HTTPException(400, { message: "Thiếu projectId." })

  const proj = await c.env.DB.prepare(
    "SELECT owner_id FROM projects WHERE id = ?",
  )
    .bind(projectId)
    .first<{ owner_id: string }>()
  if (!proj) throw new HTTPException(404, { message: "Không tìm thấy dự án." })
  if (proj.owner_id !== user.uid) {
    throw new HTTPException(403, { message: "Chỉ chủ dự án mới được gán dự án vào nhóm." })
  }

  await c.env.DB.prepare("UPDATE projects SET team_id = ?, updated_at = ? WHERE id = ?")
    .bind(team.id, Date.now(), projectId)
    .run()
  return c.json({ ok: true }, 201)
})

// DELETE /teams/:id/projects/:projectId — gỡ project khỏi nhóm (owner/admin)
teams.delete("/:id/projects/:projectId", async (c) => {
  const { team } = await requireManager(c, c.req.param("id"))
  const res = await c.env.DB.prepare(
    "UPDATE projects SET team_id = NULL, updated_at = ? WHERE id = ? AND team_id = ?",
  )
    .bind(Date.now(), c.req.param("projectId"), team.id)
    .run()
  if (!res.meta.changes) {
    throw new HTTPException(404, { message: "Dự án không thuộc nhóm này." })
  }
  return c.json({ ok: true })
})

export default teams
