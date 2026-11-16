const request = require('supertest');
const { createApp } = require('../src/app');
const { createDb } = require('../src/db');
const { createMetrics } = require('../src/metrics');
const { targetsRepo } = require('../src/targetsRepo');
const { incidentsRepo } = require('../src/incidentsRepo');

function setup() {
  const db = createDb();
  const target = targetsRepo(db).create({ name: 'A', url: 'http://a', interval_sec: 10 });
  const metrics = createMetrics(db);
  return { db, target, metrics, app: createApp({ db, metrics }) };
}

test('exposes check counters and target_up in prometheus format', async () => {
  const { app, target, metrics } = setup();
  metrics.record(target, { status: 'down', latencyMs: 12, httpCode: 500 });
  const res = await request(app).get('/metrics');
  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/text\/plain/);
  expect(res.text).toMatch(/opsmonitor_checks_total\{[^}]*status="down"[^}]*\} 1/);
  expect(res.text).toContain('opsmonitor_target_up{target="A"} 0');
});

test('open incidents gauge reflects the database', async () => {
  const { app, db, target } = setup();
  incidentsRepo(db).open(target.id, 'critical', 'test');
  const res = await request(app).get('/metrics');
  expect(res.text).toContain('opsmonitor_open_incidents 1');
});