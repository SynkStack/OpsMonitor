const cron = require('node-cron');

// check and now are passed in so tests can fake them
function createScheduler({ targetsRepo, resultsRepo, check, onResult = () => {}, now = () => Date.now() }) {
  const lastRun = new Map();   // target id -> when its last check finished
  let task = null;

  async function runCheck(target) {
    try {
      const result = await check(target.url);
      resultsRepo.save(target.id, result);
      onResult(target, result); // hook for the incident engine
    } catch (err) {
      console.error(`check failed for target ${target.id}:`, err.message);
    } finally {
      lastRun.set(target.id, now()); // interval is measured from the end of a check
    }
  }

  // One tick: start a check for every target whose interval has passed
  async function tick() {
    const jobs = [];
    for (const target of targetsRepo.list()) {
      if (!target.active) continue;
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