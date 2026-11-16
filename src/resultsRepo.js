// All SQL for the check_results table.
function resultsRepo(db) {
  return {
    save(targetId, { status, latencyMs, httpCode }) {
      db.prepare(
        'INSERT INTO check_results (target_id, checked_at, status, latency_ms, http_code) VALUES (?, ?, ?, ?, ?)'
      ).run(targetId, new Date().toISOString(), status, latencyMs, httpCode);
    },
    latest(targetId, limit = 20) {
      return db
        .prepare('SELECT * FROM check_results WHERE target_id = ? ORDER BY id DESC LIMIT ?')
        .all(targetId, limit);
    },
  };
}

module.exports = { resultsRepo };