const express = require('express');
const app = express();

// Optional: Add a root route for easy testing (shows in browser/webview)
app.get('/', (req, res) => {
  res.send('Whitelist API is running! Use /check?uid=123456789 to test.');
});

// Your check endpoint
app.get('/check', (req, res) => {
  const uid = req.query.uid;
  if (!uid) {
    return res.json({ success: false, reason: "No uid provided" });
  }

  // Assuming 'whitelist' is loaded/defined somewhere (from earlier code)
  // If not, add loading logic here or globally
  const isWhitelisted = !!whitelist[uid];  // !! makes it boolean true/false

  res.json({
    success: isWhitelisted,
    active: isWhitelisted
  });
});

// Critical fix: Use Replit's dynamic PORT + bind to 0.0.0.0
const PORT = process.env.PORT || 3000;  // Replit sets PORT env var automatically

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT} (bound to 0.0.0.0)`);
});
