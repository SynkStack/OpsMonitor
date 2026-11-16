const express = require('express');

function incidentsRouter(repo) {
  const router = express.Router();
  // GET /incidents or GET /incidents?open=true
  router.get('/', (req, res) => res.json(repo.list({ openOnly: req.query.open === 'true' })));
  return router;
}

module.exports = { incidentsRouter };