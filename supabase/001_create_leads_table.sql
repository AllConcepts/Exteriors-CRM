-- =============================================================================
-- Leads Table — stores every lead created by canvassers
-- =============================================================================
-- Run this in your Supabase dashboard:
-- 1. Go to supabase.com → your project → SQL Editor
-- 2. Paste this entire file and click "Run"
-- =============================================================================

create table public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- Who created this lead
  created_by uuid references auth.users(id) not null,

  -- Homeowner info
  homeowner_name text not null,
  phone text,
  email text,

  -- Property address
  address text not null,
  city text not null,
  state text not null default 'TX',
  zip text,

  -- Lead details
  status text not null default 'new' check (
    status in ('new', 'contacted', 'appointment_set', 'not_interested', 'not_home', 'sold')
  ),
  notes text,

  -- Source tracking
  source text not null default 'canvassing' check (
    source in ('canvassing', 'referral', 'website', 'phone', 'other')
  )
);

-- Enable Row Level Security (RLS) — only logged-in users can access leads
alter table public.leads enable row level security;

-- Policy: any logged-in user can view all leads (your team shares leads)
create policy "Team members can view all leads"
  on public.leads for select
  to authenticated
  using (true);

-- Policy: any logged-in user can create leads
create policy "Team members can create leads"
  on public.leads for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Policy: any logged-in user can update leads
create policy "Team members can update leads"
  on public.leads for update
  to authenticated
  using (true);

-- Auto-update the updated_at timestamp whenever a lead is modified
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_lead_updated
  before update on public.leads
  for each row execute function public.handle_updated_at();
