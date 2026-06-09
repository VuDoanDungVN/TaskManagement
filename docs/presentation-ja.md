---
marp: true
theme: default
paginate: true
backgroundColor: #fafafa
color: #18181b
header: "Task Management Dashboard"
footer: "© 2026 — Next.js · Cloudflare · Firebase"
style: |
  section {
    font-family: "Segoe UI", "Yu Gothic UI", sans-serif;
    padding: 60px;
  }
  h1 {
    color: #18181b;
    border-bottom: 4px solid #f38020;
    padding-bottom: 12px;
  }
  h2 {
    color: #1f1f23;
  }
  table {
    font-size: 0.82em;
  }
  code {
    background: #f4f4f5;
    color: #be185d;
  }
  a { color: #2563eb; }
  strong { color: #c2410c; }
  section.lead {
    text-align: center;
    justify-content: center;
  }
  section.lead h1 {
    font-size: 2.4em;
    border: none;
  }
---

<!-- _class: lead -->

# 📋 Task Management Dashboard

### プロジェクトとタスクをチームで管理するフルスタック Web アプリ

<br>

**Next.js 15 · Cloudflare Workers · D1 · R2 · Firebase Auth · Resend**

<br>

<sub>製品紹介プレゼンテーション — 2026年</sub>

---

# 🎯 製品概要

**認証済みユーザー**が自分の仕事を整理・追跡できる生産性ツールです。

- 仕事を **プロジェクト（Projects）** 単位でまとめる
- プロジェクトを追跡可能な **タスク（Tasks）** に分解
- **チーム（Teams）** で共同作業し、メンバーをメールで招待
- ステータス・優先度・期限・画像添付に対応
- **エッジで高速・低コスト**に動作（常時稼働サーバー不要）

---

# ✨ 主な機能

| カテゴリ | 内容 |
|----------|------|
| 🔐 **認証** | 登録・ログイン・メール認証・パスワードリセット（Firebase） |
| 📁 **プロジェクト** | 作成 / 編集 / 削除、サムネイル画像、進捗統計 |
| ✅ **タスク** | ステータス・優先度・担当者・タグ・期限・画像・コメント |
| 👥 **チーム** | チーム作成、メンバー管理、メール招待、プロジェクト割当 |
| 🖼️ **画像** | プロジェクト / タスク / アバターを R2 に保存 |
| 🌐 **多言語** | 英語（既定）・**日本語**・ベトナム語の3言語対応 |

---

# 🏗️ アーキテクチャ

```
┌──────────────────────────┐        ┌──────────────────────────────┐
│  Next.js 15 (フロント)   │ HTTPS  │  Cloudflare Worker (Hono)    │
│  app/ , components/      │ ─────▶ │  • Firebase ID JWT を検証     │
│  Firebase Web SDK        │  CORS  │  • REST API                  │
└───────────┬──────────────┘        └────┬──────────┬─────────┬────┘
            │ ID token                    │ SQL       │ S3 API   │ HTTP
            ▼                             ▼           ▼          ▼
     Firebase Auth              Cloudflare D1    Cloudflare R2  Resend
       (マネージド)             (SQLite/Edge)    (画像)         (招待メール)
```

- **フロント**：UI を描画し、ID トークン付きで Worker を呼び出す
- **Worker**：ステートレスな Hono アプリ。認証後に D1 / R2 を読み書き
- **D1**：`users` `projects` `tasks` `teams` などを保持

---

# 🧰 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | Next.js 15 (App Router) + React 19 |
| UI | Tailwind CSS + Radix UI + lucide-react |
| データ取得 | TanStack Query |
| フォーム / 検証 | React Hook Form + Zod |
| 認証（クライアント） | Firebase Web SDK |
| API ランタイム | Cloudflare Workers + Hono |
| データベース | Cloudflare D1 (SQLite) |
| ファイル保存 | Cloudflare R2 |
| メール送信 | Resend (HTTP API) |

---

# 👥 注目機能：チーム（Teams）

仕事を**チーム単位で共同管理**できる、今回の目玉機能です。

- ➕ サイドバーからワンクリックでチーム作成（画像・公開範囲）
- 📜 チーム一覧（**無限スクロール**で大量データも快適）
- 🔍 チーム詳細：メンバー・役割・プロジェクトを一覧表示
- 📧 **メールで招待**（Resend）→ リンクから参加
- 📁 既存プロジェクトをチームに割り当て
- 🗑️ キーワード入力による安全な削除

---

# 📧 メール招待フロー

```
オーナー/管理者がメールを入力
        │
        ▼
  招待を DB に保存 ＋ Resend でメール送信
        │
        ▼
  受信者がメール内リンクをクリック  /invite?token=...
        │
        ▼
  ログイン（招待メールと一致を確認）
        │
        ▼
  「承諾」→ チームメンバーに追加 ✅
```

> 🔒 招待メールと**ログイン中のアカウントが一致**しないと承諾不可（なりすまし防止）

---

# 🔐 役割と権限

| 操作 | owner | admin | member |
|------|:-----:|:-----:|:------:|
| 閲覧（チーム / メンバー / プロジェクト） | ✅ | ✅ | ✅ |
| 招待 / 招待取消 | ✅ | ✅ | ❌ |
| 役割の変更 | ✅ | ❌ | ❌ |
| メンバー削除 | ✅ | ✅ | ❌ |
| プロジェクト割当 / 解除 | ✅ | ✅ | ❌ |
| チーム削除 | ✅ | ❌ | ❌ |

> 権限は**フロント（UI 非表示）とバックエンド（API 検証）の両方**でチェック

---

# ⚡ パフォーマンスへの工夫

**Keyset（カーソル）ページネーション**を採用

- `OFFSET` を使わず、`(updated_at, id)` をカーソルに
- インデックス `idx_teams_updated` を常に活用
- チームが **10件でも100万件でも速度が一定**
- 一度に20件だけ取得し、スクロール時に追加読み込み

```sql
WHERE (updated_at < ? OR (updated_at = ? AND id < ?))
ORDER BY updated_at DESC, id DESC LIMIT 21
```

---

# 🌐 多言語対応（i18n）

すべての文字列を辞書で管理し、**ハードコードなし**

| 言語 | コード | 状態 |
|------|--------|------|
| English | `en` | 既定 |
| 日本語 | `ja` | ✅ 完全対応 |
| Tiếng Việt | `vi` | ✅ 完全対応 |

- 型安全な翻訳キー（TypeScript が漏れを検出）
- 削除確認キーワードも言語別：`XOA` / `DELETE` / `削除`

---

# 🚀 デプロイ構成

| 部分 | ホスティング |
|------|-------------|
| フロントエンド | Vercel / Netlify / Cloudflare Pages |
| API (Worker) | Cloudflare Workers（エッジ） |
| データベース | Cloudflare D1 |
| ファイル | Cloudflare R2 |
| 認証 | Firebase（マネージド） |
| メール | Resend |

✅ **常時稼働サーバー不要・エグレス料金なし・グローバルに高速**

---

<!-- _class: lead -->

# 🙏 ありがとうございました

### Task Management Dashboard

<br>

プロジェクト × タスク × チームを、ひとつのダッシュボードで。

<br>

<sub>詳細ドキュメント: README.md / docs/teams-feature.md</sub>
