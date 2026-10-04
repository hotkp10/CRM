const fs = require('fs');
const file = 'app/api/webhooks/cloudconnect/route.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `        // Final fallback: if absolutely no user can be matched (e.g. fully automated IVR dropping), pick a system admin to satisfy DB constraint
        if (!callLogUserId) {
            const { data: fallbackUsers } = await supabaseAdmin.from('users').select('id').limit(1);
            if (fallbackUsers && fallbackUsers.length > 0) {
                callLogUserId = fallbackUsers[0].id;
            }
        }

        const logData: any = {
            call_sid: uuid,
            cloudconnect_uuid: uuid,
            tenant_id: matchedAgentId ? (matchingUsers?.[0]?.tenant_id || lead?.tenant_id) : (lead?.tenant_id),
            user_id: callLogUserId,`;

const newStr = `        // Final fallback: if absolutely no user can be matched (e.g. fully automated IVR dropping), pick a system admin to satisfy DB constraint
        if (!callLogUserId) {
            const { data: fallbackUsers } = await supabaseAdmin.from('users').select('id').eq('tenant_id', TARGET_IVR_TENANT_ID).limit(1);
            if (fallbackUsers && fallbackUsers.length > 0) {
                callLogUserId = fallbackUsers[0].id;
            } else {
                // If the target tenant has absolutely no users, just grab anyone so it doesn't crash
                const { data: globalFallback } = await supabaseAdmin.from('users').select('id').limit(1);
                if (globalFallback) callLogUserId = globalFallback[0].id;
            }
        }

        const logData: any = {
            call_sid: uuid,
            cloudconnect_uuid: uuid,
            tenant_id: matchedAgentId ? (matchingUsers?.[0]?.tenant_id || lead?.tenant_id) : (lead?.tenant_id || TARGET_IVR_TENANT_ID),
            user_id: callLogUserId,`;

content = content.replace(targetStr, newStr);

fs.writeFileSync(file, content);
