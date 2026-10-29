"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Khối mở/đóng có hiệu ứng trượt mượt, không cần đo chiều cao bằng JS:
 * grid-template-rows chuyển 0fr ↔ 1fr (trình duyệt tự nội suy theo chiều cao thật),
 * kèm mờ dần + trượt nhẹ. Tôn trọng "giảm chuyển động" của hệ điều hành.
 * Nội dung luôn được render (để có thể animate khi đóng) nhưng bị ẩn khỏi
 * trình đọc màn hình và không focus được khi đang đóng.
 */
export default function Collapse({
  open,
  children,
  className,
}: {
  open: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div
      aria-hidden={!open}
      inert={!open}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="overflow-hidden min-h-0">
        <div
          className={cn(
            "transition-transform duration-300 ease-out motion-reduce:transition-none",
            open ? "translate-y-0" : "-translate-y-1",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
