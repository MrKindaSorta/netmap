-- Migration: Add authentication support
-- This migration adds authentication columns to existing users table
-- and creates new tables for refresh tokens

-- Add authentication columns to users table if they don't exist
-- Note: SQLite doesn't have IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- so we'll use a more cautious approach

-- Add password_hash column
ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT '';

-- Add last_login column
ALTER TABLE users ADD COLUMN last_login INTEGER;

-- Add email_verified column
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;

-- Update network_shares table to add new columns
ALTER TABLE network_shares ADD COLUMN shared_by_user_id TEXT;
ALTER TABLE network_shares ADD COLUMN updated_at INTEGER;

-- Create indexes for network_shares
CREATE INDEX IF NOT EXISTS idx_network_shares_shared_by ON network_shares(shared_by_user_id);

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  revoked INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for refresh_tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
