const fs = require('fs');
const file = 'app/api/webhooks/cloudconnect/route.ts';
let content = fs.readFileSync(file, 'utf8');

const declarationStr = `    const supabaseAdmin = getSupabaseAdmin();\n    \n`;
content = content.replace(declarationStr, '');

const insertTarget = "        let TARGET_IVR_TENANT_ID";
content = content.replace(insertTarget, declarationStr + '    ' + insertTarget);

// Also fix the assigned_to type error
// 265: error TS2741: Property 'assigned_to' is missing in type '{ id: any; name: any; company: any; phone: any; status: any; tenant_id: any; }' but required in type '{ id: any; name: any; company: any; phone: any; status: any; tenant_id: any; assigned_to: any; }'.
// We can just add assigned_to to the insert/select.
const errorTarget = `.select('id, name, company, phone, status, tenant_id')`;
content = content.replace(errorTarget, `.select('id, name, company, phone, status, tenant_id, assigned_to')`);

fs.writeFileSync(file, content);
