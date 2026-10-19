"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { useAuth } from "@/lib/auth/context"

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Mặc định 60s. Các hook detail/comment tự override staleTime cao hơn
            // (5 phút) vì kết hợp optimistic update + invalidate có target,
            // không cần refetch định kỳ.
            staleTime: 60_000,
            // Giữ cache 10 phút sau khi không còn observer → quay lại trang
            // navigation gần đây không phải refetch.
            gcTime: 10 * 60_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              const status = (error as { status?: number })?.status
              // Không retry với 4xx (auth/permission/validation)
              if (status && status >= 400 && status < 500) return false
              return failureCount < 2
            },
          },
        },
      }),
  )

  // Query key (["projects"], ["users","me"]…) không gắn theo user → khi đổi tài khoản
  // (đăng xuất / đăng nhập người khác trên cùng trình duyệt) phải xoá sạch cache,
  // nếu không khách sẽ thấy danh sách dự án đã cache của người dùng trước.
  // useLayoutEffect chạy trước khi trình duyệt vẽ → không lộ dữ liệu cũ dù 1 frame.
  const { user, loading } = useAuth()
  const uid = loading ? undefined : (user?.uid ?? null)
  const lastUid = useRef<string | null | undefined>(undefined)
  useLayoutEffect(() => {
    if (uid === undefined || uid === lastUid.current) return
    if (lastUid.current !== undefined) client.clear()
    lastUid.current = uid
  }, [uid, client])

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
