const express = require('express');
const app = express();

app.get('/check', (req, res) => {
  const uid = req.query.uid;
  if (!uid) return res.json({ success: false, reason: "No uid" });

  const isWhitelisted = !!whitelist[uid];
  res.json({ success: isWhitelisted, active: isWhitelisted });
});

app.listen(3000, () => console.log('API on port 3000'));
