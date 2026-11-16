const express = require('express');

function statsRouter(targetsRepo, resultsRepo) {
  const router = express.Router();

  // GET /targets/:id/stats?hours=24
  router.get('/:id/stats', (req, res) => {
    const id = Number(req.params.id);
    if (!targetsRepo.get(id)) return res.status(404).json({ error: 'not found' });

    const hours = Number(req.query.hours) > 0 ? Number(req.query.hours) : 24;
    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    const { total, ok, avgLatency } = resultsRepo.stats(id, since);
    const last = resultsRepo.latest(id, 1)[0];

    res.json({
      target_id: id,
      window_hours: hours,
      checks: total,
      uptime_pct: total ? Math.round((ok / total) * 10000) / 100 : null,
      avg_latency_ms: total ? Math.round(avgLatency) : null,
      last_status: last ? last.status : null,
    });
  });

  return router;
}

module.exports = { statsRouter };