async function checkTarget(url, { timeoutMs = 5000, degradedMs = 1000 } = {}) {
  const start = Date.now();
  const controller = new AbortController();
  // After timeoutMs, cancel the request
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const latencyMs = Date.now() - start;
        // 2xx but slow = degraded
    const status = !res.ok ? 'down' : latencyMs > degradedMs ? 'degraded' : 'up';
    return { status, latencyMs, httpCode: res.status };
  } catch (err) {
    const error = controller.signal.aborted ? 'timeout' : err.message;
    return { status: 'down', latencyMs: Date.now() - start, httpCode: null, error };
  } finally {
    clearTimeout(timer); // always stop the timer
  }
}

module.exports = { checkTarget }