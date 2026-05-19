import { Hono, type Context } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppEnv } from "../types"
import { requireAuth } from "../auth-middleware"
import { buildFileUrl, uuid } from "../utils"
import {
  COMMENT_SELECT,
  serializeComment,
  validateCommentBody,
  type CommentRow,
} from "./comments"
import {
  ATTACHMENT_MAX_PER_COMMENT,
  sanitizeFileName,
  validateAttachmentFile,
} from "../attachments"

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
  comment_count: number | null
}

// SELECT base kèm subquery đếm comment — dùng cho mọi route đọc task
const TASK_SELECT = `SELECT t.*,
  (SELECT COUNT(*) FROM task_comments WHERE task_id = t.id) AS comment_count
FROM tasks t`

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
    commentCount: row.comment_count ?? 0,
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
    `${TASK_SELECT}
     JOIN projects p ON p.id = t.project_id
     WHERE t.id = ? AND p.owner_id = ?`,
  )
    .bind(id, user.uid)
    .first<TaskRow>()
  if (!row) throw new HTTPException(404, { message: "Không tìm thấy task." })
  return row
}

// Bất kỳ user đã đăng nhập nào cũng có thể xem task qua trang chi tiết (cho phép
// bình luận khi biết link). Helper này chỉ check task tồn tại, KHÔNG check ownership.
async function loadTaskById(
  c: Context<AppEnv>,
  id: string,
): Promise<TaskRow> {
  const row = await c.env.DB.prepare(`${TASK_SELECT} WHERE t.id = ?`)
    .bind(id)
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
    `${TASK_SELECT} WHERE t.project_id = ? ORDER BY t.updated_at DESC`,
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

  const row = await c.env.DB.prepare(`${TASK_SELECT} WHERE t.id = ?`)
    .bind(id)
    .first<TaskRow>()
  if (!row) throw new HTTPException(500, { message: "Tạo task thất bại." })
  return c.json(serializeTask(row, buildFileUrl(c.env, c.req.raw, row.thumbnail_key)), 201)
})

// GET /tasks/:id — bất kỳ user đăng nhập nào cũng xem được (cho chức năng comment)
tasks.get("/:id", async (c) => {
  const row = await loadTaskById(c, c.req.param("id"))
  return c.json(serializeTask(row, buildFileUrl(c.env, c.req.raw, row.thumbnail_key)))
})

// GET /tasks/:id/comments — list bình luận của task
tasks.get("/:id/comments", async (c) => {
  const taskId = c.req.param("id")
  await loadTaskById(c, taskId)
  const rs = await c.env.DB.prepare(
    `${COMMENT_SELECT} WHERE c.task_id = ? ORDER BY c.created_at ASC`,
  )
    .bind(taskId)
    .all<CommentRow>()
  const items = (rs.results ?? []).map((r) =>
    serializeComment(
      r,
      buildFileUrl(c.env, c.req.raw, r.author_avatar_key),
      c.env,
      c.req.raw,
    ),
  )
  return c.json({ items })
})

interface ParsedCommentInput {
  body: string
  parentIdRaw: string | null
  files: File[]
}

async function parseCommentInput(c: Context<AppEnv>): Promise<ParsedCommentInput> {
  const contentType = c.req.header("content-type") ?? ""
  if (contentType.startsWith("multipart/form-data")) {
    let form: FormData
    try {
      form = await c.req.raw.formData()
    } catch {
      throw new HTTPException(400, { message: "Form data không hợp lệ." })
    }
    const bodyRaw = form.get("body")
    const parentIdRaw = form.get("parentId")
    const files: File[] = []
    for (const entry of form.getAll("file")) {
      if (typeof entry !== "string") files.push(entry)
    }
    return {
      body: validateCommentBody(bodyRaw),
      parentIdRaw: typeof parentIdRaw === "string" && parentIdRaw ? parentIdRaw : null,
      files,
    }
  }
  // Fallback JSON (text-only)
  let json: { body?: unknown; parentId?: unknown }
  try {
    json = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }
  return {
    body: validateCommentBody(json.body),
    parentIdRaw:
      typeof json.parentId === "string" && json.parentId ? json.parentId : null,
    files: [],
  }
}

// POST /tasks/:id/comments — tạo bình luận (hoặc reply, model 1 cấp), có thể đính kèm file
tasks.post("/:id/comments", async (c) => {
  const taskId = c.req.param("id")
  await loadTaskById(c, taskId)
  const user = c.get("user")

  const { body: text, parentIdRaw, files } = await parseCommentInput(c)

  if (files.length > ATTACHMENT_MAX_PER_COMMENT) {
    throw new HTTPException(400, {
      message: `Tối đa ${ATTACHMENT_MAX_PER_COMMENT} file đính kèm mỗi bình luận.`,
    })
  }
  // Validate trước khi insert DB / upload R2 — fail-fast, không để lại rác
  for (const f of files) validateAttachmentFile(f)

  // Xử lý reply: client truyền parentId là id của comment đang được trả lời (root
  // hoặc reply). Server flatten về root để giữ thread đúng 1 cấp; reply_to_id giữ
  // nguyên id client gửi để UI hiện "↳ @tên".
  let parentId: string | null = null
  let replyToId: string | null = null
  if (parentIdRaw) {
    const target = await c.env.DB.prepare(
      "SELECT id, task_id, parent_id FROM task_comments WHERE id = ?",
    )
      .bind(parentIdRaw)
      .first<{ id: string; task_id: string; parent_id: string | null }>()
    if (!target) {
      throw new HTTPException(404, { message: "Bình luận cha không tồn tại." })
    }
    if (target.task_id !== taskId) {
      throw new HTTPException(400, { message: "Bình luận cha không thuộc task này." })
    }
    parentId = target.parent_id ?? target.id
    replyToId = target.id
  }

  const id = uuid()
  const now = Date.now()
  await c.env.DB.prepare(
    `INSERT INTO task_comments
       (id, task_id, author_id, body, parent_id, reply_to_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, taskId, user.uid, text, parentId, replyToId, now, now)
    .run()

  // Upload từng file lên R2 + insert attachment row.
  // Lưu key của file đã upload để rollback nếu DB insert fail.
  const uploadedKeys: string[] = []
  try {
    for (const f of files) {
      const attId = uuid()
      const safeName = sanitizeFileName(f.name)
      const key = `comments/${id}/${attId}-${safeName}`
      await c.env.FILES.put(key, f.stream(), {
        httpMetadata: { contentType: f.type },
      })
      uploadedKeys.push(key)
      await c.env.DB.prepare(
        `INSERT INTO comment_attachments
           (id, comment_id, file_key, file_name, file_size, mime_type, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(attId, id, key, f.name.slice(0, 200), f.size, f.type, now)
        .run()
    }
  } catch (e) {
    // Rollback: xoá file đã upload + comment vừa tạo
    await Promise.all(uploadedKeys.map((k) => c.env.FILES.delete(k).catch(() => {})))
    await c.env.DB.prepare("DELETE FROM task_comments WHERE id = ?").bind(id).run()
    throw e
  }

  const row = await c.env.DB.prepare(`${COMMENT_SELECT} WHERE c.id = ?`)
    .bind(id)
    .first<CommentRow>()
  if (!row) throw new HTTPException(500, { message: "Tạo bình luận thất bại." })
  return c.json(
    serializeComment(
      row,
      buildFileUrl(c.env, c.req.raw, row.author_avatar_key),
      c.env,
      c.req.raw,
    ),
    201,
  )
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

  const row = await c.env.DB.prepare(`${TASK_SELECT} WHERE t.id = ?`)
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
