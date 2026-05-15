export type Bindings = {
  DB: D1Database
  FILES: R2Bucket
  FIREBASE_PROJECT_ID: string
  ALLOWED_ORIGIN: string
  PUBLIC_FILES_BASE_URL: string
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
