import { Hono, type Context } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppEnv } from "../types"
import { requireAuth } from "../auth-middleware"
import { buildFileUrl, uuid } from "../utils"

const STATUSES = ["pending", "in-progress", "completed"] as const
const PRIORITIES = ["low", "medium", "high"] as const
type TaskStatus = (typeof STATUSES)[number]
type TaskPriority = (typeof PRIORITIES)[number]

interface TaskRow {
  id: string
  project_id: string
  no: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee: string | null
  tags: string | null
  start_date: string | null
  due_date: string | null
  thumbnail_key: string | null
  created_at: number
  updated_at: number
}

function parseTags(s: string | null): string[] {
  if (!s) return []
  try {
    const parsed = JSON.parse(s)
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === "string") : []
  } catch {
    return []
  }
}

function serializeTask(row: TaskRow, fileUrl: string | null) {
  return {
    id: row.id,
    projectId: row.project_id,
    no: row.no,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assignee: row.assignee,
    tags: parseTags(row.tags),
    startDate: row.start_date,
    dueDate: row.due_date,
    thumbnailKey: row.thumbnail_key,
    thumbnailUrl: fileUrl,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const tasks = new Hono<AppEnv>()
tasks.use("*", requireAuth())

async function assertProjectOwner(
  c: Context<AppEnv>,
  projectId: string,
): Promise<void> {
  const user = c.get("user")
  const owner = await c.env.DB.prepare("SELECT owner_id FROM projects WHERE id = ?")
    .bind(projectId)
    .first<{ owner_id: string }>()
  if (!owner) throw new HTTPException(404, { message: "Không tìm thấy dự án." })
  if (owner.owner_id !== user.uid) {
    throw new HTTPException(403, { message: "Bạn không có quyền truy cập dự án này." })
  }
}

async function loadOwnedTask(
  c: Context<AppEnv>,
  id: string,
): Promise<TaskRow> {
  const user = c.get("user")
  const row = await c.env.DB.prepare(
    `SELECT t.* FROM tasks t
     JOIN projects p ON p.id = t.project_id
     WHERE t.id = ? AND p.owner_id = ?`,
  )
    .bind(id, user.uid)
    .first<TaskRow>()
  if (!row) throw new HTTPException(404, { message: "Không tìm thấy task." })
  return row
}

// GET /tasks?projectId=xxx — list task của 1 project
tasks.get("/", async (c) => {
  const projectId = c.req.query("projectId")
  if (!projectId) {
    throw new HTTPException(400, { message: "Thiếu query param projectId." })
  }
  await assertProjectOwner(c, projectId)

  const rs = await c.env.DB.prepare(
    "SELECT * FROM tasks WHERE project_id = ? ORDER BY updated_at DESC",
  )
    .bind(projectId)
    .all<TaskRow>()

  const items = (rs.results ?? []).map((r) =>
    serializeTask(r, buildFileUrl(c.env, c.req.raw, r.thumbnail_key)),
  )
  return c.json({ items })
})

interface TaskInput {
  projectId?: unknown
  no?: unknown
  title?: unknown
  description?: unknown
  status?: unknown
  priority?: unknown
  assignee?: unknown
  tags?: unknown
  startDate?: unknown
  dueDate?: unknown
  thumbnailKey?: unknown
}

function validateNo(v: unknown): number {
  if (typeof v !== "number" || !Number.isInteger(v) || v < 1) {
    throw new HTTPException(400, { message: "Số No phải là số nguyên dương." })
  }
  return v
}

function validateStatus(v: unknown): TaskStatus {
  if (typeof v !== "string" || !STATUSES.includes(v as TaskStatus)) {
    throw new HTTPException(400, { message: `Status phải là ${STATUSES.join("/")}.` })
  }
  return v as TaskStatus
}

function validatePriority(v: unknown): TaskPriority {
  if (typeof v !== "string" || !PRIORITIES.includes(v as TaskPriority)) {
    throw new HTTPException(400, { message: `Priority phải là ${PRIORITIES.join("/")}.` })
  }
  return v as TaskPriority
}

function validateTags(v: unknown): string {
  if (v === undefined || v === null) return "[]"
  if (!Array.isArray(v) || !v.every((t) => typeof t === "string")) {
    throw new HTTPException(400, { message: "Tags phải là mảng string." })
  }
  return JSON.stringify(v.map((s) => s.trim()).filter(Boolean))
}

function validateDate(v: unknown, field: string): string | null {
  if (v === undefined || v === null || v === "") return null
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    throw new HTTPException(400, { message: `${field} phải là YYYY-MM-DD.` })
  }
  return v
}

// POST /tasks — tạo task
tasks.post("/", async (c) => {
  let body: TaskInput
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }
  const projectId = typeof body.projectId === "string" ? body.projectId : ""
  if (!projectId) {
    throw new HTTPException(400, { message: "Thiếu projectId." })
  }
  await assertProjectOwner(c, projectId)

  const no = validateNo(body.no)
  const title =
    typeof body.title === "string" && body.title.trim() ? body.title.trim().slice(0, 300) : ""
  if (!title) throw new HTTPException(400, { message: "Tiêu đề bắt buộc." })

  const status = body.status === undefined ? "pending" : validateStatus(body.status)
  const priority = body.priority === undefined ? "medium" : validatePriority(body.priority)
  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim().slice(0, 5000)
      : null
  const assignee =
    typeof body.assignee === "string" && body.assignee.trim()
      ? body.assignee.trim().slice(0, 200)
      : null
  const tagsJson = validateTags(body.tags)
  const startDate = validateDate(body.startDate, "startDate")
  const dueDate = validateDate(body.dueDate, "dueDate")
  const thumbnailKey =
    typeof body.thumbnailKey === "string" && body.thumbnailKey.length > 0
      ? body.thumbnailKey.slice(0, 500)
      : null

  const id = uuid()
  const now = Date.now()

  try {
    await c.env.DB.prepare(
      `INSERT INTO tasks (
         id, project_id, no, title, description, status, priority,
         assignee, tags, start_date, due_date, thumbnail_key, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        projectId,
        no,
        title,
        description,
        status,
        priority,
        assignee,
        tagsJson,
        startDate,
        dueDate,
        thumbnailKey,
        now,
        now,
      )
      .run()
  } catch (e) {
    const msg = String((e as Error)?.message ?? "")
    if (msg.includes("UNIQUE") && msg.includes("project_id, no")) {
      throw new HTTPException(409, { message: `Số No #${no} đã tồn tại trong dự án.` })
    }
    throw e
  }

  const row = await c.env.DB.prepare("SELECT * FROM tasks WHERE id = ?")
    .bind(id)
    .first<TaskRow>()
  if (!row) throw new HTTPException(500, { message: "Tạo task thất bại." })
  return c.json(serializeTask(row, buildFileUrl(c.env, c.req.raw, row.thumbnail_key)), 201)
})

// GET /tasks/:id
tasks.get("/:id", async (c) => {
  const row = await loadOwnedTask(c, c.req.param("id"))
  return c.json(serializeTask(row, buildFileUrl(c.env, c.req.raw, row.thumbnail_key)))
})

// PUT /tasks/:id
tasks.put("/:id", async (c) => {
  const existing = await loadOwnedTask(c, c.req.param("id"))
  let body: TaskInput
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }

  const sets: string[] = []
  const params: unknown[] = []

  if (body.no !== undefined) {
    sets.push("no = ?")
    params.push(validateNo(body.no))
  }
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      throw new HTTPException(400, { message: "Tiêu đề không hợp lệ." })
    }
    sets.push("title = ?")
    params.push(body.title.trim().slice(0, 300))
  }
  if (body.description !== undefined) {
    sets.push("description = ?")
    params.push(
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim().slice(0, 5000)
        : null,
    )
  }
  if (body.status !== undefined) {
    sets.push("status = ?")
    params.push(validateStatus(body.status))
  }
  if (body.priority !== undefined) {
    sets.push("priority = ?")
    params.push(validatePriority(body.priority))
  }
  if (body.assignee !== undefined) {
    sets.push("assignee = ?")
    params.push(
      typeof body.assignee === "string" && body.assignee.trim()
        ? body.assignee.trim().slice(0, 200)
        : null,
    )
  }
  if (body.tags !== undefined) {
    sets.push("tags = ?")
    params.push(validateTags(body.tags))
  }
  if (body.startDate !== undefined) {
    sets.push("start_date = ?")
    params.push(validateDate(body.startDate, "startDate"))
  }
  if (body.dueDate !== undefined) {
    sets.push("due_date = ?")
    params.push(validateDate(body.dueDate, "dueDate"))
  }
  if (body.thumbnailKey !== undefined) {
    sets.push("thumbnail_key = ?")
    params.push(
      typeof body.thumbnailKey === "string" && body.thumbnailKey.length > 0
        ? body.thumbnailKey.slice(0, 500)
        : null,
    )
  }
  if (sets.length === 0) {
    throw new HTTPException(400, { message: "Không có trường nào để cập nhật." })
  }

  const now = Date.now()
  sets.push("updated_at = ?")
  params.push(now)
  params.push(existing.id)

  try {
    await c.env.DB.prepare(`UPDATE tasks SET ${sets.join(", ")} WHERE id = ?`)
      .bind(...params)
      .run()
  } catch (e) {
    const msg = String((e as Error)?.message ?? "")
    if (msg.includes("UNIQUE") && msg.includes("project_id, no")) {
      throw new HTTPException(409, { message: "Số No đã tồn tại trong dự án." })
    }
    throw e
  }

  const row = await c.env.DB.prepare("SELECT * FROM tasks WHERE id = ?")
    .bind(existing.id)
    .first<TaskRow>()
  if (!row) throw new HTTPException(500, { message: "Update thất bại." })
  return c.json(serializeTask(row, buildFileUrl(c.env, c.req.raw, row.thumbnail_key)))
})

// DELETE /tasks/:id
tasks.delete("/:id", async (c) => {
  const existing = await loadOwnedTask(c, c.req.param("id"))
  await c.env.DB.prepare("DELETE FROM tasks WHERE id = ?").bind(existing.id).run()
  return c.json({ ok: true })
})

export default tasks
