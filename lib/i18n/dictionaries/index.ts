import type { Dictionary, LocaleCode, LocaleMeta } from "../types"
import en from "./en"
import vi from "./vi"
import ja from "./ja"

/**
 * Đăng ký locale mới ở đây:
 * 1) Tạo file `<code>.ts` cùng folder, export default object kiểu `Dictionary`.
 * 2) Import và thêm vào `dictionaries` + `LOCALES` bên dưới.
 * 3) Thêm code vào `LocaleCode` union trong `../types.ts`.
 */
export const DEFAULT_LOCALE: LocaleCode = "en"

export const dictionaries: Record<LocaleCode, Dictionary> = {
  en,
  vi,
  ja,
}

export const LOCALES: LocaleMeta[] = [
  { code: "en", nativeName: "English" },
  { code: "vi", nativeName: "Tiếng Việt" },
  { code: "ja", nativeName: "日本語" },
]

export function isLocaleCode(v: unknown): v is LocaleCode {
  return typeof v === "string" && v in dictionaries
}
