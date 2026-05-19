-- Migration: 0004_comment_attachments
-- Thêm bảng comment_attachments lưu metadata file đính kèm theo comment.
-- Object file thật nằm trên R2 (key = file_key). Khi xoá comment, attachments
-- row được CASCADE xoá; R2 object phải xoá thủ công ở route DELETE comment
-- (R2 không có cascade với D1).

CREATE TABLE IF NOT EXISTS comment_attachments (
  id TEXT PRIMARY KEY,
  comment_id TEXT NOT NULL,
  file_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (comment_id) REFERENCES task_comments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comment_attachments_comment
  ON comment_attachments(comment_id, created_at);
