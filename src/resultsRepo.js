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
        // Counts and average latency for one target since a given time
    stats(targetId, sinceIso) {
      const row = db.prepare(`
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN status != 'down' THEN 1 ELSE 0 END) AS ok,
               AVG(latency_ms) AS avg_latency
        FROM check_results WHERE target_id = ? AND checked_at >= ?`).get(targetId, sinceIso);
      return { total: row.total, ok: row.ok || 0, avgLatency: row.avg_latency };
    },
  };
}

module.exports = { resultsRepo };