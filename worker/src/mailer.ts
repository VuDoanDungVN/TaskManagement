import type { Bindings } from "./types"

interface InviteEmailParams {
  to: string
  teamName: string
  inviterName: string
  token: string
  role: string
}

/**
 * Gửi email mời tham gia nhóm qua Resend (HTTP API).
 * Trả về true nếu gửi thành công. KHÔNG throw — lỗi gửi mail không được
 * làm hỏng request tạo lời mời (lời mời đã lưu DB).
 */
export async function sendInviteEmail(
  env: Bindings,
  params: InviteEmailParams,
): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY chưa cấu hình — bỏ qua gửi email.")
    return false
  }

  const base = (env.APP_BASE_URL || "").replace(/\/$/, "")
  const acceptUrl = `${base}/invite?token=${encodeURIComponent(params.token)}`
  const from = env.MAIL_FROM || "Task App <onboarding@resend.dev>"

  const subject = `Bạn được mời tham gia nhóm "${params.teamName}"`
  const html = renderInviteHtml({ ...params, acceptUrl })
  const text =
    `${params.inviterName} đã mời bạn tham gia nhóm "${params.teamName}" ` +
    `với vai trò ${params.role}.\n\nNhấn vào link sau để chấp nhận:\n${acceptUrl}\n\n` +
    `Nếu bạn không mong đợi lời mời này, hãy bỏ qua email.`

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [params.to], subject, html, text }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error(`Resend gửi thất bại (${res.status}):`, body)
      return false
    }
    return true
  } catch (e) {
    console.error("Lỗi gọi Resend:", e)
    return false
  }
}

function renderInviteHtml(p: InviteEmailParams & { acceptUrl: string }): string {
  const safeTeam = escapeHtml(p.teamName)
  const safeInviter = escapeHtml(p.inviterName)
  return `<!DOCTYPE html>
<html lang="vi">
<body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:480px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
    <div style="padding:24px 28px;border-bottom:1px solid #f4f4f5;">
      <h1 style="margin:0;font-size:18px;color:#18181b;">Lời mời tham gia nhóm</h1>
    </div>
    <div style="padding:24px 28px;color:#3f3f46;font-size:14px;line-height:1.6;">
      <p style="margin:0 0 16px;"><strong>${safeInviter}</strong> đã mời bạn tham gia nhóm
      <strong>"${safeTeam}"</strong> với vai trò <strong>${escapeHtml(p.role)}</strong>.</p>
      <p style="margin:0 0 24px;">Nhấn nút bên dưới để chấp nhận lời mời:</p>
      <a href="${p.acceptUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;">Chấp nhận lời mời</a>
      <p style="margin:24px 0 0;font-size:12px;color:#a1a1aa;">Hoặc sao chép link: ${p.acceptUrl}</p>
      <p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;">Nếu bạn không mong đợi lời mời này, hãy bỏ qua email.</p>
    </div>
  </div>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
