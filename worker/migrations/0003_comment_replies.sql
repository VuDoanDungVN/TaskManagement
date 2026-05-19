-- Migration: 0003_comment_replies
-- Thêm parent_id để hỗ trợ thread bình luận 1 cấp (reply về root).
-- reply_to_id lưu thêm "đang reply ai" (tuỳ chọn, để hiển thị "↳ @tên" khi
-- một reply trả lời reply khác — vì model 1 cấp luôn flatten parent về root).

ALTER TABLE task_comments
  ADD COLUMN parent_id TEXT REFERENCES task_comments(id) ON DELETE CASCADE;

ALTER TABLE task_comments
  ADD COLUMN reply_to_id TEXT REFERENCES task_comments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_task_comments_parent
  ON task_comments(parent_id, created_at);
