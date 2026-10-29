-- Migration: 0008_task_images
-- Nhiều ảnh cho mỗi task (tối đa 10 — kiểm tra ở Worker), có thứ tự.
-- Ảnh position nhỏ nhất là ảnh đại diện; tasks.thumbnail_key luôn được Worker
-- đồng bộ = file_key của ảnh đại diện (để danh sách task không cần JOIN).

CREATE TABLE IF NOT EXISTS task_images (
  id TEXT PRIMARY KEY,                    -- UUID v4
  task_id TEXT NOT NULL,
  file_key TEXT NOT NULL,                 -- R2 key, vd "tasks/<taskId>/images/<id>.png"
  mime_type TEXT,
  file_size INTEGER,
  position INTEGER NOT NULL,              -- 0 = ảnh đại diện
  created_by TEXT,                        -- Firebase UID người upload
  created_at INTEGER NOT NULL,            -- Unix ms
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_images_task ON task_images(task_id, position);

-- Backfill: ảnh thumbnail cũ (1 ảnh/task) → ảnh đại diện trong bảng mới
INSERT INTO task_images (id, task_id, file_key, mime_type, file_size, position, created_by, created_at)
SELECT lower(hex(randomblob(16))), id, thumbnail_key, NULL, NULL, 0, NULL, updated_at
FROM tasks
WHERE thumbnail_key IS NOT NULL AND thumbnail_key <> '';
