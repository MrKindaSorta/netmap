-- NetMap Cloud Storage Schema
-- Database: Cloudflare D1 (SQLite-compatible)

-- Users table - manages user accounts and subscriptions
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  last_login INTEGER,
  email_verified INTEGER DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free', -- 'free' or 'premium'
  subscription_expires INTEGER -- NULL for free tier
);

-- Networks table - stores network metadata
CREATE TABLE networks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  version INTEGER DEFAULT 1,
  kv_key TEXT NOT NULL,
  is_cloud_stored INTEGER DEFAULT 1, -- Distinguish cloud vs imported
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Network versions table - tracks version history
CREATE TABLE network_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  network_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  kv_key TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  changelog TEXT,
  FOREIGN KEY (network_id) REFERENCES networks(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_networks_user ON networks(user_id);
CREATE INDEX idx_networks_updated ON networks(updated_at DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_tier);
CREATE INDEX idx_network_versions_network ON network_versions(network_id, version DESC);

-- Network sharing table (for future collaboration features)
CREATE TABLE network_shares (
  id TEXT PRIMARY KEY,
  network_id TEXT NOT NULL,
  shared_with_email TEXT NOT NULL,
  shared_by_user_id TEXT,
  permission TEXT DEFAULT 'view', -- 'view' or 'edit'
  created_at INTEGER NOT NULL,
  updated_at INTEGER,
  FOREIGN KEY (network_id) REFERENCES networks(id) ON DELETE CASCADE
);

CREATE INDEX idx_network_shares_network ON network_shares(network_id);
CREATE INDEX idx_network_shares_email ON network_shares(shared_with_email);
CREATE INDEX idx_network_shares_shared_by ON network_shares(shared_by_user_id);

-- Refresh tokens table for JWT authentication
CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  revoked INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- AI usage logs table - audit trail for AI requests
CREATE TABLE ai_usage_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL DEFAULT (unixepoch()),
  request_type TEXT NOT NULL, -- 'chat', 'device_suggestion', 'connection_suggestion', etc.
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  network_context_included INTEGER DEFAULT 0,
  network_id TEXT,
  status TEXT NOT NULL, -- 'success', 'error', 'rate_limited'
  error_message TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (network_id) REFERENCES networks(id) ON DELETE SET NULL
);

CREATE INDEX idx_ai_logs_user ON ai_usage_logs(user_id, timestamp DESC);
CREATE INDEX idx_ai_logs_network ON ai_usage_logs(network_id, timestamp DESC);
