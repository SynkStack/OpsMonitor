const { createDb } = require('../src/db');

test('creates all tables', () => {
  const db = createDb();
  const names = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all()
    .map((r) => r.name);
  expect(names).toEqual(expect.arrayContaining(['targets', 'check_results', 'incidents']));
});