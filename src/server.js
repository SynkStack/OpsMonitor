const { createApp } = require('./app');
const { createDb } = require('./db');
const { targetsRepo } = require('./targetsRepo');
const { resultsRepo } = require('./resultsRepo');
const { createScheduler } = require('./scheduler');
const { checkTarget } = require('./checker');

const port = process.env.PORT || 3000;
const db = createDb(process.env.DB_FILE || 'opsmonitor.db');

createScheduler({
  targetsRepo: targetsRepo(db),
  resultsRepo: resultsRepo(db),
  check: checkTarget,
}).start();

createApp({ db }).listen(port, () => console.log(`OpsMonitor listening on ${port}`));