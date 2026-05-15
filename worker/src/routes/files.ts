import { Hono } from "hono"
import type { AppEnv } from "../types"

/**
 * Proxy đọc ảnh từ R2 — dùng khi R2 bucket KHÔNG có public custom domain.
 * Nếu PUBLIC_FILES_BASE_URL đã set, frontend trỏ trực tiếp tới đó, route này
 * vẫn hoạt động như backup.
 */
const files = new Hono<AppEnv>()

// Cho phép key có nhiều segment (vd: projects/abc/thumbnail.jpg)
files.get("/:key{.+}", async (c) => {
  const key = c.req.param("key")
  const obj = await c.env.FILES.get(key)
  if (!obj) {
    return c.json({ error: "Not Found" }, 404)
  }

  const headers = new Headers()
  obj.writeHttpMetadata(headers)
  headers.set("etag", obj.httpEtag)
  // Cache 1 giờ (frontend immutable resources có thể tăng lên)
  headers.set("cache-control", "public, max-age=3600, must-revalidate")

  return new Response(obj.body, { headers })
})

export default files
