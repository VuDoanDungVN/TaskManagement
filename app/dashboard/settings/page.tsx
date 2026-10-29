"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import {
  Check,
  ChevronDown,
  FolderKanban,
  Languages,
  Monitor,
  Moon,
  Palette,
  Settings as SettingsIcon,
  Sun,
} from "lucide-react"
import Layout from "@/components/kokonutui/layout"
import Collapse from "@/components/kokonutui/collapse"
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

  // Mobile: chỉ mở 1 mục mỗi lần; bấm lại để đóng
  const [openSection, setOpenSection] = useState<"appearance" | "language" | null>(null)
  const toggleSection = (key: "appearance" | "language") =>
    setOpenSection((cur) => (cur === key ? null : key))
  const currentTheme = mounted ? themeOptions.find((o) => o.value === theme) : undefined
  const currentLocale = locales.find((l) => l.code === locale)

  return (
    <Layout
      breadcrumbs={[
        { label: t("breadcrumbs.dashboard"), href: "/dashboard", icon: FolderKanban },
        { label: t("breadcrumbs.settings"), icon: SettingsIcon },
      ]}
    >
      <div className="space-y-4">
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-4 sm:p-6">
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

        {/* ---------- Mobile: danh sách từng dòng, bấm để mở/đóng ---------- */}
        <div className="md:hidden bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
          {/* Giao diện */}
          <div>
            <SettingsRow
              icon={Palette}
              label={t("settings.sectionAppearance")}
              value={currentTheme ? t(currentTheme.labelKey) : ""}
              open={openSection === "appearance"}
              onToggle={() => toggleSection("appearance")}
            />
            <Collapse open={openSection === "appearance"} className="px-4 pb-3 space-y-1.5">
              {themeOptions.map((opt) => (
                <OptionButton
                  key={opt.value}
                  icon={opt.icon}
                  label={t(opt.labelKey)}
                  active={mounted && theme === opt.value}
                  onClick={() => setTheme(opt.value)}
                />
              ))}
            </Collapse>
          </div>

          {/* Ngôn ngữ */}
          <div>
            <SettingsRow
              icon={Languages}
              label={t("settings.sectionLanguage")}
              value={currentLocale?.nativeName ?? ""}
              open={openSection === "language"}
              onToggle={() => toggleSection("language")}
            />
            <Collapse open={openSection === "language"} className="px-4 pb-3 space-y-1.5">
              {locales.map((l) => (
                <OptionButton
                  key={l.code}
                  label={l.nativeName}
                  active={l.code === locale}
                  onClick={() => setLocale(l.code as LocaleCode)}
                />
              ))}
            </Collapse>
          </div>
        </div>

        {/* ---------- Tablet/desktop: 2 khối cạnh nhau, luôn mở ---------- */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Appearance */}
        <section className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            {t("settings.sectionAppearance")}
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
            {t("settings.theme")}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((opt) => {
              const active = mounted && theme === opt.value
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 px-3 py-4 rounded-lg",
                    "border transition-colors text-xs font-medium",
                    active
                      ? "border-zinc-900 dark:border-zinc-50 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {t(opt.labelKey)}
                </button>
              )
            })}
          </div>
        </section>

        {/* Language */}
        <section className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
            <Languages className="w-4 h-4" />
            {t("settings.sectionLanguage")}
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
            {t("settings.languageHelp")}
          </p>
          <ul className="space-y-1.5">
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
      </div>
    </Layout>
  )
}

/** Dòng tiêu đề của 1 mục (mobile): icon + tên + giá trị hiện tại + mũi tên mở/đóng. */
function SettingsRow({
  icon: Icon,
  label,
  value,
  open,
  onToggle,
}: {
  icon: typeof Sun
  label: string
  value: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
    >
      <Icon className="w-4 h-4 shrink-0 text-zinc-600 dark:text-zinc-400" />
      <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[40%]">{value}</span>
      <ChevronDown
        className={cn(
          "w-4 h-4 shrink-0 text-zinc-400 transition-transform duration-200",
          open && "rotate-180",
        )}
      />
    </button>
  )
}

/** Lựa chọn full chiều ngang, chiều cao vừa phải (mobile). */
function OptionButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon?: typeof Sun
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm transition-colors",
        active
          ? "border-zinc-900 dark:border-zinc-50 bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-medium"
          : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
      )}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span className="flex-1 text-left">{label}</span>
      {active && <Check className="w-4 h-4 shrink-0" />}
    </button>
  )
}
