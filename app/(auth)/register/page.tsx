"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Hệ thống đóng: tài khoản do admin tạo (trang Thành viên → Tạo tài khoản),
// không còn đăng ký công khai. Giữ route để link cũ không 404.
export default function RegisterPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/login")
  }, [router])
  return null
}
