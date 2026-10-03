const fs = require('fs');
const file = 'app/api/webhooks/cloudconnect/route.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'console.warn(`[Ozonetel Webhook] Parsed JSON Body:`, bodyData);',
  'console.warn(`[Ozonetel Webhook] Parsed JSON Body:`, JSON.stringify(bodyData, null, 2));'
);

content = content.replace(
  'console.warn(`[Ozonetel Webhook] Parsed FormData Body:`, bodyData);',
  'console.warn(`[Ozonetel Webhook] Parsed FormData Body:`, JSON.stringify(bodyData, null, 2));'
);

content = content.replace(
  'console.warn(`[Ozonetel Webhook] Extracted payload from stringified \\\'data\\\' field:`, bodyData);',
  'console.warn(`[Ozonetel Webhook] Extracted payload from stringified \\\'data\\\' field:`, JSON.stringify(bodyData, null, 2));'
);

fs.writeFileSync(file, content);
