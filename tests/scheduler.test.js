const { createDb } = require('../src/db');
const { targetsRepo } = require('../src/targetsRepo');
const { resultsRepo } = require('../src/resultsRepo');
const { createScheduler } = require('../src/scheduler');

const okResult = { status: 'up', latencyMs: 5, httpCode: 200 };

function setup(check, now) {
  const db = createDb();
  const targets = targetsRepo(db);
  const results = resultsRepo(db);
  targets.create({ name: 'A', url: 'http://a', interval_sec: 10 });
  const scheduler = createScheduler({ targetsRepo: targets, resultsRepo: results, check, now });
  return { scheduler, results };
}

test('runs a due check and stores the result', async () => {
  const check = jest.fn(async () => okResult);
  const { scheduler, results } = setup(check);
  await scheduler.tick();
  expect(check).toHaveBeenCalledTimes(1);
  expect(results.latest(1)).toHaveLength(1);
});

test('does not start a second check while one is running', async () => {
  let release;
  const check = jest.fn(() => new Promise((resolve) => { release = () => resolve(okResult); }));
  const { scheduler } = setup(check);
  const first = scheduler.tick();
  await scheduler.tick(); // second tick while the first check is still in flight
  expect(check).toHaveBeenCalledTimes(1);
  release();
  await first;
});

test('waits for the interval before checking again', async () => {
  let t = 1_000_000;
  const check = jest.fn(async () => okResult);
  const { scheduler } = setup(check, () => t);
  await scheduler.tick();
  t += 5000;
  await scheduler.tick();  // only 5s passed, interval is 10s
  expect(check).toHaveBeenCalledTimes(1);
  t += 6000;
  await scheduler.tick();  // 11s passed
  expect(check).toHaveBeenCalledTimes(2);
});