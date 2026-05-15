import { Hono, type Context } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppEnv } from "../types"
import { requireAuth } from "../auth-middleware"
import { buildFileUrl, uuid } from "../utils"

interface ProjectRow {
  id: string
  owner_id: string
  name: string
  description: string | null
  thumbnail_key: string | null
  created_at: number
  updated_at: number
}

interface ProjectRowWithStats extends ProjectRow {
  task_total: number | null
  task_pending: number | null
  task_in_progress: number | null
  task_completed: number | null
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
) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    description: row.description,
    thumbnailKey: row.thumbnail_key,
    thumbnailUrl: fileUrl,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    stats: stats ?? { total: 0, pending: 0, "in-progress": 0, completed: 0 },
  }
}

const projects = new Hono<AppEnv>()

projects.use("*", requireAuth())

// GET /projects — list projects của user hiện tại (kèm task stats)
projects.get("/", async (c) => {
  const user = c.get("user")
  const rs = await c.env.DB.prepare(
    `SELECT p.*,
       COALESCE(s.total, 0)        AS task_total,
       COALESCE(s.pending, 0)      AS task_pending,
       COALESCE(s.in_progress, 0)  AS task_in_progress,
       COALESCE(s.completed, 0)    AS task_completed
     FROM projects p
     LEFT JOIN (
       SELECT project_id,
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'pending'     THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) AS in_progress,
         SUM(CASE WHEN status = 'completed'   THEN 1 ELSE 0 END) AS completed
       FROM tasks
       GROUP BY project_id
     ) s ON s.project_id = p.id
     WHERE p.owner_id = ?
     ORDER BY p.updated_at DESC`,
  )
    .bind(user.uid)
    .all<ProjectRowWithStats>()

  const items = (rs.results ?? []).map((row) =>
    serializeProject(row, buildFileUrl(c.env, c.req.raw, row.thumbnail_key), {
      total: row.task_total ?? 0,
      pending: row.task_pending ?? 0,
      "in-progress": row.task_in_progress ?? 0,
      completed: row.task_completed ?? 0,
    }),
  )
  return c.json({ items })
})

// POST /projects — tạo mới
projects.post("/", async (c) => {
  const user = c.get("user")
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

// Helper: load project & check ownership
async function loadOwnedProject(
  c: Context<AppEnv>,
  id: string,
): Promise<ProjectRow> {
  const user = c.get("user")
  const row = await c.env.DB.prepare("SELECT * FROM projects WHERE id = ?")
    .bind(id)
    .first<ProjectRow>()
  if (!row) throw new HTTPException(404, { message: "Không tìm thấy dự án." })
  if (row.owner_id !== user.uid) {
    throw new HTTPException(403, { message: "Bạn không có quyền truy cập dự án này." })
  }
  return row
}

// GET /projects/:id
projects.get("/:id", async (c) => {
  const row = await loadOwnedProject(c, c.req.param("id"))
  return c.json(serializeProject(row, buildFileUrl(c.env, c.req.raw, row.thumbnail_key)))
})

// PUT /projects/:id
projects.put("/:id", async (c) => {
  const existing = await loadOwnedProject(c, c.req.param("id"))
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
  return c.json(serializeProject(row, buildFileUrl(c.env, c.req.raw, row.thumbnail_key)))
})

// DELETE /projects/:id
projects.delete("/:id", async (c) => {
  const existing = await loadOwnedProject(c, c.req.param("id"))
  await c.env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(existing.id).run()
  return c.json({ ok: true })
})

export default projects
