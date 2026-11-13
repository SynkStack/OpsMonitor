const express = require('express');

// Build the app in a function so tests can use it without opening a port.
function createApp() {
  const app = express();
  app.use(express.json());

  // Liveness check: "is the monitor itself running?"
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime_sec: Math.floor(process.uptime()) });
  });

  return app;
}

module.exports = { createApp };