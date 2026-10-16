import { Hono, type Context } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppEnv, SystemRole, UserStatus } from "../types"
import { requireAuth, requireSystemAdmin } from "../auth-middleware"
import { PROJECT_ACCESS_SQL, projectAccessBinds, requireProjectAccess } from "../access"
import { buildFileUrl, uuid } from "../utils"

interface ProjectRow {
  id: string
  owner_id: string
  name: string
  description: string | null
  thumbnail_key: string | null
  team_id: string | null
  created_at: number
  updated_at: number
}

interface ProjectRowWithStats extends ProjectRow {
  task_total: number | null
  task_pending: number | null
  task_in_progress: number | null
  task_completed: number | null
  team_name: string | null
}

interface ProjectStats {
  total: number
  pending: number
  "in-progress": number
  completed: number
}

function serializeProject(
  row: ProjectRow,
  fileUrl: string | null,
  stats?: ProjectStats,
  teamName?: string | null,
) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    description: row.description,
    thumbnailKey: row.thumbnail_key,
    thumbnailUrl: fileUrl,
    teamId: row.team_id,
    teamName: teamName ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    stats: stats ?? { total: 0, pending: 0, "in-progress": 0, completed: 0 },
  }
}

/** Lấy tên team của project (nếu có team_id). */
async function fetchTeamName(
  c: Context<AppEnv>,
  teamId: string | null,
): Promise<string | null> {
  if (!teamId) return null
  const row = await c.env.DB.prepare("SELECT name FROM teams WHERE id = ?")
    .bind(teamId)
    .first<{ name: string }>()
  return row?.name ?? null
}

const projects = new Hono<AppEnv>()

projects.use("*", requireAuth())

// GET /projects — admin: mọi project; customer: project được gán (kèm task stats)
projects.get("/", async (c) => {
  const rs = await c.env.DB.prepare(
    `SELECT p.*,
       COALESCE(s.total, 0)        AS task_total,
       COALESCE(s.pending, 0)      AS task_pending,
       COALESCE(s.in_progress, 0)  AS task_in_progress,
       COALESCE(s.completed, 0)    AS task_completed,
       t.name                      AS team_name
     FROM projects p
     LEFT JOIN teams t ON t.id = p.team_id
     LEFT JOIN (
       SELECT project_id,
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'pending'     THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) AS in_progress,
         SUM(CASE WHEN status = 'completed'   THEN 1 ELSE 0 END) AS completed
       FROM tasks
       GROUP BY project_id
     ) s ON s.project_id = p.id
     WHERE ${PROJECT_ACCESS_SQL}
     ORDER BY p.updated_at DESC`,
  )
    .bind(...projectAccessBinds(c))
    .all<ProjectRowWithStats>()

  const items = (rs.results ?? []).map((row) =>
    serializeProject(
      row,
      buildFileUrl(c.env, c.req.raw, row.thumbnail_key),
      {
        total: row.task_total ?? 0,
        pending: row.task_pending ?? 0,
        "in-progress": row.task_in_progress ?? 0,
        completed: row.task_completed ?? 0,
      },
      row.team_name,
    ),
  )
  return c.json({ items })
})

// POST /projects — tạo mới (chỉ admin)
projects.post("/", async (c) => {
  const user = requireSystemAdmin(c)
  let body: { name?: unknown; description?: unknown; thumbnailKey?: unknown }
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }

  const name = typeof body.name === "string" ? body.name.trim() : ""
  if (!name || name.length > 200) {
    throw new HTTPException(400, { message: "Tên dự án bắt buộc, tối đa 200 ký tự." })
  }
  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim().slice(0, 2000)
      : null
  const thumbnailKey =
    typeof body.thumbnailKey === "string" && body.thumbnailKey.length > 0
      ? body.thumbnailKey.slice(0, 500)
      : null

  const id = uuid()
  const now = Date.now()
  await c.env.DB.prepare(
    `INSERT INTO projects (id, owner_id, name, description, thumbnail_key, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, user.uid, name, description, thumbnailKey, now, now)
    .run()

  const row = await c.env.DB.prepare("SELECT * FROM projects WHERE id = ?")
    .bind(id)
    .first<ProjectRow>()
  if (!row) {
    throw new HTTPException(500, { message: "Tạo dự án thất bại." })
  }
  return c.json(
    serializeProject(row, buildFileUrl(c.env, c.req.raw, row.thumbnail_key)),
    201,
  )
})

// Helper: load project sau khi đã kiểm tra quyền xem (admin hoặc thành viên)
async function loadAccessibleProject(
  c: Context<AppEnv>,
  id: string,
): Promise<ProjectRow> {
  await requireProjectAccess(c, id)
  const row = await c.env.DB.prepare("SELECT * FROM projects WHERE id = ?")
    .bind(id)
    .first<ProjectRow>()
  if (!row) throw new HTTPException(404, { message: "Không tìm thấy dự án." })
  return row
}

// GET /projects/:id
projects.get("/:id", async (c) => {
  const row = await loadAccessibleProject(c, c.req.param("id"))
  const teamName = await fetchTeamName(c, row.team_id)
  return c.json(
    serializeProject(row, buildFileUrl(c.env, c.req.raw, row.thumbnail_key), undefined, teamName),
  )
})

// PUT /projects/:id — sửa thông tin dự án (chỉ admin)
projects.put("/:id", async (c) => {
  requireSystemAdmin(c)
  const existing = await loadAccessibleProject(c, c.req.param("id"))
  let body: {
    name?: unknown
    description?: unknown
    thumbnailKey?: unknown
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
      throw new HTTPException(400, { message: "Tên dự án không hợp lệ." })
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
  if (body.thumbnailKey !== undefined) {
    if (body.thumbnailKey !== null && typeof body.thumbnailKey !== "string") {
      throw new HTTPException(400, { message: "thumbnailKey không hợp lệ." })
    }
    sets.push("thumbnail_key = ?")
    params.push(body.thumbnailKey)
  }
  if (sets.length === 0) {
    throw new HTTPException(400, { message: "Không có trường nào để cập nhật." })
  }

  const now = Date.now()
  sets.push("updated_at = ?")
  params.push(now)
  params.push(existing.id)

  await c.env.DB.prepare(`UPDATE projects SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...params)
    .run()

  const row = await c.env.DB.prepare("SELECT * FROM projects WHERE id = ?")
    .bind(existing.id)
    .first<ProjectRow>()
  if (!row) throw new HTTPException(500, { message: "Update thành công nhưng không đọc lại được." })
  const teamName = await fetchTeamName(c, row.team_id)
  return c.json(
    serializeProject(row, buildFileUrl(c.env, c.req.raw, row.thumbnail_key), undefined, teamName),
  )
})

// DELETE /projects/:id — chỉ admin
projects.delete("/:id", async (c) => {
  requireSystemAdmin(c)
  const existing = await loadAccessibleProject(c, c.req.param("id"))
  await c.env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(existing.id).run()
  return c.json({ ok: true })
})

// ----------------------------------------------------------------------------
// Thành viên dự án
// ----------------------------------------------------------------------------

interface ProjectMemberRow {
  id: string
  email: string
  display_name: string | null
  avatar_key: string | null
  role: SystemRole
  status: UserStatus
  added_at: number
}

// GET /projects/:id/members — người được gán vào dự án.
// Customer chỉ xem được thành viên của dự án mình thuộc về (dùng để giao task).
projects.get("/:id/members", async (c) => {
  const id = c.req.param("id")
  await requireProjectAccess(c, id)
  const rs = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.display_name, u.avatar_key, u.role, u.status, pm.added_at
     FROM project_members pm JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = ?
     ORDER BY COALESCE(u.display_name, u.email) COLLATE NOCASE ASC`,
  )
    .bind(id)
    .all<ProjectMemberRow>()
  const items = (rs.results ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    displayName: r.display_name,
    avatarUrl: buildFileUrl(c.env, c.req.raw, r.avatar_key),
    role: r.role,
    status: r.status,
    addedAt: r.added_at,
  }))
  return c.json({ items })
})

// POST /projects/:id/members — gán user vào dự án (chỉ admin). Body: { userId }
projects.post("/:id/members", async (c) => {
  const admin = requireSystemAdmin(c)
  const id = c.req.param("id")
  await loadAccessibleProject(c, id)
  let body: { userId?: unknown }
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }
  const userId = typeof body.userId === "string" ? body.userId : ""
  if (!userId) throw new HTTPException(400, { message: "Thiếu userId." })
  const exists = await c.env.DB.prepare("SELECT 1 FROM users WHERE id = ?").bind(userId).first()
  if (!exists) throw new HTTPException(404, { message: "Không tìm thấy user." })

  await c.env.DB.prepare(
    `INSERT OR IGNORE INTO project_members (project_id, user_id, added_by, added_at)
     VALUES (?, ?, ?, ?)`,
  )
    .bind(id, userId, admin.uid, Date.now())
    .run()
  return c.json({ ok: true }, 201)
})

// DELETE /projects/:id/members/:userId — gỡ user khỏi dự án (chỉ admin)
projects.delete("/:id/members/:userId", async (c) => {
  requireSystemAdmin(c)
  const res = await c.env.DB.prepare(
    "DELETE FROM project_members WHERE project_id = ? AND user_id = ?",
  )
    .bind(c.req.param("id"), c.req.param("userId"))
    .run()
  if (!res.meta.changes) {
    throw new HTTPException(404, { message: "User không thuộc dự án này." })
  }
  return c.json({ ok: true })
})

export default projects
