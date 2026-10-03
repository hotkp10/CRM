const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
async function check() {
  const res = await supabase.from('tenant_did_registry').select('*');
  console.log("Result:", JSON.stringify(res, null, 2));
}
check();
