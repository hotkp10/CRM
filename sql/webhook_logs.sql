-- Run this in your Supabase SQL Editor
create table if not exists public.webhook_logs (
    id uuid not null default gen_random_uuid(),
    endpoint text not null,
    method text not null,
    payload jsonb,
    created_at timestamp with time zone default now(),
    constraint webhook_logs_pkey primary key (id)
) TABLESPACE pg_default;

-- Add index on created_at for fast sorting
create index if not exists idx_webhook_logs_created_at on public.webhook_logs (created_at desc);

-- Allow admins to read logs
alter table public.webhook_logs enable row level security;

create policy "Admins can view webhook logs"
  on public.webhook_logs
  for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('admin', 'super_admin')
    )
  );

-- Backend will use service role to insert, so no insert policy needed.
