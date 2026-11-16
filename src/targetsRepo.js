// All SQL for the targets table lives here.
function targetsRepo(db) {
  // SQLite stores booleans as 0/1, so convert back
  const toTarget = (row) => row && { ...row, active: Boolean(row.active) };

  return {
    create({ name, url, interval_sec }) {
      const info = db
        .prepare('INSERT INTO targets (name, url, interval_sec) VALUES (?, ?, ?)')
        .run(name, url, interval_sec);
      return this.get(info.lastInsertRowid);
    },
    list() {
      return db.prepare('SELECT * FROM targets ORDER BY id').all().map(toTarget);
    },
    get(id) {
      return toTarget(db.prepare('SELECT * FROM targets WHERE id = ?').get(id));
    },
    remove(id) {
      return db.prepare('DELETE FROM targets WHERE id = ?').run(id).changes > 0;
    },
  };
}

module.exports = { targetsRepo };