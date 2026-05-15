/**
 * Verify Firebase ID token (JWT, RS256) qua Google's JWKS.
 * Không cần firebase-admin SDK (heavy + chậm cold start trên Workers).
 * Tham khảo: https://firebase.google.com/docs/auth/admin/verify-id-tokens
 */

interface FirebaseJWK {
  kty: string
  kid: string
  alg: string
  use: string
  n: string
  e: string
}

interface FirebaseJWKS {
  keys: FirebaseJWK[]
}

const JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
const JWKS_CACHE_TTL_MS = 60 * 60 * 1000 // 1 giờ

let cache: { keys: Map<string, CryptoKey>; expiresAt: number } | null = null

async function fetchJWKS(): Promise<Map<string, CryptoKey>> {
  if (cache && cache.expiresAt > Date.now()) return cache.keys

  const res = await fetch(JWKS_URL)
  if (!res.ok) {
    throw new Error(`Không tải được Firebase JWKS: HTTP ${res.status}`)
  }
  const jwks = (await res.json()) as FirebaseJWKS

  const keys = new Map<string, CryptoKey>()
  for (const jwk of jwks.keys) {
    const cryptoKey = await crypto.subtle.importKey(
      "jwk",
      jwk as JsonWebKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    )
    keys.set(jwk.kid, cryptoKey)
  }
  cache = { keys, expiresAt: Date.now() + JWKS_CACHE_TTL_MS }
  return keys
}

function base64UrlToBytes(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/")
  const padding = (4 - (padded.length % 4)) % 4
  const base64 = padded + "=".repeat(padding)
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function base64UrlToString(str: string): string {
  return new TextDecoder().decode(base64UrlToBytes(str))
}

export interface FirebaseTokenPayload {
  uid: string
  email: string
  emailVerified: boolean
  name?: string
}

export class TokenVerifyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "TokenVerifyError"
  }
}

/**
 * Verify Firebase ID token. Throws TokenVerifyError nếu token sai.
 */
export async function verifyFirebaseToken(
  token: string,
  projectId: string,
): Promise<FirebaseTokenPayload> {
  const parts = token.split(".")
  if (parts.length !== 3) {
    throw new TokenVerifyError("Token JWT không hợp lệ (format).")
  }
  const [headerB64, payloadB64, signatureB64] = parts

  let header: { alg?: string; kid?: string }
  let payload: Record<string, unknown>
  try {
    header = JSON.parse(base64UrlToString(headerB64))
    payload = JSON.parse(base64UrlToString(payloadB64))
  } catch {
    throw new TokenVerifyError("Token JWT không decode được.")
  }

  if (header.alg !== "RS256") {
    throw new TokenVerifyError(`Thuật toán không hỗ trợ: ${header.alg}`)
  }
  if (!header.kid) {
    throw new TokenVerifyError("Token thiếu kid header.")
  }

  const keys = await fetchJWKS()
  const key = keys.get(header.kid)
  if (!key) {
    throw new TokenVerifyError(`Không tìm thấy public key cho kid: ${header.kid}`)
  }

  // Verify signature
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  const signature = base64UrlToBytes(signatureB64)
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    signature,
    data,
  )
  if (!valid) {
    throw new TokenVerifyError("Chữ ký JWT không hợp lệ.")
  }

  // Verify claims
  const now = Math.floor(Date.now() / 1000)
  const exp = payload.exp as number | undefined
  const iat = payload.iat as number | undefined
  const iss = payload.iss as string | undefined
  const aud = payload.aud as string | undefined
  const sub = payload.sub as string | undefined

  if (typeof exp !== "number" || exp < now) {
    throw new TokenVerifyError("Token đã hết hạn.")
  }
  if (typeof iat !== "number" || iat > now + 60) {
    throw new TokenVerifyError("Token có iat trong tương lai (đồng hồ lệch).")
  }
  const expectedIss = `https://securetoken.google.com/${projectId}`
  if (iss !== expectedIss) {
    throw new TokenVerifyError(`Issuer không khớp: ${iss}`)
  }
  if (aud !== projectId) {
    throw new TokenVerifyError(`Audience không khớp: ${aud}`)
  }
  if (typeof sub !== "string" || !sub) {
    throw new TokenVerifyError("Token thiếu sub (UID).")
  }

  return {
    uid: sub,
    email: (payload.email as string | undefined) ?? "",
    emailVerified: payload.email_verified === true,
    name: payload.name as string | undefined,
  }
}
