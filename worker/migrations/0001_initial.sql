-- Migration: 0001_initial
-- Tạo schema ban đầu cho Task Management: users, projects, tasks

-- ============================================================================
-- USERS — đồng bộ với Firebase Auth (id = Firebase UID)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                   -- Firebase UID
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_key TEXT,                       -- R2 object key (vd: "avatars/UID.png"), NULL nếu chưa upload
  email_verified INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0, 1)),
  created_at INTEGER NOT NULL,           -- Unix ms timestamp
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- PROJECTS — thuộc về 1 user (owner)
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,                   -- UUID v4 do server sinh
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_key TEXT,                    -- R2 key
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC);

-- ============================================================================
-- TASKS — thuộc về 1 project
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  no INTEGER NOT NULL CHECK (no > 0),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in-progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high')),
  assignee TEXT,
  tags TEXT,                             -- JSON array stringified: '["frontend","ui"]'
  start_date TEXT,                       -- ISO date 'YYYY-MM-DD'
  due_date TEXT,
  thumbnail_key TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE (project_id, no)                -- ⭐ Số No unique trong từng project
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_updated ON tasks(updated_at DESC);
