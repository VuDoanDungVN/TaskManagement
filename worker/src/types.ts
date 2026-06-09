export type Bindings = {
  DB: D1Database
  FILES: R2Bucket
  FIREBASE_PROJECT_ID: string
  ALLOWED_ORIGIN: string
  PUBLIC_FILES_BASE_URL: string
  // Email (Resend)
  RESEND_API_KEY: string // secret — set bằng `wrangler secret put` hoặc .dev.vars
  MAIL_FROM: string // địa chỉ gửi đi, vd "Task App <onboarding@resend.dev>"
  APP_BASE_URL: string // base URL frontend để dựng link chấp nhận lời mời
}

// Authenticated user attached to context by auth middleware
export interface AuthUser {
  uid: string
  email: string
  emailVerified: boolean
  name?: string
}

export type Variables = {
  user: AuthUser
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}
