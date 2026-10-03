const fs = require('fs');
const file = 'app/api/webhooks/ivr/route.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "body.did, body.DID,",
  "body.did, body.DID, body.Did, body.DialDID,"
);

fs.writeFileSync(file, content);
