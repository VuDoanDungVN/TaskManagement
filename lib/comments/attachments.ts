// Whitelist phía client — phải khớp với worker/src/attachments.ts
export const ATTACHMENT_MAX_SIZE = 25 * 1024 * 1024 // 25 MB
export const ATTACHMENT_MAX_PER_COMMENT = 10

// `accept` cho <input type="file"> — vừa MIME vừa extension cho an toàn cross-browser
export const ATTACHMENT_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".svg",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".ppt",
  ".pptx",
  ".odt",
  ".ods",
  ".odp",
  ".pdf",
].join(",")

const BLOCKED_EXT = new Set([
  "exe", "bat", "cmd", "com", "msi", "scr", "ps1", "psm1", "sh", "bash",
  "vbs", "vbe", "js", "jse", "jar", "wsf", "wsh", "hta",
  "dll", "sys", "drv", "bin", "app", "dmg", "pkg", "apk", "deb", "rpm",
  "mp3", "wav", "flac", "ogg", "m4a", "aac", "wma", "opus", "aiff",
  "mp4", "mov", "avi", "mkv", "webm", "wmv", "flv", "m4v", "mpg", "mpeg", "3gp",
  "zip", "rar", "7z", "tar", "gz", "bz2",
])

const ALLOWED_EXT = new Set([
  "jpg", "jpeg", "png", "webp", "gif", "bmp", "svg",
  "doc", "docx",
  "xls", "xlsx", "csv",
  "ppt", "pptx",
  "odt", "ods", "odp",
  "pdf",
])

function getExt(name: string): string {
  const idx = name.lastIndexOf(".")
  if (idx < 0 || idx === name.length - 1) return ""
  return name.slice(idx + 1).toLowerCase()
}

/**
 * Kết quả validate file — `code` map vào i18n key `attachments.error<Code>`,
 * `params` truyền vào hàm `t(key, params)` để render thông báo localized.
 * Trả null nếu file hợp lệ.
 */
export type AttachmentCheckError =
  | { code: "Empty"; params: { name: string } }
  | { code: "TooLarge"; params: { name: string; limit: number } }
  | { code: "Blocked"; params: { ext: string } }
  | { code: "Unsupported"; params: { ext: string } }

export function checkAttachmentFile(f: File): AttachmentCheckError | null {
  if (f.size <= 0) return { code: "Empty", params: { name: f.name } }
  if (f.size > ATTACHMENT_MAX_SIZE) {
    return {
      code: "TooLarge",
      params: { name: f.name, limit: ATTACHMENT_MAX_SIZE / 1024 / 1024 },
    }
  }
  const ext = getExt(f.name)
  if (BLOCKED_EXT.has(ext)) {
    return { code: "Blocked", params: { ext } }
  }
  if (!ext || !ALLOWED_EXT.has(ext)) {
    return { code: "Unsupported", params: { ext: ext || "?" } }
  }
  return null
}

export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0 B"
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith("image/")
}

export function isPdfMime(mime: string): boolean {
  return mime === "application/pdf"
}

/**
 * Build URL force-download cho 1 attachment — luôn đi qua worker proxy /files/:key
 * vì R2 public custom domain (PUBLIC_FILES_BASE_URL) không respect query string.
 */
export function buildAttachmentDownloadUrl(
  apiUrl: string,
  fileKey: string,
  fileName: string,
): string {
  const base = apiUrl.replace(/\/$/, "")
  const keyPath = fileKey.split("/").map(encodeURIComponent).join("/")
  return `${base}/files/${keyPath}?download=1&filename=${encodeURIComponent(fileName)}`
}
