const express = require('express');
const { createDb } = require('./db');
const { targetsRepo } = require('./targetsRepo');
const { targetsRouter } = require('./routes/targets');

// db is passed in so tests can use a fresh in-memory database
function createApp({ db = createDb() } = {}) {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime_sec: Math.floor(process.uptime()) });
  });

  app.use('/targets', targetsRouter(targetsRepo(db)));

  return app;
}

module.exports = { createApp };