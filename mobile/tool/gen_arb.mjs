// Sinh file ARB cho Flutter (mobile/lib/l10n/app_<lang>.arb) từ i18n của web
// (lib/i18n/dictionaries/<lang>.ts) → web là nguồn duy nhất, app luôn khớp chuỗi.
//
// Chạy từ thư mục mobile/:   node tool/gen_arb.mjs
// Sau đó:                    flutter gen-l10n   (hoặc flutter run/build tự chạy)
//
// Quy ước key: "auth.login.title" → "authLoginTitle" (camelCase, hợp lệ cho Dart).
// Placeholder {count}, {name}… giữ nguyên cú pháp và được khai báo trong "@key".

import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const DICT_DIR = join(here, "..", "..", "lib", "i18n", "dictionaries")
const OUT_DIR = join(here, "..", "lib", "l10n")
const LOCALES = ["en", "vi", "ja"] // en là template (ngôn ngữ mặc định của web)

/** Đọc file dictionary .ts (object literal thuần) → object JS. */
function loadDictionary(locale) {
  const src = readFileSync(join(DICT_DIR, `${locale}.ts`), "utf8")
  const body = src
    .replace(/^import .*$/gm, "")
    .replace(/^export default .*$/gm, "")
    .replace(/const\s+\w+\s*:\s*Dictionary\s*=/, "return ")
  // File thuộc chính repo này, chỉ chứa object literal chuỗi
  return new Function(body)()
}

function toKey(path) {
  return path
    .map((seg, i) => (i === 0 ? seg : seg.charAt(0).toUpperCase() + seg.slice(1)))
    .join("")
}

/** Làm phẳng object lồng nhau → [{ key, webKey, value }] theo thứ tự xuất hiện. */
function flatten(obj, path = [], out = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === "object") flatten(v, [...path, k], out)
    else out.push({ key: toKey([...path, k]), webKey: [...path, k].join("."), value: String(v) })
  }
  return out
}

const placeholdersOf = (text) => [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))]

mkdirSync(OUT_DIR, { recursive: true })
const template = flatten(loadDictionary("en"))
const templateKeys = new Set(template.map((e) => e.key))
if (templateKeys.size !== template.length) throw new Error("Trùng key sau khi chuyển camelCase")

for (const locale of LOCALES) {
  const entries = flatten(loadDictionary(locale))
  const byKey = new Map(entries.map((e) => [e.key, e]))
  const missing = template.filter((e) => !byKey.has(e.key)).map((e) => e.webKey)
  if (missing.length) throw new Error(`[${locale}] thiếu key: ${missing.join(", ")}`)

  const arb = { "@@locale": locale }
  for (const t of template) {
    const value = byKey.get(t.key).value
    arb[t.key] = value
    if (locale === "en") {
      const meta = { description: `web: ${t.webKey}` }
      const ph = placeholdersOf(t.value)
      if (ph.length) meta.placeholders = Object.fromEntries(ph.map((p) => [p, { type: "Object" }]))
      arb[`@${t.key}`] = meta
    }
  }
  writeFileSync(join(OUT_DIR, `app_${locale}.arb`), JSON.stringify(arb, null, 2) + "\n", "utf8")
  console.log(`app_${locale}.arb: ${template.length} chuỗi`)
}
