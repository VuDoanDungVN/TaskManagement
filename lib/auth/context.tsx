"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth"
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client"

interface AuthState {
  user: User | null
  verified: boolean
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (params: { name: string; email: string; password: string }) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  sendVerification: () => Promise<void>
  reloadUser: () => Promise<boolean>
}

const AuthContext = createContext<AuthState | null>(null)

function translateFirebaseError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Email không hợp lệ."
    case "auth/email-already-in-use":
      return "Email này đã được đăng ký."
    case "auth/weak-password":
      return "Mật khẩu quá yếu (tối thiểu 6 ký tự)."
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email hoặc mật khẩu không đúng."
    case "auth/too-many-requests":
      return "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau."
    case "auth/network-request-failed":
      return "Lỗi mạng. Kiểm tra kết nối và thử lại."
    case "auth/operation-not-allowed":
      return "Phương thức đăng nhập chưa được bật trong Firebase Console."
    default:
      return "Đã xảy ra lỗi. Vui lòng thử lại."
  }
}

export class AuthError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

function wrapFirebaseError(e: unknown): AuthError {
  const code = (e as { code?: string })?.code ?? "unknown"
  return new AuthError(code, translateFirebaseError(code))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured()
  const [user, setUser] = useState<User | null>(null)
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }
    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setVerified(!!u?.emailVerified)
      setLoading(false)
    })
    return () => unsub()
  }, [configured])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const auth = getFirebaseAuth()
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e) {
      throw wrapFirebaseError(e)
    }
  }, [])

  const signUp = useCallback(
    async ({ name, email, password }: { name: string; email: string; password: string }) => {
      try {
        const auth = getFirebaseAuth()
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (cred.user) {
          if (name) {
            await updateProfile(cred.user, { displayName: name })
          }
          await sendEmailVerification(cred.user)
        }
      } catch (e) {
        throw wrapFirebaseError(e)
      }
    },
    [],
  )

  const signOut = useCallback(async () => {
    try {
      const auth = getFirebaseAuth()
      await fbSignOut(auth)
    } catch (e) {
      throw wrapFirebaseError(e)
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    try {
      const auth = getFirebaseAuth()
      await sendPasswordResetEmail(auth, email)
    } catch (e) {
      throw wrapFirebaseError(e)
    }
  }, [])

  const sendVerification = useCallback(async () => {
    try {
      const auth = getFirebaseAuth()
      if (!auth.currentUser) {
        throw new AuthError("auth/no-current-user", "Bạn cần đăng nhập để gửi email xác thực.")
      }
      await sendEmailVerification(auth.currentUser)
    } catch (e) {
      if (e instanceof AuthError) throw e
      throw wrapFirebaseError(e)
    }
  }, [])

  const reloadUser = useCallback(async () => {
    try {
      const auth = getFirebaseAuth()
      if (!auth.currentUser) return false
      // Force refresh ID token để emailVerified được cập nhật từ server
      // (chỉ gọi reload() đôi khi không đủ do token bị cache)
      await auth.currentUser.getIdToken(true)
      await auth.currentUser.reload()
      const v = !!auth.currentUser.emailVerified
      setUser(auth.currentUser)
      setVerified(v)
      return v
    } catch (e) {
      throw wrapFirebaseError(e)
    }
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user,
      verified,
      loading,
      configured,
      signIn,
      signUp,
      signOut,
      resetPassword,
      sendVerification,
      reloadUser,
    }),
    [
      user,
      verified,
      loading,
      configured,
      signIn,
      signUp,
      signOut,
      resetPassword,
      sendVerification,
      reloadUser,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>")
  return ctx
}
