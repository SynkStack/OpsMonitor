const cron = require('node-cron');

// check and now are passed in so tests can fake them
function createScheduler({ targetsRepo, resultsRepo, check, onResult = () => {}, now = () => Date.now() }) {
  const running = new Set();   // target ids with a check in progress
  const lastRun = new Map();   // target id -> when its last check started
  let task = null;

  async function runCheck(target) {
    running.add(target.id);
    lastRun.set(target.id, now());
    try {
      const result = await check(target.url);
      resultsRepo.save(target.id, result);
      onResult(target, result); // hook for the incident engine (Milestone 5)
    } catch (err) {
      console.error(`check failed for target ${target.id}:`, err.message);
    } finally {
      running.delete(target.id); // always free the slot
    }
  }

  // One tick: start a check for every due target that is not already running
  async function tick() {
    const jobs = [];
    for (const target of targetsRepo.list()) {
      if (!target.active) continue;
      if (running.has(target.id)) continue; // no overlapping runs
      const last = lastRun.get(target.id) ?? 0;
      if (now() - last < target.interval_sec * 1000) continue; // not due yet
      jobs.push(runCheck(target));
    }
    await Promise.all(jobs);
  }

  return {
    tick,
    start() { task = cron.schedule('* * * * * *', () => { tick(); }); }, // every second
    stop() { if (task) task.stop(); },
  };
}

module.exports = { createScheduler };