const fs = require('fs');
const file = 'app/api/webhooks/ivr/route.ts';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /\/\/ 🔥 LOG ENTIRE RAW PAYLOAD TO DB FOR FRONTEND DEBUGGING 🔥[\s\S]*?} catch \(e\) {[\s\S]*?console\.error\('Failed to save to webhook_logs:', e\);[\s\S]*?}/;

content = content.replace(targetRegex, '');
fs.writeFileSync(file, content);
