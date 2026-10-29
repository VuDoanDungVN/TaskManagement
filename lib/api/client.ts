import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client"

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8787"

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

interface RequestOptions extends Omit<RequestInit, "headers"> {
  /** Nếu false, không gắn Authorization header. Default true. */
  auth?: boolean
  headers?: Record<string, string>
}

async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null
  if (!isFirebaseConfigured()) return null
  const auth = getFirebaseAuth()
  if (!auth.currentUser) return null
  try {
    return await auth.currentUser.getIdToken()
  } catch {
    return null
  }
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true, headers = {}, body, ...rest } = options
  const finalHeaders: Record<string, string> = { ...headers }

  if (auth) {
    const token = await getAuthToken()
    if (token) finalHeaders.Authorization = `Bearer ${token}`
  }

  if (
    body &&
    typeof body === "string" &&
    !finalHeaders["Content-Type"] &&
    !finalHeaders["content-type"]
  ) {
    finalHeaders["Content-Type"] = "application/json"
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    body,
    headers: finalHeaders,
  })

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const errBody = (await res.json()) as { message?: string; error?: string }
      if (errBody?.message) message = errBody.message
      else if (errBody?.error) message = errBody.error
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/**
 * Upload multipart có báo tiến trình (0–1). fetch() không có upload progress nên dùng XHR.
 * Lỗi HTTP ném ApiError giống apiRequest.
 */
export async function uploadWithProgress<T = unknown>(
  path: string,
  form: FormData,
  onProgress?: (fraction: number) => void,
): Promise<T> {
  const token = await getAuthToken()
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${API_URL}${path}`)
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total)
    }
    xhr.onload = () => {
      let body: unknown = null
      try {
        body = JSON.parse(xhr.responseText)
      } catch {
        // ignore
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1)
        resolve(body as T)
      } else {
        const err = body as { message?: string; error?: string } | null
        reject(new ApiError(xhr.status, err?.message || err?.error || `HTTP ${xhr.status}`))
      }
    }
    xhr.onerror = () => reject(new ApiError(0, "Lỗi mạng khi upload."))
    xhr.send(form)
  })
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "GET" }),

  post: <T>(path: string, body: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "POST", body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "PUT", body: JSON.stringify(body) }),

  del: <T>(path: string, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "DELETE" }),

  upload: <T>(path: string, form: FormData, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: "POST", body: form }),
}
