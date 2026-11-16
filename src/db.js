// Jest can't resolve node:sqlite via require, so load the built-in directly
const { DatabaseSync } = process.getBuiltinModule('node:sqlite');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  interval_sec INTEGER NOT NULL DEFAULT 30,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS check_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_id INTEGER NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
  checked_at TEXT NOT NULL,
  status TEXT NOT NULL,
  latency_ms INTEGER,
  http_code INTEGER
);
CREATE INDEX IF NOT EXISTS idx_results_target_time
  ON check_results(target_id, checked_at);
CREATE TABLE IF NOT EXISTS incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_id INTEGER NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
  started_at TEXT NOT NULL,
  resolved_at TEXT,
  severity TEXT NOT NULL,
  summary TEXT
);
`;

// ':memory:' = temporary database (used by tests)
function createDb(file = ':memory:') {
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON'); // make ON DELETE CASCADE work
  db.exec(SCHEMA);
  return db;
}

module.exports = { createDb };