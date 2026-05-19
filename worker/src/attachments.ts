import { HTTPException } from "hono/http-exception"

export const ATTACHMENT_MAX_SIZE = 25 * 1024 * 1024 // 25 MB
export const ATTACHMENT_MAX_PER_COMMENT = 10

// MIME được phép — ảnh + Office (Microsoft, OpenDocument) + PDF
const ALLOWED_MIME = new Set([
  // Ảnh
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
  // Microsoft Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Microsoft Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  // Microsoft PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // OpenDocument
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  // PDF
  "application/pdf",
])

// Whitelist extension (kèm thêm "rào" thứ hai phòng trường hợp browser set MIME sai)
const ALLOWED_EXT = new Set([
  "jpg", "jpeg", "png", "webp", "gif", "bmp", "svg",
  "doc", "docx",
  "xls", "xlsx", "csv",
  "ppt", "pptx",
  "odt", "ods", "odp",
  "pdf",
])

// Blocklist tuyệt đối — kể cả khi MIME generic (application/octet-stream)
const BLOCKED_EXT = new Set([
  // Executables
  "exe", "bat", "cmd", "com", "msi", "scr", "ps1", "psm1", "sh", "bash",
  "vbs", "vbe", "js", "jse", "jar", "wsf", "wsh", "hta",
  "dll", "sys", "drv", "bin", "app", "dmg", "pkg", "apk", "deb", "rpm",
  // Audio
  "mp3", "wav", "flac", "ogg", "m4a", "aac", "wma", "opus", "aiff",
  // Video
  "mp4", "mov", "avi", "mkv", "webm", "wmv", "flv", "m4v", "mpg", "mpeg", "3gp",
  // Archives (có thể chứa exe) — chặn để chắc
  "zip", "rar", "7z", "tar", "gz", "bz2",
])

function getExt(name: string): string {
  const idx = name.lastIndexOf(".")
  if (idx < 0 || idx === name.length - 1) return ""
  return name.slice(idx + 1).toLowerCase()
}

/** Chuẩn hoá tên file để dùng làm phần cuối của R2 key — giữ ASCII an toàn. */
export function sanitizeFileName(name: string): string {
  const trimmed = name.trim().slice(0, 200)
  // Bỏ separator path + ký tự đặc biệt
  return trimmed.replace(/[^\w.\-]+/g, "_").replace(/_+/g, "_") || "file"
}

export function validateAttachmentFile(file: File): void {
  if (file.size <= 0) {
    throw new HTTPException(400, { message: `File "${file.name}" rỗng.` })
  }
  if (file.size > ATTACHMENT_MAX_SIZE) {
    throw new HTTPException(413, {
      message: `File "${file.name}" vượt giới hạn ${ATTACHMENT_MAX_SIZE / 1024 / 1024}MB.`,
    })
  }
  const ext = getExt(file.name)
  if (BLOCKED_EXT.has(ext)) {
    throw new HTTPException(400, {
      message: `Định dạng .${ext} không được phép (chỉ chấp nhận ảnh và file Office/PDF).`,
    })
  }
  if (!ext || !ALLOWED_EXT.has(ext)) {
    throw new HTTPException(400, {
      message: `Định dạng .${ext || "?"} không được hỗ trợ. Chỉ chấp nhận ảnh và file Office/PDF.`,
    })
  }
  if (!ALLOWED_MIME.has(file.type)) {
    throw new HTTPException(400, {
      message: `MIME "${file.type || "?"}" của file "${file.name}" không được hỗ trợ.`,
    })
  }
}
