const express = require('express');
const { createDb } = require('./db');
const { targetsRepo } = require('./targetsRepo');
const { targetsRouter } = require('./routes/targets');
const { resultsRepo } = require('./resultsRepo');
const { incidentsRepo } = require('./incidentsRepo');
const { incidentsRouter } = require('./routes/incidents');
const { statsRouter } = require('./routes/stats');
// db is passed in so tests can use a fresh in-memory database
function createApp({ db = createDb() } = {}) {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime_sec: Math.floor(process.uptime()) });
  });

  app.use('/targets', targetsRouter(targetsRepo(db)));

  // Latest check results for one target
    const targets = targetsRepo(db);
  app.use('/targets', targetsRouter(targets));

  const results = resultsRepo(db);
  app.use('/targets', statsRouter(targets, results));
  app.get('/targets/:id/results', (req, res) => {
    res.json(results.latest(Number(req.params.id), 20));
  });
  
  app.use('/incidents', incidentsRouter(incidentsRepo(db)));
  return app;

  
}

module.exports = { createApp };