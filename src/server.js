const { createApp } = require('./app');
const { createDb } = require('./db');
const { targetsRepo } = require('./targetsRepo');
const { resultsRepo } = require('./resultsRepo');
const { incidentsRepo } = require('./incidentsRepo');
const { createScheduler } = require('./scheduler');
const { createIncidentEngine } = require('./incidentEngine');
const { createNotifier } = require('./alerts');
const { checkTarget } = require('./checker');

const port = process.env.PORT || 3000;
const db = createDb(process.env.DB_FILE || 'opsmonitor.db');
const results = resultsRepo(db);

const engine = createIncidentEngine({
  incidentsRepo: incidentsRepo(db),
  resultsRepo: results,
  notify: createNotifier(),
});

createScheduler({
  targetsRepo: targetsRepo(db),
  resultsRepo: results,
  check: checkTarget,
  onResult: engine.handle, // the hook we left in Milestone 4
}).start();

createApp({ db }).listen(port, () => console.log(`OpsMonitor listening on ${port}`));