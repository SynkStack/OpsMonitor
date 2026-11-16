// All SQL for the incidents table.
function incidentsRepo(db) {
  return {
    findOpen(targetId) {
      return db
        .prepare('SELECT * FROM incidents WHERE target_id = ? AND resolved_at IS NULL')
        .get(targetId);
    },
    open(targetId, severity, summary) {
      const info = db
        .prepare('INSERT INTO incidents (target_id, started_at, severity, summary) VALUES (?, ?, ?, ?)')
        .run(targetId, new Date().toISOString(), severity, summary);
      return db.prepare('SELECT * FROM incidents WHERE id = ?').get(info.lastInsertRowid);
    },
    resolve(id) {
      db.prepare('UPDATE incidents SET resolved_at = ? WHERE id = ?').run(new Date().toISOString(), id);
    },
    list({ openOnly = false } = {}) {
      const where = openOnly ? 'WHERE resolved_at IS NULL' : '';
      return db.prepare(`SELECT * FROM incidents ${where} ORDER BY id DESC`).all();
    },
  };
}

module.exports = { incidentsRepo };