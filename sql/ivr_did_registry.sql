-- ============================================================
-- IVR DID Registry System
-- Run this in your Supabase SQL Editor
-- ============================================================

-- TABLE 1: Maps DID phone numbers to tenants
create table if not exists public.tenant_did_registry (
  id uuid not null default gen_random_uuid(),
  tenant_id text not null,
  did_number text not null,
  label text null,
  is_active boolean not null default true,
  created_at timestamp with time zone null default now(),
  constraint tenant_did_registry_pkey primary key (id),
  constraint tenant_did_registry_did_number_key unique (did_number)
) TABLESPACE pg_default;

-- Index for fast DID lookups in the webhook
create index if not exists idx_tenant_did_registry_did_number
  on public.tenant_did_registry (did_number)
  where is_active = true;

-- Row Level Security
alter table public.tenant_did_registry enable row level security;

-- Tenants can only read their own DIDs (for the dropdown on the upload page)
create policy "Tenants can read their own DIDs"
  on public.tenant_did_registry
  for select
  using (
    tenant_id = (
      select tenant_id from public.users where id = auth.uid() limit 1
    )
  );

-- Only service role (backend) can insert/update/delete
-- Super admin page uses service role key via supabaseAdmin, so this is correct.

-- ============================================================

-- TABLE 2: Tracks every IVR upload request made by tenants
create table if not exists public.ivr_upload_requests (
  id uuid not null default gen_random_uuid(),
  tenant_id text not null,
  uploaded_by uuid null references public.users(id),
  campaign_name text not null,
  total_contacts integer not null default 0,
  did_number text null,
  notes text null,
  status text not null default 'pending', -- pending | running | completed | cancelled
  created_at timestamp with time zone null default now(),
  constraint ivr_upload_requests_pkey primary key (id)
) TABLESPACE pg_default;

-- Index so tenant's history table loads fast
create index if not exists idx_ivr_upload_requests_tenant_id
  on public.ivr_upload_requests (tenant_id, created_at desc);

-- Row Level Security
alter table public.ivr_upload_requests enable row level security;

-- Tenants can only see their own upload requests
create policy "Tenants can read their own upload requests"
  on public.ivr_upload_requests
  for select
  using (
    tenant_id = (
      select tenant_id from public.users where id = auth.uid() limit 1
    )
  );

-- Tenants can insert their own upload requests
create policy "Tenants can insert their own upload requests"
  on public.ivr_upload_requests
  for insert
  with check (
    tenant_id = (
      select tenant_id from public.users where id = auth.uid() limit 1
    )
  );
