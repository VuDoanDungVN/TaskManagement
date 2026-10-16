-- Migration: 0006_user_roles
-- Thêm vai trò hệ thống cho user: 'user' (mặc định) hoặc 'admin'.
-- Admin được tự cấp qua biến môi trường ADMIN_EMAILS (xem auth-middleware).

ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('admin', 'user'));

-- Index phục vụ keyset pagination danh sách user (ORDER BY created_at DESC, id DESC)
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at DESC);
