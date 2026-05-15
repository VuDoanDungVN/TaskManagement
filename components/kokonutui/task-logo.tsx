import { cn } from "@/lib/utils"

export default function TaskLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
      aria-hidden
    >
      <rect
        width="32"
        height="32"
        rx="8"
        className="fill-zinc-900 dark:fill-zinc-50"
      />
      <path
        d="M9 16.5 L13.5 21 L23 11.5"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-white dark:stroke-zinc-900"
      />
    </svg>
  )
}
