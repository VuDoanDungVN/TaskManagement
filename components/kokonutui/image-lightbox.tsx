"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

interface ImageLightboxProps {
  src: string
  alt: string
  open: boolean
  onClose: () => void
  /** Có nhiều ảnh: truyền để hiện nút ‹ ›, phím ← →, vuốt trên mobile. */
  onPrev?: () => void
  onNext?: () => void
  /** Vd "2 / 5" */
  counter?: string
}

export default function ImageLightbox({
  src,
  alt,
  open,
  onClose,
  onPrev,
  onNext,
  counter,
}: ImageLightboxProps) {
  const { t } = useI18n()
  // Tránh hydration mismatch — chỉ portal sau khi đã mount client.
  const [mounted, setMounted] = useState(false)
  const touchX = useRef<number | null>(null)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowLeft") onPrev?.()
      else if (e.key === "ArrowRight") onNext?.()
    }
    window.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose, onPrev, onNext])

  if (!open || !mounted) return null

  const navBtn = cn(
    "absolute top-1/2 -translate-y-1/2 z-10",
    "inline-flex items-center justify-center w-10 h-10 rounded-full",
    "bg-white/10 hover:bg-white/20 text-white transition-colors",
  )

  // Portal vào document.body để overlay không bị giam trong ancestor có
  // transform/filter/backdrop-blur (Layout của kokonutui dùng backdrop-blur ở topnav).
  const node = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(e) => {
        const start = touchX.current
        touchX.current = null
        const end = e.changedTouches[0]?.clientX
        if (start == null || end == null) return
        const dx = end - start
        if (dx > 50) onPrev?.()
        else if (dx < -50) onNext?.()
      }}
      className={cn(
        "fixed inset-0 z-[100]",
        "w-screen h-screen",
        "bg-black/80 backdrop-blur-sm",
        "flex items-center justify-center",
        "p-4 sm:p-8",
      )}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("imageLightbox.close")}
        className={cn(
          "absolute top-3 right-3 z-10",
          "inline-flex items-center justify-center",
          "w-9 h-9 rounded-full",
          "bg-white/10 hover:bg-white/20",
          "text-white",
          "transition-colors",
        )}
      >
        <X className="w-5 h-5" />
      </button>
      {counter && (
        <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs tabular-nums">
          {counter}
        </span>
      )}
      {onPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          aria-label={t("taskImages.prev")}
          className={cn(navBtn, "left-2 sm:left-4")}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {onNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          aria-label={t("taskImages.next")}
          className={cn(navBtn, "right-2 sm:right-4")}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "max-w-full max-h-full",
          "object-contain",
          "rounded-lg shadow-2xl",
          "select-none",
        )}
      />
    </div>
  )

  return createPortal(node, document.body)
}
