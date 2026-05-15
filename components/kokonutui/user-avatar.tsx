"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface UserAvatarProps {
  name: string
  src?: string
  size?: number
  className?: string
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  const first = parts[0][0]
  const last = parts[parts.length - 1][0]
  return (first + last).toUpperCase()
}

export default function UserAvatar({
  name,
  src,
  size = 32,
  className,
}: UserAvatarProps) {
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    setErrored(false)
  }, [src])

  const showImage = !!src && !errored

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden",
        "bg-zinc-900 dark:bg-zinc-50",
        "text-zinc-50 dark:text-zinc-900",
        "font-semibold select-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.38)),
      }}
      aria-label={name}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <span className="leading-none">{getInitials(name)}</span>
      )}
    </div>
  )
}
