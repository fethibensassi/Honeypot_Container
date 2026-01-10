/*********************************
 * Imports
 *********************************/
const express = require('express');
const fs = require('fs');
const crypto = require('crypto');

/*********************************
 * App Initialization
 *********************************/
const app = express();
app.use(express.json());

/*********************************
 * Constants
 *********************************/
const PORT = 4000;
const LOG_FILE = '/logs/api.log';

/*********************************
 * Attack Classification
 *********************************/
function classifyAttack(body) {
    const payload = JSON.stringify(body || {});

    if (/('|--|;|\bOR\b|\bAND\b)/i.test(payload)) {
        return 'SQL Injection';
    }

    if (/<script>|onerror=|onload=/i.test(payload)) {
        return 'XSS';
    }

    return 'Credential Brute Force';
}

/*********************************
 * Utilities
 *********************************/
function generateFakeApiKey() {
    return 'AK-' + crypto.randomBytes(6).toString('hex');
}

function logAttack(req, attackType) {
    const logEntry = {
        service: 'api',
        time: new Date().toISOString(),
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        body: req.body,
        attack_type: attackType
    };

    fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + '\n');
}

/*********************************
 * Route Handlers
 *********************************/
app.post('/api/login', (req, res) => {
    const attackType = classifyAttack(req.body);
    logAttack(req, attackType);

    // Artificial delay for realism
    setTimeout(() => {

        /* Random fake success */
        if (Math.random() < 0.2) {
            return res.status(200).json({
                status: 'ok',
                api_key: generateFakeApiKey()
            });
        }

        return res.status(403).json({
            error: 'Invalid credentials'
        });

    }, 1000);
});

/*********************************
 * Server Startup
 *********************************/
app.listen(PORT, () => {
    console.log(`🕷️ API honeypot listening on port ${PORT}`);
});

