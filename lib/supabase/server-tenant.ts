import { createClient } from "@/lib/supabase/server"

// We will fetch these on the server instead of the client
export async function getGlobalTenantData() {
    try {
        const supabase = await createClient();
        
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { org: null, masterStatuses: [], announcements: [] }

        const { data: profile } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', user.id)
            .single();

        let org = null;
        if (profile?.tenant_id) {
            const { data } = await supabase
                .from("organizations")
                .select("id, name, plan, industry, enabled_statuses, enabled_modules, workflow_triggers, is_suspended")
                .eq('id', profile.tenant_id)
                .limit(1)
                .maybeSingle()
            if (data) org = data;
        }

        const { data: globalStatuses } = await supabase
            .from("global_lead_statuses")
            .select("*")
            .order("created_at", { ascending: true })

        const { data: activeAnnouncements } = await supabase
            .from("system_announcements")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false })

        return { 
            org, 
            masterStatuses: globalStatuses || [],
            announcements: activeAnnouncements || []
        }
    } catch (error) {
        console.error("Error fetching global tenant data:", error)
        return { org: null, masterStatuses: [], announcements: [] }
    }
}
