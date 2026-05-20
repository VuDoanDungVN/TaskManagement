"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Dictionary, LocaleCode, TranslationKey } from "./types"
import {
  DEFAULT_LOCALE,
  dictionaries,
  isLocaleCode,
  LOCALES,
} from "./dictionaries"

interface I18nContextValue {
  locale: LocaleCode
  setLocale: (l: LocaleCode) => void
  /** Tra cứu translation theo path `"a.b.c"`. Interpolation `{name}` → params.name. */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  /** Danh sách locale + native name để render switcher. */
  locales: typeof LOCALES
}

const I18nContext = createContext<I18nContextValue | null>(null)

const STORAGE_KEY = "task-manager:locale:v1"

function getInitialLocale(): LocaleCode {
  if (typeof window === "undefined") return DEFAULT_LOCALE
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (isLocaleCode(saved)) return saved
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE
}

function resolvePath(dict: Dictionary, path: string): string | undefined {
  const parts = path.split(".")
  let cur: unknown = dict
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p]
    } else {
      return undefined
    }
  }
  return typeof cur === "string" ? cur : undefined
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = params[key]
    return v === undefined || v === null ? `{${key}}` : String(v)
  })
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // SSR + first paint dùng default; hydrate trên client bằng useEffect để
  // tránh hydration mismatch.
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE)

  useEffect(() => {
    const initial = getInitialLocale()
    if (initial !== DEFAULT_LOCALE) setLocaleState(initial)
  }, [])

  const setLocale = useCallback((l: LocaleCode) => {
    setLocaleState(l)
    try {
      window.localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* ignore */
    }
    // Cập nhật <html lang> cho a11y + tooling
    if (typeof document !== "undefined") {
      document.documentElement.lang = l
    }
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale
    }
  }, [locale])

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE]
    const fallback = dictionaries[DEFAULT_LOCALE]
    const t: I18nContextValue["t"] = (key, params) => {
      const raw = resolvePath(dict, key) ?? resolvePath(fallback, key) ?? key
      return interpolate(raw, params)
    }
    return { locale, setLocale, t, locales: LOCALES }
  }, [locale, setLocale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error("useI18n phải được gọi bên trong <I18nProvider>")
  }
  return ctx
}
