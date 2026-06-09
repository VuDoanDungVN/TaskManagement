-- Migration: 0005_teams
-- Tính năng Đội nhóm: teams, team_members (bảng nối), team_invites (mời qua email)
-- + thêm cột team_id cho projects (gán project cho nhóm)

-- ============================================================================
-- TEAMS — mỗi nhóm thuộc về 1 owner (người tạo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,                    -- UUID v4 do server sinh
  owner_id TEXT NOT NULL,                 -- Firebase UID người tạo
  name TEXT NOT NULL,
  description TEXT,
  avatar_key TEXT,                        -- R2 object key (vd: "teams/<id>/avatar.png"), NULL nếu chưa upload
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'public')),
  created_at INTEGER NOT NULL,            -- Unix ms timestamp
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_updated ON teams(updated_at DESC);

-- ============================================================================
-- TEAM_MEMBERS — bảng nối user ↔ team, kèm vai trò
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_members (
  team_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member')),
  joined_at INTEGER NOT NULL,
  PRIMARY KEY (team_id, user_id),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- ============================================================================
-- TEAM_INVITES — lời mời tham gia nhóm qua email (kèm token)
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_invites (
  id TEXT PRIMARY KEY,                    -- UUID v4
  team_id TEXT NOT NULL,
  email TEXT NOT NULL,                    -- email người được mời
  token TEXT NOT NULL UNIQUE,             -- token ngẫu nhiên dùng cho link chấp nhận
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('admin', 'member')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  invited_by TEXT NOT NULL,              -- Firebase UID người gửi lời mời
  created_at INTEGER NOT NULL,
  expires_at INTEGER,                    -- Unix ms; NULL = không hết hạn
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_team_invites_team ON team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON team_invites(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_invites_unique_pending
  ON team_invites(team_id, email) WHERE status = 'pending';

-- ============================================================================
-- PROJECTS — thêm cột team_id (nullable): gán project cho 1 nhóm
-- ============================================================================
ALTER TABLE projects ADD COLUMN team_id TEXT REFERENCES teams(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_team ON projects(team_id);
