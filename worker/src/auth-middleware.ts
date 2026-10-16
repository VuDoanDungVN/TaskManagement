import type { Context, MiddlewareHandler } from "hono"
import { HTTPException } from "hono/http-exception"
import { TokenVerifyError, verifyFirebaseToken } from "./firebase-auth"
import type { AppEnv, SystemRole, UserStatus } from "./types"

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

    // Email này có nằm trong danh sách admin hệ thống không?
    const adminEmails = (c.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
    const isAdminEmail = adminEmails.includes(payload.email.toLowerCase())

    // Hệ thống đóng: chỉ tài khoản do admin tạo (đã có dòng trong bảng users) mới dùng được.
    // Ngoại lệ: email thuộc ADMIN_EMAILS được tự tạo lần đầu với role 'admin'.
    const existing = await c.env.DB.prepare("SELECT role, status FROM users WHERE id = ?")
      .bind(payload.uid)
      .first<{ role: SystemRole; status: UserStatus }>()

    if (!existing && !isAdminEmail) {
      throw new HTTPException(403, {
        message: "Tài khoản chưa được cấp quyền truy cập. Vui lòng liên hệ quản trị viên.",
      })
    }
    if (existing?.status === "disabled") {
      throw new HTTPException(403, { message: "Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên." })
    }

    // Sync email + email_verified mỗi lần; role chỉ NÂNG lên 'admin' theo ADMIN_EMAILS, không tự hạ cấp.
    const now = Date.now()
    await c.env.DB.prepare(
      `INSERT INTO users (id, email, display_name, email_verified, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         email_verified = excluded.email_verified,
         role = CASE WHEN ? = 1 THEN 'admin' ELSE users.role END,
         updated_at = excluded.updated_at`,
    )
      .bind(
        payload.uid,
        payload.email,
        payload.name ?? null,
        payload.emailVerified ? 1 : 0,
        isAdminEmail ? "admin" : "user",
        now,
        now,
        isAdminEmail ? 1 : 0,
      )
      .run()

    const role: SystemRole = isAdminEmail || existing?.role === "admin" ? "admin" : "user"
    c.set("user", { ...payload, role })
    await next()
  }
}

/**
 * Yêu cầu user là admin hệ thống. Gọi SAU khi requireAuth đã chạy.
 * Trả về AuthUser nếu hợp lệ, ném 403 nếu không.
 */
export function requireSystemAdmin(c: Context<AppEnv>) {
  const user = c.get("user")
  if (user.role !== "admin") {
    throw new HTTPException(403, { message: "Cần quyền quản trị hệ thống (admin)." })
  }
  return user
}

/** Middleware: toàn bộ route phía sau chỉ dành cho admin hệ thống. Đặt SAU requireAuth. */
export const adminOnly: MiddlewareHandler<AppEnv> = async (c, next) => {
  requireSystemAdmin(c)
  await next()
}
