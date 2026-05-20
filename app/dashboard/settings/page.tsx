"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Check, FolderKanban, Languages, Monitor, Moon, Settings as SettingsIcon, Sun } from "lucide-react"
import Layout from "@/components/kokonutui/layout"
import { useI18n } from "@/lib/i18n/context"
import type { LocaleCode } from "@/lib/i18n/types"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { t, locale, setLocale, locales } = useI18n()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const themeOptions: { value: string; labelKey: "settings.themeLight" | "settings.themeDark" | "settings.themeSystem"; icon: typeof Sun }[] = [
    { value: "light", labelKey: "settings.themeLight", icon: Sun },
    { value: "dark", labelKey: "settings.themeDark", icon: Moon },
    { value: "system", labelKey: "settings.themeSystem", icon: Monitor },
  ]

  return (
    <Layout
      breadcrumbs={[
        { label: t("breadcrumbs.dashboard"), href: "/dashboard", icon: FolderKanban },
        { label: t("breadcrumbs.settings"), icon: SettingsIcon },
      ]}
    >
      <div className="space-y-4 max-w-3xl">
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-6">
          <div className="mb-1 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {t("settings.title")}
            </h1>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {t("settings.subtitle")}
          </p>
        </div>

        {/* Appearance */}
        <section className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-6">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            {t("settings.sectionAppearance")}
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
            {t("settings.theme")}
          </p>
          <div className="grid grid-cols-3 gap-2 max-w-md">
            {themeOptions.map((opt) => {
              const active = mounted && theme === opt.value
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg",
                    "border transition-colors text-xs font-medium",
                    active
                      ? "border-zinc-900 dark:border-zinc-50 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {t(opt.labelKey)}
                </button>
              )
            })}
          </div>
        </section>

        {/* Language */}
        <section className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-6">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
            <Languages className="w-4 h-4" />
            {t("settings.sectionLanguage")}
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
            {t("settings.languageHelp")}
          </p>
          <ul className="space-y-1 max-w-md">
            {locales.map((l) => {
              const active = l.code === locale
              return (
                <li key={l.code}>
                  <button
                    type="button"
                    onClick={() => setLocale(l.code as LocaleCode)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg",
                      "border transition-colors text-sm",
                      active
                        ? "border-zinc-900 dark:border-zinc-50 bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                    )}
                  >
                    <span className="font-medium">{l.nativeName}</span>
                    {active && <Check className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </Layout>
  )
}
