import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Only target logs that specifically say "Agent: undefined" or "Agent: null"
    const { data: d1, error: e1 } = await supabaseAdmin.from('call_logs').update({ user_id: null }).like('notes', '%Agent: undefined%').select('id');
    const { data: d2, error: e2 } = await supabaseAdmin.from('call_logs').update({ user_id: null }).like('notes', '%Agent: null%').select('id');
    
    // For empty agent, it ends precisely at "Agent: " or "Agent:"
    // We can just select them first and filter in JS to be extremely safe!
    const { data: allLogs } = await supabaseAdmin.from('call_logs').select('id, notes').like('notes', '%Agent:%');
    let d3Count = 0;
    if (allLogs) {
        for (const log of allLogs) {
            if (log.notes.endsWith('Agent: ') || log.notes.endsWith('Agent:')) {
                await supabaseAdmin.from('call_logs').update({ user_id: null }).eq('id', log.id);
                d3Count++;
            }
        }
    }
    
    return NextResponse.json({ 
        success: true, 
        fixed_undefined: d1?.length || 0,
        fixed_null: d2?.length || 0,
        fixed_empty: d3Count,
        e1, e2
    })
}
