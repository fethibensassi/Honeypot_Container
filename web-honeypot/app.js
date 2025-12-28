const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Sensitive paths attackers look for */
const sensitivePaths = [
  '/admin',
  '/login',
  '/.env',
  '/config',
  '/backup.zip',
  '/phpmyadmin',
  '/api/login',
  '/wp-admin',
  '/wp-login.php'
];

/* Attack classification */
function classifyAttack(req) {
  const payload = JSON.stringify(req.body || {}) + req.originalUrl;

  if (/('|--|;|\bOR\b|\bAND\b)/i.test(payload)) return "SQL Injection";
  if (/<script>|onerror=|onload=/i.test(payload)) return "XSS";
  if (/(\.\.\/|%2e%2e%2f)/i.test(payload)) return "Directory Traversal";
  if (/(\bwget\b|\bcurl\b|\bchmod\b|\brm\b)/i.test(payload)) return "Command Injection";
  if (req.method === "POST") return "Credential Brute Force";

  return "Reconnaissance";
}

function fakeToken() {
  return crypto.randomBytes(24).toString('hex');
}

/* Central honeypot handler */
function handleRequest(req, res) {
  const attackType = classifyAttack(req);

  const log = {
    service: "web",
    time: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    attack_type: attackType
  };

  fs.appendFileSync('/logs/web.log', JSON.stringify(log) + '\n');

  setTimeout(() => {

    /* Fake success sometimes */
    if (req.method === "POST" && Math.random() < 0.2) {
      return res.status(200).json({
        message: "Login successful",
        token: fakeToken()
      });
    }

    /* Fake pages */
    if (sensitivePaths.includes(req.path)) {
      return res.status(200).send("<h3>Access denied</h3>");
    }

    return res.status(401).send("Unauthorized");

  }, 1200);
}

/* Explicit sensitive paths */
sensitivePaths.forEach(path => {
  app.all(path, handleRequest);
});

/* Catch-all (MANDATORY for recon) */
app.all('*', handleRequest);

app.listen(3000, () => {
  console.log("Web honeypot listening on port 3000");
});

