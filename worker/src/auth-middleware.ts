import type { MiddlewareHandler } from "hono"
import { HTTPException } from "hono/http-exception"
import { TokenVerifyError, verifyFirebaseToken } from "./firebase-auth"
import type { AppEnv } from "./types"

export interface AuthOptions {
  /** Yêu cầu email_verified=true. Default true. */
  requireVerified?: boolean
}

/**
 * Middleware xác thực Firebase ID token + tự sync user vào D1.
 * Sau khi pass, route handler có thể đọc `c.get("user")`.
 */
export function requireAuth(options: AuthOptions = {}): MiddlewareHandler<AppEnv> {
  const { requireVerified = true } = options

  return async (c, next) => {
    const authHeader = c.req.header("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Thiếu Authorization Bearer token." })
    }
    const token = authHeader.slice(7).trim()
    if (!token) {
      throw new HTTPException(401, { message: "Token rỗng." })
    }

    let payload
    try {
      payload = await verifyFirebaseToken(token, c.env.FIREBASE_PROJECT_ID)
    } catch (e) {
      if (e instanceof TokenVerifyError) {
        throw new HTTPException(401, { message: e.message })
      }
      throw e
    }

    if (requireVerified && !payload.emailVerified) {
      throw new HTTPException(403, { message: "Email chưa được xác thực." })
    }

    // Auto-sync user vào D1:
    // - INSERT lần đầu (gồm cả display_name từ Firebase)
    // - UPDATE email + email_verified mỗi lần (display_name giữ nguyên, để frontend chủ động cập nhật qua PUT /users/me)
    const now = Date.now()
    await c.env.DB.prepare(
      `INSERT INTO users (id, email, display_name, email_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         email_verified = excluded.email_verified,
         updated_at = excluded.updated_at`,
    )
      .bind(
        payload.uid,
        payload.email,
        payload.name ?? null,
        payload.emailVerified ? 1 : 0,
        now,
        now,
      )
      .run()

    c.set("user", payload)
    await next()
  }
}
