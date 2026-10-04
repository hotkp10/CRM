const fs = require('fs');
const file = 'app/api/webhooks/cloudconnect/route.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove DID routing from inside the block
const didRoutingStr = `        let TARGET_IVR_TENANT_ID = getParam('tenant') || getParam('tenantId') || getParam('tenant_id') || '576a6280-a9a2-425c-b1dd-eabfff3a00c6'; // Default fallback

        // ===== DID-BASED TENANT ROUTING =====
        const potentialDids = [
            getParam('did'), getParam('DID'), getParam('Did'), getParam('DialDID'),
            getParam('calledNumber'), getParam('called_number'),
            getParam('dnis'), getParam('DNIS'),
            getParam('clid'), getParam('caller_id'), getParam('CallerID'),
            getParam('Destination'), getParam('destination'), getParam('DialedNumber'),
            getParam('CampaignName') ? getParam('CampaignName').match(/\\d{10}/)?.[0] : null
        ].filter(Boolean).map(n => String(n).replace(/\\D/g, '').slice(-10));

        const uniqueDids = Array.from(new Set(potentialDids)).filter(n => n.length === 10);

        if (uniqueDids.length > 0) {
            const { data: didRecords } = await supabaseAdmin
                .from('tenant_did_registry')
                .select('tenant_id, did_number')
                .in('did_number', uniqueDids)
                .eq('is_active', true);
            
            if (didRecords && didRecords.length > 0) {
                TARGET_IVR_TENANT_ID = didRecords[0].tenant_id;
                console.warn(\`✅ [CloudConnect DID-ROUTE] Found matching DID \${didRecords[0].did_number} → tenant \${TARGET_IVR_TENANT_ID}\`);
            } else {
                console.warn(\`⚠️ [CloudConnect DID-ROUTE] None of the potential DIDs (\${uniqueDids.join(', ')}) were found in registry. Falling back to default tenant.\`);
            }
        }
        // ===== END DID ROUTING =====`;

content = content.replace(didRoutingStr, '');

// 2. Insert it before // 1. Find the Lead
const insertTarget = "// 1. Find the Lead";
content = content.replace(insertTarget, didRoutingStr + '\n\n    ' + insertTarget);

fs.writeFileSync(file, content);
