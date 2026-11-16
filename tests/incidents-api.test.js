const request = require('supertest');
const { createApp } = require('../src/app');
const { createDb } = require('../src/db');
const { targetsRepo } = require('../src/targetsRepo');
const { incidentsRepo } = require('../src/incidentsRepo');

test('GET /incidents lists incidents and filters open ones', async () => {
  const db = createDb();
  const target = targetsRepo(db).create({ name: 'A', url: 'http://a', interval_sec: 10 });
  const repo = incidentsRepo(db);
  const first = repo.open(target.id, 'critical', 'one');
  repo.resolve(first.id);
  repo.open(target.id, 'critical', 'two');

  const app = createApp({ db });
  expect((await request(app).get('/incidents')).body).toHaveLength(2);
  expect((await request(app).get('/incidents?open=true')).body).toHaveLength(1);
});