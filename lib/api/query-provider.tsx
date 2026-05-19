"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

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

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
