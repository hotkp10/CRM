const fs = require('fs');
const file = 'app/api/webhooks/cloudconnect/route.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `getParam('Destination'), getParam('destination'), getParam('DialedNumber')`;
const newStr = `getParam('Destination'), getParam('destination'), getParam('DialedNumber'),
            getParam('CampaignName') ? getParam('CampaignName').match(/\\d{10}/)?.[0] : null`;

content = content.replace(targetStr, newStr);

const fallbackTargetStr = `let TARGET_IVR_TENANT_ID = '576a6280-a9a2-425c-b1dd-eabfff3a00c6'; // Default fallback`;
const fallbackNewStr = `let TARGET_IVR_TENANT_ID = getParam('tenant') || getParam('tenantId') || getParam('tenant_id') || '576a6280-a9a2-425c-b1dd-eabfff3a00c6'; // Default fallback`;

content = content.replace(fallbackTargetStr, fallbackNewStr);

fs.writeFileSync(file, content);
