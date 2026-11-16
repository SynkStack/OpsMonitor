const { createDb } = require('../src/db');
const { targetsRepo } = require('../src/targetsRepo');
const { resultsRepo } = require('../src/resultsRepo');
const { incidentsRepo } = require('../src/incidentsRepo');
const { createIncidentEngine } = require('../src/incidentEngine');

function setup() {
  const db = createDb();
  const results = resultsRepo(db);
  const incidents = incidentsRepo(db);
  const notify = jest.fn(async () => {});
  const engine = createIncidentEngine({ incidentsRepo: incidents, resultsRepo: results, notify });
  const target = targetsRepo(db).create({ name: 'A', url: 'http://a', interval_sec: 10 });

  // Simulates the scheduler: save a result, then tell the engine
  const record = async (status) => {
    const r = { status, latencyMs: 5, httpCode: status === 'down' ? 500 : 200 };
    results.save(target.id, r);
    await engine.handle(target, r);
  };
  return { incidents, notify, record };
}

test('two failures do not open an incident', async () => {
  const { incidents, record } = setup();
  await record('down');
  await record('down');
  expect(incidents.list()).toHaveLength(0);
});

test('three failures open exactly one incident', async () => {
  const { incidents, notify, record } = setup();
  for (let i = 0; i < 5; i++) await record('down');
  expect(incidents.list()).toHaveLength(1);
  expect(notify).toHaveBeenCalledTimes(1);
  expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: 'incident_opened' }));
});

test('recovery resolves the incident', async () => {
  const { incidents, notify, record } = setup();
  for (let i = 0; i < 3; i++) await record('down');
  await record('up');
  expect(incidents.list({ openOnly: true })).toHaveLength(0);
  expect(incidents.list()[0].resolved_at).not.toBeNull();
  expect(notify).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'incident_resolved' }));
});

test('a success in between resets the failure count', async () => {
  const { incidents, record } = setup();
  await record('down');
  await record('down');
  await record('up');
  await record('down');
  await record('down');
  expect(incidents.list()).toHaveLength(0);
});