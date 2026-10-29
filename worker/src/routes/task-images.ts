import { Hono, type Context } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppEnv } from "../types"
import { requireAuth } from "../auth-middleware"
import { requireTaskAccess } from "../access"
import { buildFileUrl, uuid } from "../utils"
import { mimeToExt, validateImageFile } from "./uploads"

/**
 * Ảnh của task (nhiều ảnh, có thứ tự). Mount tại /tasks:
 *   GET    /tasks/:id/images                 → danh sách theo thứ tự
 *   POST   /tasks/:id/images                 → upload 1..n ảnh (multipart, field "file")
 *   PUT    /tasks/:id/images/order           → đặt lại thứ tự { ids: string[] }
 *   DELETE /tasks/:id/images/:imageId        → xoá 1 ảnh
 * Ảnh position thấp nhất = ảnh đại diện; tasks.thumbnail_key luôn đồng bộ theo ảnh này.
 * Quyền: ai truy cập được project chứa task (admin hoặc thành viên).
 */

export const MAX_IMAGES_PER_TASK = 10

interface TaskImageRow {
  id: string
  task_id: string
  file_key: string
  mime_type: string | null
  file_size: number | null
  position: number
  created_at: number
}

function serializeImage(c: Context<AppEnv>, r: TaskImageRow) {
  return {
    id: r.id,
    url: buildFileUrl(c.env, c.req.raw, r.file_key),
    mimeType: r.mime_type,
    fileSize: r.file_size,
    position: r.position,
    createdAt: r.created_at,
  }
}

async function listImages(c: Context<AppEnv>, taskId: string) {
  const rs = await c.env.DB.prepare(
    "SELECT * FROM task_images WHERE task_id = ? ORDER BY position ASC, created_at ASC",
  )
    .bind(taskId)
    .all<TaskImageRow>()
  return rs.results ?? []
}

/** Đồng bộ tasks.thumbnail_key = ảnh đại diện (hoặc NULL nếu hết ảnh). */
function syncCoverStmt(c: Context<AppEnv>, taskId: string) {
  return c.env.DB.prepare(
    `UPDATE tasks SET
       thumbnail_key = (SELECT file_key FROM task_images WHERE task_id = ?
                        ORDER BY position ASC, created_at ASC LIMIT 1),
       updated_at = ?
     WHERE id = ?`,
  ).bind(taskId, Date.now(), taskId)
}

/** Xoá toàn bộ file R2 của các ảnh thuộc task — gọi TRƯỚC khi xoá task (DB tự CASCADE). */
export async function deleteTaskImageFiles(c: Context<AppEnv>, taskId: string): Promise<void> {
  const rows = await listImages(c, taskId)
  await Promise.all(rows.map((r) => c.env.FILES.delete(r.file_key).catch(() => {})))
}

const taskImages = new Hono<AppEnv>()
taskImages.use("*", requireAuth())

// GET /tasks/:id/images
taskImages.get("/:id/images", async (c) => {
  const taskId = c.req.param("id")
  await requireTaskAccess(c, taskId)
  const rows = await listImages(c, taskId)
  return c.json({ items: rows.map((r) => serializeImage(c, r)) })
})

// POST /tasks/:id/images — multipart, 1 hoặc nhiều field "file"
taskImages.post("/:id/images", async (c) => {
  const taskId = c.req.param("id")
  await requireTaskAccess(c, taskId)
  const user = c.get("user")

  let form: FormData
  try {
    form = await c.req.raw.formData()
  } catch {
    throw new HTTPException(400, { message: "Form data không hợp lệ." })
  }
  // Cùng cách thu file như comment attachments (tasks.ts): type của Workers khai báo
  // getAll() trả string[] nhưng runtime trả File cho field file.
  const files: File[] = []
  for (const entry of form.getAll("file")) {
    if (typeof entry !== "string") files.push(entry)
  }
  if (files.length === 0) {
    throw new HTTPException(400, { message: "Thiếu field 'file' (multipart/form-data)." })
  }
  // Validate hết trước khi upload → không để lại file rác khi 1 file sai
  for (const f of files) validateImageFile(f)

  const stat = await c.env.DB.prepare(
    "SELECT COUNT(*) AS n, COALESCE(MAX(position), -1) AS maxPos FROM task_images WHERE task_id = ?",
  )
    .bind(taskId)
    .first<{ n: number; maxPos: number }>()
  const current = stat?.n ?? 0
  if (current + files.length > MAX_IMAGES_PER_TASK) {
    throw new HTTPException(400, {
      message: `Mỗi task tối đa ${MAX_IMAGES_PER_TASK} ảnh (hiện có ${current}).`,
    })
  }

  const now = Date.now()
  let pos = (stat?.maxPos ?? -1) + 1
  const created: TaskImageRow[] = []
  const uploadedKeys: string[] = []
  try {
    for (const f of files) {
      const id = uuid()
      const key = `tasks/${taskId}/images/${id}.${mimeToExt(f.type)}`
      await c.env.FILES.put(key, f.stream(), { httpMetadata: { contentType: f.type } })
      uploadedKeys.push(key)
      created.push({
        id,
        task_id: taskId,
        file_key: key,
        mime_type: f.type,
        file_size: f.size,
        position: pos++,
        created_at: now,
      })
    }
    await c.env.DB.batch([
      ...created.map((r) =>
        c.env.DB.prepare(
          `INSERT INTO task_images (id, task_id, file_key, mime_type, file_size, position, created_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(r.id, r.task_id, r.file_key, r.mime_type, r.file_size, r.position, user.uid, r.created_at),
      ),
      syncCoverStmt(c, taskId),
    ])
  } catch (e) {
    // Rollback file đã đẩy lên R2 nếu DB lỗi
    await Promise.all(uploadedKeys.map((k) => c.env.FILES.delete(k).catch(() => {})))
    throw e
  }

  return c.json({ items: created.map((r) => serializeImage(c, r)) }, 201)
})

// PUT /tasks/:id/images/order — body { ids } phải chứa đúng toàn bộ ảnh hiện có của task
taskImages.put("/:id/images/order", async (c) => {
  const taskId = c.req.param("id")
  await requireTaskAccess(c, taskId)

  let body: { ids?: unknown }
  try {
    body = await c.req.json()
  } catch {
    throw new HTTPException(400, { message: "Body không phải JSON hợp lệ." })
  }
  if (!Array.isArray(body.ids) || !body.ids.every((x) => typeof x === "string")) {
    throw new HTTPException(400, { message: "ids phải là mảng string." })
  }
  const ids = body.ids as string[]
  const existing = await listImages(c, taskId)
  const existingIds = new Set(existing.map((r) => r.id))
  if (ids.length !== existing.length || new Set(ids).size !== ids.length || !ids.every((x) => existingIds.has(x))) {
    throw new HTTPException(400, { message: "Danh sách ảnh không khớp với ảnh hiện có của task." })
  }

  await c.env.DB.batch([
    ...ids.map((id, i) =>
      c.env.DB.prepare("UPDATE task_images SET position = ? WHERE id = ? AND task_id = ?").bind(i, id, taskId),
    ),
    syncCoverStmt(c, taskId),
  ])
  const rows = await listImages(c, taskId)
  return c.json({ items: rows.map((r) => serializeImage(c, r)) })
})

// DELETE /tasks/:id/images/:imageId
taskImages.delete("/:id/images/:imageId", async (c) => {
  const taskId = c.req.param("id")
  await requireTaskAccess(c, taskId)
  const row = await c.env.DB.prepare("SELECT * FROM task_images WHERE id = ? AND task_id = ?")
    .bind(c.req.param("imageId"), taskId)
    .first<TaskImageRow>()
  if (!row) throw new HTTPException(404, { message: "Không tìm thấy ảnh." })

  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM task_images WHERE id = ?").bind(row.id),
    syncCoverStmt(c, taskId),
  ])
  await c.env.FILES.delete(row.file_key).catch(() => {})
  return c.json({ ok: true })
})

export default taskImages
