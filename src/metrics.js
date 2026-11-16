const client = require('prom-client');
const { incidentsRepo } = require('./incidentsRepo');

// Each app gets its own registry, so tests don't clash
function createMetrics(db) {
  const registry = new client.Registry();
  const incidents = incidentsRepo(db);

  const checks = new client.Counter({
    name: 'opsmonitor_checks_total',
    help: 'Total health checks by target and status',
    labelNames: ['target', 'status'],
    registers: [registry],
  });
  const latency = new client.Histogram({
    name: 'opsmonitor_check_latency_ms',
    help: 'Check latency in milliseconds',
    labelNames: ['target'],
    buckets: [50, 100, 250, 500, 1000, 2500, 5000],
    registers: [registry],
  });
  const up = new client.Gauge({
    name: 'opsmonitor_target_up',
    help: '1 if the last check was not down, else 0',
    labelNames: ['target'],
    registers: [registry],
  });
  new client.Gauge({
    name: 'opsmonitor_open_incidents',
    help: 'Number of open incidents',
    registers: [registry],
    // collect() runs on every scrape, so the value is always fresh
    collect() { this.set(incidents.list({ openOnly: true }).length); },
  });

  return {
    registry,
    // Called after every check
    record(target, result) {
      checks.inc({ target: target.name, status: result.status });
      latency.observe({ target: target.name }, result.latencyMs);
      up.set({ target: target.name }, result.status === 'down' ? 0 : 1);
    },
  };
}

module.exports = { createMetrics };