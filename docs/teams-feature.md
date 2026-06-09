# 👥 Tính năng Nhóm (Teams)

> Tài liệu mô tả tính năng **Nhóm** được triển khai full-stack: tạo nhóm, danh sách (phân trang tối ưu), chi tiết, quản lý thành viên & vai trò, mời thành viên qua email (Resend), gán dự án vào nhóm, và xoá nhóm có xác nhận.

---

## 📑 Mục lục

- [Tổng quan luồng](#tổng-quan-luồng)
- [1. Cơ sở dữ liệu (D1)](#1-cơ-sở-dữ-liệu-d1)
- [2. API Backend (Worker / Hono)](#2-api-backend-worker--hono)
- [3. Frontend (Next.js)](#3-frontend-nextjs)
- [4. Mời thành viên qua email (Resend)](#4-mời-thành-viên-qua-email-resend)
- [5. Gán dự án vào nhóm](#5-gán-dự-án-vào-nhóm)
- [6. Xoá nhóm có xác nhận](#6-xoá-nhóm-có-xác-nhận)
- [7. Đa ngôn ngữ (i18n)](#7-đa-ngôn-ngữ-i18n)
- [8. Phân quyền](#8-phân-quyền)
- [9. Cách kiểm thử](#9-cách-kiểm-thử)

---

## Tổng quan luồng

```
Tạo nhóm (sidebar ＋)  ─▶  Danh sách nhóm (/dashboard/teams)  ─▶  Chi tiết nhóm (/dashboard/teams/[id])
                                                                      │
        ┌─────────────────────────────────────────────────────────────┤
        ▼                          ▼                          ▼
  Mời thành viên (email)     Gán dự án vào nhóm        Quản lý thành viên / vai trò
        │                                                     
        ▼
  Email (Resend) ─▶ link /invite?token=... ─▶ Người nhận đăng nhập ─▶ Chấp nhận ─▶ thành thành viên
```

---

## 1. Cơ sở dữ liệu (D1)

Migration: [worker/migrations/0005_teams.sql](../worker/migrations/0005_teams.sql)

### Bảng `teams`
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| `id` | TEXT PK | UUID v4 |
| `owner_id` | TEXT | Firebase UID người tạo (FK → users) |
| `name` | TEXT | Tên nhóm |
| `description` | TEXT | Mô tả (nullable) |
| `avatar_key` | TEXT | R2 key ảnh nhóm (nullable) |
| `visibility` | TEXT | `private` \| `public` |
| `created_at` / `updated_at` | INTEGER | Unix ms |

### Bảng `team_members` (bảng nối nhiều-nhiều)
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| `team_id` | TEXT | FK → teams (ON DELETE CASCADE) |
| `user_id` | TEXT | FK → users (ON DELETE CASCADE) |
| `role` | TEXT | `owner` \| `admin` \| `member` |
| `joined_at` | INTEGER | Unix ms |
| | | PK = (team_id, user_id) |

### Bảng `team_invites`
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| `id` | TEXT PK | UUID v4 |
| `team_id` | TEXT | FK → teams |
| `email` | TEXT | Email người được mời |
| `token` | TEXT UNIQUE | Token ngẫu nhiên dùng cho link chấp nhận |
| `role` | TEXT | `admin` \| `member` |
| `status` | TEXT | `pending` \| `accepted` \| `declined` \| `expired` |
| `invited_by` | TEXT | UID người gửi |
| `created_at` / `expires_at` | INTEGER | Hết hạn sau 7 ngày |

> Có unique index `(team_id, email) WHERE status='pending'` → tránh mời trùng; dùng `ON CONFLICT ... DO UPDATE` để cập nhật token.

### Thay đổi bảng `projects`
- Thêm cột `team_id TEXT REFERENCES teams(id) ON DELETE SET NULL` → gán dự án cho nhóm. Xoá nhóm thì project chỉ bị gỡ liên kết (không bị xoá).

---

## 2. API Backend (Worker / Hono)

File: [worker/src/routes/teams.ts](../worker/src/routes/teams.ts) — mount tại `/teams` trong [worker/src/index.ts](../worker/src/index.ts).

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| GET | `/teams` | member | Danh sách nhóm của tôi — **keyset pagination** (`?limit=&cursor=`) |
| POST | `/teams` | auth | Tạo nhóm (người tạo tự thành `owner`) |
| GET | `/teams/:id` | member | Chi tiết nhóm |
| PUT | `/teams/:id` | owner/admin | Cập nhật nhóm |
| DELETE | `/teams/:id` | **owner** | Xoá nhóm |
| GET | `/teams/:id/members` | member | Danh sách thành viên (kèm info user) |
| PUT | `/teams/:id/members/:userId` | **owner** | Đổi vai trò (admin ↔ member) |
| DELETE | `/teams/:id/members/:userId` | owner/admin hoặc tự rời | Xoá thành viên / rời nhóm |
| GET | `/teams/:id/invites` | owner/admin | Danh sách lời mời đang chờ |
| POST | `/teams/:id/invites` | owner/admin | Tạo lời mời (1 hoặc nhiều email) + gửi email |
| DELETE | `/teams/:id/invites/:inviteId` | owner/admin | Huỷ lời mời |
| POST | `/teams/invites/accept` | auth | Chấp nhận lời mời bằng `token` |
| GET | `/teams/:id/projects` | member | Danh sách dự án thuộc nhóm |
| POST | `/teams/:id/projects` | owner/admin + chủ project | Gán dự án vào nhóm |
| DELETE | `/teams/:id/projects/:projectId` | owner/admin | Gỡ dự án khỏi nhóm |

Upload avatar nhóm: `POST /uploads/teams/:teamId/avatar` ([worker/src/routes/uploads.ts](../worker/src/routes/uploads.ts)).

### Keyset pagination (tối ưu hiệu suất)
`GET /teams` sắp xếp `updated_at DESC, id DESC`, cursor = `<updated_at>_<id>` của item cuối trang trước, lấy `LIMIT n+1` để biết còn trang sau. Dùng keyset thay vì `OFFSET` → tốc độ **không đổi** dù số nhóm rất lớn (luôn dùng index `idx_teams_updated`).

---

## 3. Frontend (Next.js)

### API client & store
- [lib/api/teams.ts](../lib/api/teams.ts) — `teamsApi`: list/get/create/update/remove, members, invites, projects, assign/unassign.
- [lib/teams/store.ts](../lib/teams/store.ts) — React Query hooks: `useTeams`, `useInfiniteTeams`, `useTeam`, `useTeamMembers`, `useTeamInvites`, `useTeamProjects`, `useCreateTeam`, `useInviteMembers`, `useSetMemberRole`, `useRemoveMember`, `useAssignProject`, `useUnassignProject`, `useDeleteTeam`.

### Trang & component
| Đường dẫn / file | Mô tả |
|------------------|-------|
| [components/kokonutui/sidebar.tsx](../components/kokonutui/sidebar.tsx) | Icon **＋** tạo nhóm + mục **"Team"** trong section Đội nhóm |
| [components/kokonutui/team-dialog.tsx](../components/kokonutui/team-dialog.tsx) | Popup tạo nhóm: tên, mô tả, ảnh, quyền riêng tư, mời thành viên |
| `/dashboard/teams` ([page](../app/dashboard/teams/page.tsx)) + [team-list.tsx](../components/kokonutui/team-list.tsx) | Danh sách nhóm — cuộn vô hạn (IntersectionObserver), card ảnh vuông bo góc, nút xoá |
| `/dashboard/teams/[teamId]` ([page](../app/dashboard/teams/[teamId]/page.tsx)) + [team-detail.tsx](../components/kokonutui/team-detail.tsx) | Chi tiết nhóm: header, mời/quản lý thành viên, danh sách dự án |
| [components/kokonutui/team-add-project-dialog.tsx](../components/kokonutui/team-add-project-dialog.tsx) | Popup chọn dự án để gán vào nhóm |
| [components/kokonutui/team-delete-dialog.tsx](../components/kokonutui/team-delete-dialog.tsx) | Popup xoá nhóm — nhập từ khoá xác nhận |
| `/invite` ([page](../app/invite/page.tsx)) | Trang chấp nhận lời mời (`?token=...`) |

---

## 4. Mời thành viên qua email (Resend)

- Module: [worker/src/mailer.ts](../worker/src/mailer.ts) — gọi Resend HTTP API (`https://api.resend.com/emails`), template HTML + link `<APP_BASE_URL>/invite?token=...`.
- Endpoint `POST /teams/:id/invites` lưu lời mời vào DB rồi gửi email nền bằng `c.executionCtx.waitUntil(...)` (không chặn response; lỗi gửi mail không làm hỏng lời mời).
- Env cần thiết (xem [worker/wrangler.toml](../worker/wrangler.toml)):
  - `RESEND_API_KEY` — **secret** (`worker/.dev.vars` cho local, `wrangler secret put` cho production).
  - `MAIL_FROM` — phải là `onboarding@resend.dev` hoặc email thuộc domain đã xác thực Resend.
  - `APP_BASE_URL` — base URL frontend để dựng link chấp nhận.

### Luồng chấp nhận
1. Người nhận mở link `/invite?token=...`.
2. Nếu chưa đăng nhập → yêu cầu đăng nhập (returnTo về đúng link).
3. Bấm "Chấp nhận" → `POST /teams/invites/accept`.
4. Backend kiểm tra: token hợp lệ, chưa dùng, chưa hết hạn, **email lời mời khớp email tài khoản đang đăng nhập** → thêm vào `team_members`, đánh dấu invite `accepted`.

---

## 5. Gán dự án vào nhóm

- Mọi response project trả kèm `teamId` + `teamName` ([worker/src/routes/projects.ts](../worker/src/routes/projects.ts) JOIN bảng teams).
- Nút **"Thêm dự án"** ở header chi tiết nhóm (owner/admin) → mở popup chọn từ dự án của bạn → `POST /teams/:id/projects`.
- Section **"Dự án"** trong chi tiết nhóm liệt kê project; bấm vào → mở project; nút "Gỡ" → `DELETE /teams/:id/projects/:projectId`.
- Card project ở danh sách dự án hiện **badge tên nhóm** ([project-list.tsx](../components/kokonutui/project-list.tsx)); bấm badge → mở trang chi tiết nhóm.

---

## 6. Xoá nhóm có xác nhận

- Nút xoá (🗑) ở góc card nhóm, **chỉ hiện với owner**.
- Popup yêu cầu gõ đúng **từ khoá theo ngôn ngữ**: `XOA` (vi) / `DELETE` (en) / `削除` (ja) mới bật được nút xoá.
- Khi xoá: `team_members` và `team_invites` tự xoá theo (`ON DELETE CASCADE`); project chỉ bị gỡ liên kết (`team_id` → NULL).

---

## 7. Đa ngôn ngữ (i18n)

Mọi chuỗi đều qua i18n (không hardcode), đủ 3 ngôn ngữ: [en.ts](../lib/i18n/dictionaries/en.ts), [vi.ts](../lib/i18n/dictionaries/vi.ts), [ja.ts](../lib/i18n/dictionaries/ja.ts), khai báo type tại [types.ts](../lib/i18n/types.ts).

Các block đã thêm: `nav.createTeam`, `nav.teamList`, `teamDialog`, `teamsList`, `teamDetail`, `invitePage`.

---

## 8. Phân quyền

| Hành động | owner | admin | member |
|-----------|:-----:|:-----:|:------:|
| Xem nhóm / thành viên / dự án | ✅ | ✅ | ✅ |
| Mời / huỷ lời mời | ✅ | ✅ | ❌ |
| Đổi vai trò thành viên | ✅ | ❌ | ❌ |
| Xoá thành viên | ✅ | ✅ | ❌ |
| Gán / gỡ dự án | ✅ | ✅ | ❌ |
| Rời nhóm | ❌ (phải xoá nhóm) | ✅ | ✅ |
| Xoá nhóm | ✅ | ❌ | ❌ |

> Phân quyền được kiểm tra **cả ở frontend (ẩn UI) lẫn backend (`requireMember` / `requireManager` / owner-only)** — không thể lách qua API.

---

## 9. Cách kiểm thử

```bash
# 1. Áp migration
cd worker
npm run db:migrate:local

# 2. Chạy 2 server (2 terminal)
cd worker && npm run dev      # http://localhost:8787
npm run dev                   # http://localhost:3000  (ở thư mục gốc)
```

Trên trình duyệt (đã đăng nhập + verify email):
1. Sidebar → mục Đội nhóm → bấm **＋** tạo nhóm.
2. Vào **Team** → thấy danh sách; bấm card → trang chi tiết.
3. Mời email → kiểm tra "Lời mời đang chờ"; mở `/invite?token=...` (đăng nhập đúng email được mời) → chấp nhận.
4. Bấm **Thêm dự án** → gán → kiểm tra badge nhóm trên card dự án.
5. Hover card nhóm (là owner) → bấm 🗑 → gõ `XOA` → xoá.

Query kiểm tra DB:
```bash
npx wrangler d1 execute task-management --local --command "SELECT name, visibility FROM teams;"
npx wrangler d1 execute task-management --local --command "SELECT team_id, user_id, role FROM team_members;"
npx wrangler d1 execute task-management --local --command "SELECT email, status FROM team_invites;"
npx wrangler d1 execute task-management --local --command "SELECT name, team_id FROM projects WHERE team_id IS NOT NULL;"
```

---

<sub>Ngày triển khai: 2026-06-09 · Stack: Next.js 15 · Cloudflare Workers (Hono) · D1 · R2 · Firebase Auth · Resend</sub>
