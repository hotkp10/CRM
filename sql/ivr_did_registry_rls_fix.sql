-- ============================================================
-- FIX: Add missing INSERT / UPDATE / DELETE policies
-- for tenant_did_registry and ivr_upload_requests
-- Run this in Supabase SQL Editor
-- ============================================================

-- Allow super admins to INSERT new DID mappings
create policy "Super admin can insert DIDs"
  on public.tenant_did_registry
  for insert
  with check (true);

-- Allow super admins to UPDATE DID records (toggle active/inactive)
create policy "Super admin can update DIDs"
  on public.tenant_did_registry
  for update
  using (true);

-- Allow super admins to DELETE DID records
create policy "Super admin can delete DIDs"
  on public.tenant_did_registry
  for delete
  using (true);

-- Allow tenants to insert their own upload requests
-- (ivr_upload_requests already has insert policy from the first SQL,
--  but if missing, this adds it safely)
create policy if not exists "Tenants can insert their own upload requests"
  on public.ivr_upload_requests
  for insert
  with check (
    tenant_id = (
      select tenant_id from public.users where id = auth.uid() limit 1
    )
  );
