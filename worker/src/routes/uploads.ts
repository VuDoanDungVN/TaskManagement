import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppEnv } from "../types"
import { requireAuth } from "../auth-middleware"
import { buildFileUrl } from "../utils"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

function mimeToExt(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/gif":
      return "gif"
    default:
      return "bin"
  }
}

function validateImageFile(file: File) {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new HTTPException(400, {
      message: `Định dạng không hỗ trợ: ${file.type}. Cho phép JPG/PNG/WEBP/GIF.`,
    })
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new HTTPException(413, { message: "File quá lớn (tối đa 5MB)." })
  }
}

async function extractFile(req: Request): Promise<File> {
  const form = await req.formData()
  const file = form.get("file")
  // FormDataEntryValue = string | File ; narrow ra File bằng cách loại string/null
  if (!file || typeof file === "string") {
    throw new HTTPException(400, { message: "Thiếu field 'file' (multipart/form-data)." })
  }
  validateImageFile(file)
  return file
}

const uploads = new Hono<AppEnv>()
uploads.use("*", requireAuth())

/**
 * POST /uploads/avatar
 * Body: multipart/form-data { file }
 * Response: { avatarKey, avatarUrl }
 */
uploads.post("/avatar", async (c) => {
  const user = c.get("user")
  const file = await extractFile(c.req.raw)
  const ext = mimeToExt(file.type)
  const key = `avatars/${user.uid}.${ext}`

  // Xoá ảnh cũ nếu extension khác (cùng extension thì R2 ghi đè)
  const existing = await c.env.DB.prepare("SELECT avatar_key FROM users WHERE id = ?")
    .bind(user.uid)
    .first<{ avatar_key: string | null }>()
  if (existing?.avatar_key && existing.avatar_key !== key) {
    await c.env.FILES.delete(existing.avatar_key).catch(() => {})
  }

  await c.env.FILES.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  })

  const now = Date.now()
  await c.env.DB.prepare("UPDATE users SET avatar_key = ?, updated_at = ? WHERE id = ?")
    .bind(key, now, user.uid)
    .run()

  return c.json({ avatarKey: key, avatarUrl: buildFileUrl(c.env, c.req.raw, key) })
})

/**
 * POST /uploads/projects/:projectId/thumbnail
 */
uploads.post("/projects/:projectId/thumbnail", async (c) => {
  const user = c.get("user")
  const projectId = c.req.param("projectId")

  const existing = await c.env.DB.prepare(
    "SELECT owner_id, thumbnail_key FROM projects WHERE id = ?",
  )
    .bind(projectId)
    .first<{ owner_id: string; thumbnail_key: string | null }>()
  if (!existing) throw new HTTPException(404, { message: "Không tìm thấy dự án." })
  if (existing.owner_id !== user.uid) {
    throw new HTTPException(403, { message: "Bạn không có quyền truy cập dự án này." })
  }

  const file = await extractFile(c.req.raw)
  const ext = mimeToExt(file.type)
  const key = `projects/${projectId}/thumbnail.${ext}`

  if (existing.thumbnail_key && existing.thumbnail_key !== key) {
    await c.env.FILES.delete(existing.thumbnail_key).catch(() => {})
  }
  await c.env.FILES.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  })

  const now = Date.now()
  await c.env.DB.prepare(
    "UPDATE projects SET thumbnail_key = ?, updated_at = ? WHERE id = ?",
  )
    .bind(key, now, projectId)
    .run()

  return c.json({ thumbnailKey: key, thumbnailUrl: buildFileUrl(c.env, c.req.raw, key) })
})

/**
 * POST /uploads/tasks/:taskId/thumbnail
 */
uploads.post("/tasks/:taskId/thumbnail", async (c) => {
  const user = c.get("user")
  const taskId = c.req.param("taskId")

  const existing = await c.env.DB.prepare(
    `SELECT t.thumbnail_key, p.owner_id
     FROM tasks t JOIN projects p ON p.id = t.project_id
     WHERE t.id = ?`,
  )
    .bind(taskId)
    .first<{ thumbnail_key: string | null; owner_id: string }>()
  if (!existing) throw new HTTPException(404, { message: "Không tìm thấy task." })
  if (existing.owner_id !== user.uid) {
    throw new HTTPException(403, { message: "Bạn không có quyền truy cập task này." })
  }

  const file = await extractFile(c.req.raw)
  const ext = mimeToExt(file.type)
  const key = `tasks/${taskId}/thumbnail.${ext}`

  if (existing.thumbnail_key && existing.thumbnail_key !== key) {
    await c.env.FILES.delete(existing.thumbnail_key).catch(() => {})
  }
  await c.env.FILES.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  })

  const now = Date.now()
  await c.env.DB.prepare(
    "UPDATE tasks SET thumbnail_key = ?, updated_at = ? WHERE id = ?",
  )
    .bind(key, now, taskId)
    .run()

  return c.json({ thumbnailKey: key, thumbnailUrl: buildFileUrl(c.env, c.req.raw, key) })
})

export default uploads
