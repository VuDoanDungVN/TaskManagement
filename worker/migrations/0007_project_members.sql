-- Migration: 0007_project_members
-- Phân quyền theo dự án: customer (role 'user') chỉ truy cập được project có trong
-- project_members. Admin hệ thống truy cập mọi project, không cần dòng ở đây.

CREATE TABLE IF NOT EXISTS project_members (
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  added_by TEXT,                          -- Firebase UID admin đã gán (NULL nếu backfill)
  added_at INTEGER NOT NULL,              -- Unix ms
  PRIMARY KEY (project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);

-- Backfill: chủ project hiện tại giữ quyền truy cập project của mình
INSERT OR IGNORE INTO project_members (project_id, user_id, added_by, added_at)
SELECT id, owner_id, NULL, created_at FROM projects;

-- Trạng thái tài khoản: 'disabled' = bị khoá, mọi request API trả 403
ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'disabled'));
