"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

interface ImageLightboxProps {
  src: string
  alt: string
  open: boolean
  onClose: () => void
}

export default function ImageLightbox({ src, alt, open, onClose }: ImageLightboxProps) {
  const { t } = useI18n()
  // Tránh hydration mismatch — chỉ portal sau khi đã mount client.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open || !mounted) return null

  // Portal vào document.body để overlay không bị giam trong ancestor có
  // transform/filter/backdrop-blur (Layout của kokonutui dùng backdrop-blur ở topnav).
  const node = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
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
