const fs = require('fs');
const file = 'app/api/webhooks/cloudconnect/route.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "getParam('did'), getParam('DID'),",
  "getParam('did'), getParam('DID'), getParam('Did'), getParam('DialDID'),"
);

fs.writeFileSync(file, content);
