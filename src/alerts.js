// Returns notify(event). Webhook if configured, console otherwise.
function createNotifier({ webhookUrl = process.env.ALERT_WEBHOOK_URL, fetchFn = fetch } = {}) {
  return async function notify(event) {
    const message =
      event.type === 'incident_opened'
        ? `INCIDENT OPENED: ${event.target.name} - ${event.incident.summary}`
        : `INCIDENT RESOLVED: ${event.target.name}`;

    if (!webhookUrl) {
      console.log(`[ALERT] ${message}`);
      return;
    }
    try {
      await fetchFn(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message, event: event.type, target: event.target.name }),
      });
    } catch (err) {
      // An alert failure must never break monitoring
      console.error('alert webhook failed:', err.message);
    }
  };
}

module.exports = { createNotifier };