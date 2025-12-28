const fs = require('fs');

const file = './logs/web.log';
const lines = fs.readFileSync(file, 'utf-8').trim().split('\n');

const stats = {
  total: 0,
  attacks: {},
  ips: {},
  paths: {}
};

for (const line of lines) {
  const log = JSON.parse(line);
  stats.total++;

  stats.attacks[log.attack_type] =
    (stats.attacks[log.attack_type] || 0) + 1;

  stats.ips[log.ip] =
    (stats.ips[log.ip] || 0) + 1;

  stats.paths[log.url] =
    (stats.paths[log.url] || 0) + 1;
}

console.log("=== Honeypot Analysis ===");
console.log("Total requests:", stats.total);

console.log("\nAttack types:");
console.table(stats.attacks);

console.log("\nTop attacker IPs:");
console.table(
  Object.entries(stats.ips)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
);

console.log("\nMost targeted paths:");
console.table(
  Object.entries(stats.paths)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
);

