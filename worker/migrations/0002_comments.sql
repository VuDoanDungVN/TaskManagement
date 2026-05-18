-- Migration: 0002_comments
-- Thêm bảng task_comments cho chức năng bình luận task

CREATE TABLE IF NOT EXISTS task_comments (
  id TEXT PRIMARY KEY,                   -- UUID v4
  task_id TEXT NOT NULL,
  author_id TEXT NOT NULL,               -- Firebase UID, khớp users.id
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL,           -- Unix ms
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id, created_at);
CREATE INDEX IF NOT EXISTS idx_task_comments_author ON task_comments(author_id);
