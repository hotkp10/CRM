const fs = require('fs');
const file = 'app/api/webhooks/ivr/route.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `body.Destination, body.destination`;
const newStr = `body.Destination, body.destination,
      body.CampaignName ? String(body.CampaignName).match(/\\d{10}/)?.[0] : null,
      body.campaignName ? String(body.campaignName).match(/\\d{10}/)?.[0] : null`;

content = content.replace(targetStr, newStr);

fs.writeFileSync(file, content);
