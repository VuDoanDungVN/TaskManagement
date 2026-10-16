/**
 * Firebase Auth Admin qua REST API (Identity Toolkit) + service account.
 * Không dùng firebase-admin SDK (không chạy được / quá nặng trên Workers).
 * Service account JSON lưu ở secret FIREBASE_SERVICE_ACCOUNT:
 *   wrangler secret put FIREBASE_SERVICE_ACCOUNT  (dán nguyên nội dung file .json)
 */
import { HTTPException } from "hono/http-exception"
import type { Bindings } from "./types"

interface ServiceAccount {
  client_email: string
  private_key: string
  project_id?: string
}

const TOKEN_URL = "https://oauth2.googleapis.com/token"
const SCOPES = [
  "https://www.googleapis.com/auth/identitytoolkit",
  "https://www.googleapis.com/auth/cloud-platform",
].join(" ")

let tokenCache: { token: string; expiresAt: number; email: string } | null = null

function parseServiceAccount(env: Bindings): ServiceAccount {
  if (!env.FIREBASE_SERVICE_ACCOUNT) {
    throw new HTTPException(500, {
      message: "Chưa cấu hình FIREBASE_SERVICE_ACCOUNT trên Worker.",
    })
  }
  try {
    const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT) as ServiceAccount
    if (!sa.client_email || !sa.private_key) throw new Error("missing fields")
    return sa
  } catch {
    throw new HTTPException(500, { message: "FIREBASE_SERVICE_ACCOUNT không phải JSON hợp lệ." })
  }
}

function base64UrlEncode(data: ArrayBuffer | Uint8Array | string): string {
  const bytes =
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : data instanceof Uint8Array
        ? data
        : new Uint8Array(data)
  let bin = ""
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\\n/g, "")
    .replace(/\s+/g, "")
  const der = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0))
  return crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  )
}

/** Lấy OAuth2 access token từ service account (cache tới khi gần hết hạn). */
async function getAccessToken(env: Bindings): Promise<string> {
  const sa = parseServiceAccount(env)
  if (tokenCache && tokenCache.email === sa.client_email && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.token
  }

  const now = Math.floor(Date.now() / 1000)
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const claims = base64UrlEncode(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPES,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  )
  const key = await importPrivateKey(sa.private_key)
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(`${header}.${claims}`),
  )
  const assertion = `${header}.${claims}.${base64UrlEncode(sig)}`

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  })
  if (!res.ok) {
    console.error("Google OAuth token lỗi:", res.status, await res.text())
    throw new HTTPException(502, { message: "Không lấy được access token từ Google (service account sai?)." })
  }
  const data = (await res.json()) as { access_token: string; expires_in: number }
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    email: sa.client_email,
  }
  return data.access_token
}

async function identityToolkit<T>(
  env: Bindings,
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const token = await getAccessToken(env)
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/${path}`
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    let code = ""
    try {
      code = (JSON.parse(text) as { error?: { message?: string } }).error?.message ?? ""
    } catch {
      /* ignore */
    }
    throw new FirebaseAdminError(code || `HTTP ${res.status}`, text)
  }
  return (await res.json()) as T
}

export class FirebaseAdminError extends Error {
  constructor(
    public code: string,
    public raw: string,
  ) {
    super(code)
    this.name = "FirebaseAdminError"
  }
}

/** Tìm Firebase user theo email. Trả về uid hoặc null. */
export async function findFirebaseUidByEmail(env: Bindings, email: string): Promise<string | null> {
  const data = await identityToolkit<{ users?: { localId: string }[] }>(env, "accounts:lookup", {
    email: [email],
  })
  return data.users?.[0]?.localId ?? null
}

/**
 * Tạo Firebase user (chưa có mật khẩu, email coi như đã xác thực vì admin tạo).
 * Nếu email đã tồn tại trên Firebase → dùng lại uid đó.
 */
export async function createOrGetFirebaseUser(
  env: Bindings,
  email: string,
  displayName: string | null,
): Promise<string> {
  try {
    const data = await identityToolkit<{ localId: string }>(env, "accounts", {
      email,
      emailVerified: true,
      ...(displayName ? { displayName } : {}),
    })
    return data.localId
  } catch (e) {
    if (e instanceof FirebaseAdminError && e.code.startsWith("EMAIL_EXISTS")) {
      const uid = await findFirebaseUidByEmail(env, email)
      if (uid) {
        // Đánh dấu verified để user đăng nhập được ngay sau khi đặt mật khẩu
        await identityToolkit(env, "accounts:update", { localId: uid, emailVerified: true })
        return uid
      }
    }
    throw e
  }
}

/** Sinh link đặt (lại) mật khẩu — trang xử lý do Firebase host. */
export async function generatePasswordResetLink(env: Bindings, email: string): Promise<string> {
  const data = await identityToolkit<{ oobLink?: string }>(env, "accounts:sendOobCode", {
    requestType: "PASSWORD_RESET",
    email,
    returnOobLink: true,
  })
  if (!data.oobLink) throw new FirebaseAdminError("NO_OOB_LINK", JSON.stringify(data))
  return data.oobLink
}

/** Khoá / mở khoá tài khoản trên Firebase (chặn cả việc lấy token mới). */
export async function setFirebaseUserDisabled(
  env: Bindings,
  uid: string,
  disabled: boolean,
): Promise<void> {
  await identityToolkit(env, "accounts:update", { localId: uid, disableUser: disabled })
}

export function isFirebaseAdminConfigured(env: Bindings): boolean {
  return !!env.FIREBASE_SERVICE_ACCOUNT
}
