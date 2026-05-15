import type { Bindings } from "./types"

/**
 * Build URL truy cập ảnh từ R2 key.
 * - Nếu PUBLIC_FILES_BASE_URL được set (R2 custom domain hoặc public bucket) → trỏ thẳng
 * - Ngược lại → trả về URL proxy qua Worker (/files/:key)
 */
export function buildFileUrl(env: Bindings, request: Request, key: string | null | undefined) {
  if (!key) return null
  if (env.PUBLIC_FILES_BASE_URL) {
    const base = env.PUBLIC_FILES_BASE_URL.replace(/\/$/, "")
    return `${base}/${key}`
  }
  // Proxy fallback: cùng origin với Worker
  const origin = new URL(request.url).origin
  return `${origin}/files/${key}`
}

/** Sinh UUID v4 dùng crypto.randomUUID (built-in trên Workers) */
export function uuid() {
  return crypto.randomUUID()
}

/** Parse JSON body, throw HTTPException nếu fail */
export async function parseJson<T = unknown>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T
  } catch {
    throw new Error("Body không phải JSON hợp lệ.")
  }
}
