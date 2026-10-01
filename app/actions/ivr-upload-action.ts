'use server'

import { createClient } from "@/lib/supabase/server"

export async function submitIvrUploadRequest(data: { campaignName: string, didNumber: string, didLabel: string, phoneNumbers: string[], notes: string }) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Unauthorized")

        const { data: profile } = await supabase.from('users').select('tenant_id, full_name').eq('id', user.id).single()
        if (!profile) throw new Error("Profile not found")

        const { data: org } = await supabase.from('organizations').select('name').eq('id', profile.tenant_id).single()

        const { error: insertError } = await supabase.from('ivr_upload_requests').insert({
            tenant_id: profile.tenant_id,
            uploaded_by: user.id,
            campaign_name: data.campaignName,
            did_number: data.didNumber,
            total_contacts: data.phoneNumbers.length,
            notes: data.notes,
            status: 'pending'
        })
        if (insertError) throw insertError

        let csvString = "phoneNumber\n" + data.phoneNumbers.join("\n")

        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
            from: 'Hanva CRM <reports@crm.hanva.in>',
            to: 'rajpootsingh260@gmail.com',
            subject: `[IVR Upload] ${org?.name || profile.tenant_id} - ${data.campaignName} - ${data.phoneNumbers.length} contacts`,
            html: `<h2>New IVR Upload Request</h2><table><tr><td><b>Tenant</b></td><td>${org?.name}</td></tr><tr><td><b>Campaign</b></td><td>${data.campaignName}</td></tr><tr><td><b>DID Number</b></td><td>${data.didNumber}</td></tr><tr><td><b>DID Label</b></td><td>${data.didLabel || 'N/A'}</td></tr><tr><td><b>Total Contacts</b></td><td>${data.phoneNumbers.length}</td></tr><tr><td><b>Notes</b></td><td>${data.notes || 'None'}</td></tr><tr><td><b>Uploaded At</b></td><td>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td></tr></table>`,
            attachments: [{ filename: data.campaignName.replace(/[^a-zA-Z0-9]/g,'_') + '_contacts.csv', content: Buffer.from(csvString).toString('base64') }]
        })

        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
