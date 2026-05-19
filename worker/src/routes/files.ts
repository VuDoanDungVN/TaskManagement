import { Hono } from "hono"
import type { AppEnv } from "../types"

/**
 * Proxy đọc ảnh từ R2 — dùng khi R2 bucket KHÔNG có public custom domain.
 * Nếu PUBLIC_FILES_BASE_URL đã set, frontend trỏ trực tiếp tới đó, route này
 * vẫn hoạt động như backup.
 */
const files = new Hono<AppEnv>()

// Cho phép key có nhiều segment (vd: projects/abc/thumbnail.jpg)
// Query params:
//   ?download=1            → set Content-Disposition: attachment (force download)
//   ?filename=<encoded>    → override tên file khi tải về (mặc định lấy segment cuối)
files.get("/:key{.+}", async (c) => {
  const key = c.req.param("key")
  const obj = await c.env.FILES.get(key)
  if (!obj) {
    return c.json({ error: "Not Found" }, 404)
  }

  const headers = new Headers()
  obj.writeHttpMetadata(headers)
  headers.set("etag", obj.httpEtag)
  headers.set("cache-control", "public, max-age=3600, must-revalidate")

  const download = c.req.query("download") === "1"
  if (download) {
    const fnameRaw = c.req.query("filename")
    const filename = (fnameRaw && fnameRaw.trim()) || key.split("/").pop() || "file"
    // Bọc filename theo RFC 5987 để hỗ trợ ký tự ngoài ASCII
    const ascii = filename.replace(/[^\x20-\x7E]/g, "_")
    headers.set(
      "content-disposition",
      `attachment; filename="${ascii.replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    )
  }

  return new Response(obj.body, { headers })
})

export default files
