const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
async function check() {
  const { data } = await supabase.from('ivr_call_logs').select('clid, mobile_number, tenant_id, created_at').order('created_at', { ascending: false }).limit(5);
  console.log("Recent IVR Logs:", JSON.stringify(data, null, 2));
}
check();
