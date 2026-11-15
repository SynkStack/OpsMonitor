// Checks one URL and returns { status, latencyMs, httpCode, error? }
async function checkTarget(url) {
  const start = Date.now();
  try {
    const res = await fetch(url);
    const latencyMs = Date.now() - start;
    // res.ok is true for any 2xx code
    return { status: res.ok ? 'up' : 'down', latencyMs, httpCode: res.status };
  } catch (err) {
    // Network error (DNS failure, connection refused...)
    return { status: 'down', latencyMs: Date.now() - start, httpCode: null, error: err.message };
  }
}

module.exports = { checkTarget };