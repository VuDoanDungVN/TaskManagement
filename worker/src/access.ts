import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppEnv } from "./types"

/**
 * Phân quyền theo dự án:
 * - Admin hệ thống: truy cập mọi project.
 * - Customer: chỉ project có dòng trong project_members.
 * Quản lý project (sửa thông tin, xoá, gán thành viên) chỉ admin — dùng requireSystemAdmin.
 */

export function isAdmin(c: Context<AppEnv>): boolean {
  return c.get("user").role === "admin"
}

/** SQL fragment lọc project user được xem. Alias project phải là `p`. Bind: [isAdmin ? 1 : 0, uid]. */
export const PROJECT_ACCESS_SQL =
  "(? = 1 OR EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = ?))"

export function projectAccessBinds(c: Context<AppEnv>): [number, string] {
  return [isAdmin(c) ? 1 : 0, c.get("user").uid]
}

/** Ném 404 nếu project không tồn tại, 403 nếu user không phải admin và không là thành viên. */
export async function requireProjectAccess(
  c: Context<AppEnv>,
  projectId: string,
): Promise<void> {
  const row = await c.env.DB.prepare(
    `SELECT p.id, ${PROJECT_ACCESS_SQL} AS allowed FROM projects p WHERE p.id = ?`,
  )
    .bind(...projectAccessBinds(c), projectId)
    .first<{ id: string; allowed: number }>()
  if (!row) throw new HTTPException(404, { message: "Không tìm thấy dự án." })
  if (!row.allowed) {
    throw new HTTPException(403, { message: "Bạn không có quyền truy cập dự án này." })
  }
}

/** Kiểm tra quyền truy cập project chứa task. Trả về project_id của task. */
export async function requireTaskAccess(
  c: Context<AppEnv>,
  taskId: string,
): Promise<string> {
  const row = await c.env.DB.prepare(
    `SELECT t.project_id, ${PROJECT_ACCESS_SQL} AS allowed
     FROM tasks t JOIN projects p ON p.id = t.project_id
     WHERE t.id = ?`,
  )
    .bind(...projectAccessBinds(c), taskId)
    .first<{ project_id: string; allowed: number }>()
  if (!row) throw new HTTPException(404, { message: "Không tìm thấy task." })
  if (!row.allowed) {
    throw new HTTPException(403, { message: "Bạn không có quyền truy cập task này." })
  }
  return row.project_id
}
