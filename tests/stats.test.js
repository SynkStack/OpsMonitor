const request = require('supertest');
const { createApp } = require('../src/app');
const { createDb } = require('../src/db');
const { targetsRepo } = require('../src/targetsRepo');
const { resultsRepo } = require('../src/resultsRepo');

function setup() {
  const db = createDb();
  const target = targetsRepo(db).create({ name: 'A', url: 'http://a', interval_sec: 10 });
  return { app: createApp({ db }), results: resultsRepo(db), target };
}

test('computes uptime, latency and last status', async () => {
  const { app, results, target } = setup();
  const save = (status, latencyMs) => results.save(target.id, { status, latencyMs, httpCode: 200 });
  save('up', 10); save('up', 20); save('degraded', 30); save('down', 40);

  const res = await request(app).get(`/targets/${target.id}/stats`);
  expect(res.body).toEqual({
    target_id: target.id, window_hours: 24, checks: 4,
    uptime_pct: 75, avg_latency_ms: 25, last_status: 'down',
  });
});

test('returns nulls when there are no checks yet', async () => {
  const { app, target } = setup();
  const res = await request(app).get(`/targets/${target.id}/stats`);
  expect(res.body.checks).toBe(0);
  expect(res.body.uptime_pct).toBeNull();
});

test('returns 404 for unknown target', async () => {
  const { app } = setup();
  expect((await request(app).get('/targets/999/stats')).status).toBe(404);
});