"use client"

import { useEffect, useRef, useState } from "react"
import { ImagePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n/context"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

interface FileInputProps {
  /** URL ảnh hiện tại (đã upload, dùng làm preview ban đầu) */
  currentUrl?: string | null
  /** Callback khi user chọn file mới (hoặc clear). file=null nếu user xoá */
  onFileChange: (file: File | null) => void
  /** Hiển thị tròn cho avatar */
  rounded?: boolean
  /** Kích thước preview (px) */
  size?: number
  className?: string
}

export default function FileInput({
  currentUrl,
  onFileChange,
  rounded = false,
  size = 96,
  className,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { t } = useI18n()

  // Cleanup blob URL khi unmount hoặc đổi
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const displayUrl = previewUrl ?? currentUrl ?? null

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null)
    const file = e.target.files?.[0]
    if (!file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      onFileChange(null)
      return
    }
    if (!ALLOWED_MIME.has(file.type)) {
      setError(t("fileInput.errorInvalidType"))
      e.target.value = ""
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t("fileInput.errorTooLarge"))
      e.target.value = ""
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const newUrl = URL.createObjectURL(file)
    setPreviewUrl(newUrl)
    onFileChange(file)
  }

  function handleClear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setError(null)
    onFileChange(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={t("fileInput.pickImage")}
        className={cn(
          "relative overflow-hidden shrink-0",
          rounded ? "rounded-full" : "rounded-lg",
          "bg-zinc-100 dark:bg-zinc-800",
          "border border-zinc-200 dark:border-zinc-700",
          "hover:border-zinc-300 dark:hover:border-zinc-600",
          "transition-colors",
          "flex items-center justify-center",
        )}
        style={{ width: size, height: size }}
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayUrl} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <ImagePlus className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
        )}
      </button>

      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "px-2.5 py-1.5 rounded-md text-[11px] font-medium",
              "bg-zinc-100 dark:bg-zinc-800",
              "text-zinc-900 dark:text-zinc-100",
              "hover:bg-zinc-200 dark:hover:bg-zinc-700",
              "transition-colors",
            )}
          >
            {displayUrl ? t("fileInput.changeImage") : t("fileInput.pickImage")}
          </button>
          {(previewUrl || currentUrl) && (
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1.5 rounded-md text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {t("fileInput.clear")}
            </button>
          )}
        </div>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-500">
          {t("fileInput.helper")}
        </p>
        {error && <p className="text-[11px] text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleSelect}
      />
    </div>
  )
}
