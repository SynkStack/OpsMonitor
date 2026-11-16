const { createApp } = require('./app');
const { createDb } = require('./db');

const port = process.env.PORT || 3000;
const db = createDb(process.env.DB_FILE || 'opsmonitor.db');
createApp({ db }).listen(port, () => console.log(`OpsMonitor listening on ${port}`));