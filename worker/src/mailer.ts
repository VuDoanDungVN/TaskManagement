import { WorkerMailer } from "worker-mailer"
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
  const base = (env.APP_BASE_URL || "").replace(/\/$/, "")
  const acceptUrl = `${base}/invite?token=${encodeURIComponent(params.token)}`

  const subject = `Bạn được mời tham gia nhóm "${params.teamName}"`
  const html = renderInviteHtml({ ...params, acceptUrl })
  const text =
    `${params.inviterName} đã mời bạn tham gia nhóm "${params.teamName}" ` +
    `với vai trò ${params.role}.\n\nNhấn vào link sau để chấp nhận:\n${acceptUrl}\n\n` +
    `Nếu bạn không mong đợi lời mời này, hãy bỏ qua email.`

  return sendMail(env, params.to, subject, html, text)
}

interface AccountSetupEmailParams {
  to: string
  displayName: string | null
  setPasswordUrl: string
}

/**
 * Gửi email "tài khoản đã được tạo — hãy đặt mật khẩu" cho khách hàng.
 * KHÔNG throw — admin vẫn có thể copy link từ giao diện nếu gửi mail thất bại.
 */
export async function sendAccountSetupEmail(
  env: Bindings,
  params: AccountSetupEmailParams,
): Promise<boolean> {
  const base = (env.APP_BASE_URL || "").replace(/\/$/, "")
  const loginUrl = `${base}/login`
  const greeting = params.displayName ? `Xin chào ${params.displayName},` : "Xin chào,"
  const subject = "Tài khoản Task Management của bạn đã được tạo"
  const text =
    `${greeting}\n\nQuản trị viên đã tạo tài khoản cho bạn (${params.to}).\n` +
    `Hãy đặt mật khẩu tại link sau:\n${params.setPasswordUrl}\n\n` +
    `Sau đó đăng nhập tại: ${loginUrl}`
  const html = `<!DOCTYPE html>
<html lang="vi">
<body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:480px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
    <div style="padding:24px 28px;border-bottom:1px solid #f4f4f5;">
      <h1 style="margin:0;font-size:18px;color:#18181b;">Tài khoản của bạn đã sẵn sàng</h1>
    </div>
    <div style="padding:24px 28px;color:#3f3f46;font-size:14px;line-height:1.6;">
      <p style="margin:0 0 16px;">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 16px;">Quản trị viên đã tạo tài khoản cho email <strong>${escapeHtml(params.to)}</strong>.
      Nhấn nút bên dưới để đặt mật khẩu:</p>
      <a href="${params.setPasswordUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;">Đặt mật khẩu</a>
      <p style="margin:24px 0 0;font-size:13px;">Sau khi đặt mật khẩu, đăng nhập tại <a href="${loginUrl}">${escapeHtml(loginUrl)}</a></p>
      <p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;">Link đặt mật khẩu có hiệu lực trong thời gian giới hạn. Nếu hết hạn, hãy liên hệ quản trị viên để được gửi lại.</p>
    </div>
  </div>
</body>
</html>`
  return sendMail(env, params.to, subject, html, text)
}

async function sendMail(
  env: Bindings,
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<boolean> {
  // Ưu tiên Gmail SMTP (App Password); chưa cấu hình thì dùng Resend (cần domain đã xác minh)
  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    return sendViaGmail(env, to, subject, html, text)
  }
  if (!env.RESEND_API_KEY) {
    console.warn("Chưa cấu hình GMAIL_APP_PASSWORD hoặc RESEND_API_KEY — bỏ qua gửi email.")
    return false
  }
  return sendViaResend(env, to, subject, html, text)
}

/**
 * Gửi qua SMTP của Gmail (smtp.gmail.com:465, TLS) bằng App Password.
 * Yêu cầu: tài khoản GMAIL_USER bật xác minh 2 bước + tạo App Password tại
 * https://myaccount.google.com/apppasswords. Giới hạn ~500 người nhận/ngày (Gmail cá nhân).
 */
async function sendViaGmail(
  env: Bindings,
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<boolean> {
  const user = env.GMAIL_USER!.trim()
  try {
    await WorkerMailer.send(
      {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        authType: "plain",
        credentials: {
          username: user,
          // Google hiển thị App Password dạng "abcd efgh ijkl mnop" → bỏ khoảng trắng
          password: env.GMAIL_APP_PASSWORD!.replace(/\s+/g, ""),
        },
        socketTimeoutMs: 15_000,
        responseTimeoutMs: 15_000,
      },
      {
        // Gmail luôn gửi bằng địa chỉ của tài khoản đăng nhập SMTP
        from: { name: env.MAIL_FROM_NAME || "Task Management", email: user },
        to: { email: to },
        subject,
        html,
        text,
      },
    )
    return true
  } catch (e) {
    console.error("Gmail SMTP gửi thất bại:", e)
    return false
  }
}

async function sendViaResend(
  env: Bindings,
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<boolean> {
  const from = env.MAIL_FROM || "Task App <onboarding@resend.dev>"
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
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
