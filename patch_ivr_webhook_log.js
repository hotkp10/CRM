const fs = require('fs');
const file = 'app/api/webhooks/ivr/route.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  try {
    const rawBody = await request.text();`;

const insertLogStr = `  try {
    const rawBody = await request.text();

    // 🔥 LOG ENTIRE RAW PAYLOAD TO DB FOR FRONTEND DEBUGGING 🔥
    try {
        await supabaseAdmin.from('webhook_logs').insert({
            endpoint: '/api/webhooks/ivr',
            method: request.method,
            payload: {
                searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
                body: rawBody,
                headers: Object.fromEntries(request.headers.entries())
            }
        });
    } catch (e) {
        console.error('Failed to save to webhook_logs:', e);
    }`;

content = content.replace(targetStr, insertLogStr);
fs.writeFileSync(file, content);
