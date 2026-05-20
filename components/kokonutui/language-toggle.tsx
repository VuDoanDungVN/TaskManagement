"use client"

import { Languages, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

export default function LanguageToggle() {
  const { locale, setLocale, locales, t } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("topnav.language")}
          title={t("topnav.language")}
          className="relative p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-full transition-colors"
        >
          <Languages className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          <span className="sr-only">{t("topnav.language")}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs">{t("topnav.language")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locales.map((l) => {
          const active = l.code === locale
          return (
            <DropdownMenuItem
              key={l.code}
              onClick={() => setLocale(l.code)}
              className={cn(
                "cursor-pointer text-sm flex items-center justify-between",
                active && "font-medium",
              )}
            >
              <span>{l.nativeName}</span>
              {active && <Check className="w-3.5 h-3.5 text-zinc-500" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
