"use client"

import { cn } from "@/lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import type { ApiTaskImage } from "@/lib/api/tasks"
import ImageLightbox from "./image-lightbox"

/**
 * Thư viện ảnh của task (phương án A): ảnh lớn + dải ảnh nhỏ.
 * - ‹ › / vuốt trái-phải (mobile) để chuyển ảnh, bấm ảnh nhỏ để chọn.
 * - Bấm ảnh lớn → toàn màn hình (← → / Esc / vuốt).
 */
export default function TaskImageGallery({ images, alt }: { images: ApiTaskImage[]; alt: string }) {
  const { t } = useI18n()
  const [index, setIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const touchX = useRef<number | null>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  const total = images.length
  // Danh sách đổi (xoá/sắp xếp) → giữ index trong giới hạn
  useEffect(() => {
    if (index > total - 1) setIndex(Math.max(total - 1, 0))
  }, [index, total])

  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total])
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total])

  // Cuộn dải ảnh nhỏ để ảnh đang chọn luôn nằm trong khung nhìn
  useEffect(() => {
    const el = stripRef.current?.children[index] as HTMLElement | undefined
    el?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" })
  }, [index])

  if (total === 0) return null
  const current = images[Math.min(index, total - 1)]
  const counter = `${Math.min(index, total - 1) + 1} / ${total}`

  const navBtn = cn(
    "absolute top-1/2 -translate-y-1/2 z-10",
    "inline-flex items-center justify-center w-8 h-8 rounded-full",
    "bg-black/40 hover:bg-black/60 text-white transition-colors",
  )

  return (
    <div className="space-y-2 min-w-0">
      <div
        className="group/gallery relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(e) => {
          const start = touchX.current
          touchX.current = null
          const end = e.changedTouches[0]?.clientX
          if (total < 2 || start == null || end == null) return
          if (end - start > 40) prev()
          else if (end - start < -40) next()
        }}
      >
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          aria-label={t("taskImages.openFull")}
          title={t("taskImages.openFull")}
          className="absolute inset-0 w-full h-full cursor-zoom-in"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.url} alt={alt} className="w-full h-full object-contain select-none" draggable={false} />
        </button>

        <span className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/40 text-white opacity-0 group-hover/gallery:opacity-100 transition-opacity pointer-events-none">
          <Maximize2 className="w-3.5 h-3.5" />
        </span>

        {total > 1 && (
          <>
            <button type="button" onClick={prev} aria-label={t("taskImages.prev")} className={cn(navBtn, "left-2")}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button type="button" onClick={next} aria-label={t("taskImages.next")} className={cn(navBtn, "right-2")}>
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[11px] tabular-nums pointer-events-none">
              {counter}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        // Cuộn ngang chỉ trong dải ảnh nhỏ (không làm trang bị cuộn ngang)
        <div ref={stripRef} className="flex gap-2 overflow-x-auto pb-1 sidebar-scrollbar">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1} / ${total}`}
              aria-current={i === index}
              className={cn(
                "relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all",
                i === index
                  ? "border-zinc-900 dark:border-zinc-100"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}

      <ImageLightbox
        src={current.url}
        alt={alt}
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        onPrev={total > 1 ? prev : undefined}
        onNext={total > 1 ? next : undefined}
        counter={total > 1 ? counter : undefined}
      />
    </div>
  )
}
