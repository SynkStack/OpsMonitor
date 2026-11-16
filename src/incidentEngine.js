const FAILURES_TO_OPEN = 3;

// handle(target, result) is called after each check result is saved.
function createIncidentEngine({ incidentsRepo, resultsRepo, notify }) {
  return {
    async handle(target, result) {
      const open = incidentsRepo.findOpen(target.id);

      if (result.status === 'down') {
        if (open) return; // already tracking this outage: no duplicates
        const recent = resultsRepo.latest(target.id, FAILURES_TO_OPEN);
        const allDown =
          recent.length === FAILURES_TO_OPEN && recent.every((r) => r.status === 'down');
        if (!allDown) return;
        const incident = incidentsRepo.open(
          target.id,
          'critical',
          `${target.name} failed ${FAILURES_TO_OPEN} checks in a row`
        );
        await notify({ type: 'incident_opened', target, incident });
      } else if (open) {
        // up or degraded = recovered
        incidentsRepo.resolve(open.id);
        await notify({ type: 'incident_resolved', target, incident: open });
      }
    },
  };
}

module.exports = { createIncidentEngine };