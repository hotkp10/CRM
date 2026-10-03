const fs = require('fs');
const file = 'app/api/webhooks/cloudconnect/route.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `console.warn(\`[Ozonetel Webhook] Provided API Key: \${providedApiKey ? '***' + providedApiKey.slice(-4) : 'None'}\`);`;

const insertLogStr = `console.warn(\`[Ozonetel Webhook] Provided API Key: \${providedApiKey ? '***' + providedApiKey.slice(-4) : 'None'}\`);

    // 🔥 LOG ENTIRE RAW PAYLOAD TO DB FOR FRONTEND DEBUGGING 🔥
    try {
        const adminDb = getSupabaseAdmin();
        await adminDb.from('webhook_logs').insert({
            endpoint: '/api/webhooks/cloudconnect',
            method: req.method,
            payload: {
                searchParams: Object.fromEntries(searchParams.entries()),
                body: bodyData,
                headers: Object.fromEntries(req.headers.entries())
            }
        });
    } catch (e) {
        console.error('Failed to save to webhook_logs:', e);
    }`;

content = content.replace(targetStr, insertLogStr);
fs.writeFileSync(file, content);
