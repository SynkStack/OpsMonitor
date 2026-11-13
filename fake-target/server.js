const express = require('express');
const app = express();

let healthy = true;   // current state
let delayMs = 0;      // artificial slowness (to test "degraded")

// What the monitor will call
app.get('/health', (req, res) => {
  setTimeout(() => {
    if (healthy) return res.json({ status: 'ok' });
    res.status(500).json({ status: 'down' });
  }, delayMs);
});

// Control switches for testing
app.post('/admin/down', (req, res) => { healthy = false; res.json({ healthy }); });
app.post('/admin/up',   (req, res) => { healthy = true; delayMs = 0; res.json({ healthy }); });
app.post('/admin/slow/:ms', (req, res) => { delayMs = Number(req.params.ms) || 0; res.json({ delayMs }); });

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Fake target on ${port}`));