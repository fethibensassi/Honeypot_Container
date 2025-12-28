const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const app = express();

app.use(express.json());

function classifyAttack(body) {
  const payload = JSON.stringify(body || {});

  if (/('|--|;|\bOR\b|\bAND\b)/i.test(payload)) return "SQL Injection";
  if (/<script>|onerror=|onload=/i.test(payload)) return "XSS";

  return "Credential Brute Force";
}

function fakeApiKey() {
  return "AK-" + crypto.randomBytes(6).toString('hex');
}

app.post('/api/login', (req, res) => {
  const attackType = classifyAttack(req.body);

  const log = {
    service: "api",
    time: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    body: req.body,
    attack_type: attackType
  };

  fs.appendFileSync('/logs/api.log', JSON.stringify(log) + '\n');

  setTimeout(() => {
    if (Math.random() < 0.2) {
      return res.status(200).json({
        status: "ok",
        api_key: fakeApiKey()
      });
    }

    return res.status(403).json({ error: "Invalid credentials" });
  }, 1000);
});

app.listen(4000, () => {
  console.log("API honeypot listening on port 4000");
});

