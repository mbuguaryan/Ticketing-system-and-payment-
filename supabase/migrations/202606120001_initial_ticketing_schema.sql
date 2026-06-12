create extension if not exists pgcrypto;

create table if not exists public.ticket_types (
  id text primary key,
  name text not null,
  price_kes integer not null check (price_kes >= 0),
  description text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_full_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  ticket_type_id text not null references public.ticket_types(id),
  quantity integer not null check (quantity > 0),
  amount_kes integer not null check (amount_kes >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  payment_provider text not null default 'paystack',
  payment_reference text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  ticket_code text not null unique,
  holder_name text not null,
  holder_email text not null,
  ticket_type_id text not null references public.ticket_types(id),
  status text not null default 'valid' check (status in ('valid', 'checked_in', 'cancelled')),
  checked_in_at timestamptz,
  checked_in_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  provider text not null,
  reference text,
  event_type text,
  amount integer,
  currency text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.ticket_types (id, name, price_kes, description, is_public)
values
  ('early-bird', 'Early Bird', 1000, 'Limited early access ticket for Men Conference Nairobi 2026.', true),
  ('regular', 'Regular', 1500, 'Standard conference access ticket.', true),
  ('vip', 'VIP', 3000, 'Priority conference access and VIP experience.', true),
  ('group', 'Group Ticket', 0, 'For churches, teams, organizations, and group leaders. Contact admin for pricing.', true),
  ('sponsor-pass', 'Sponsor Pass', 0, 'Admin-created sponsor pass.', false)
on conflict (id) do update set
  name = excluded.name,
  price_kes = excluded.price_kes,
  description = excluded.description,
  is_public = excluded.is_public;

alter table public.ticket_types enable row level security;
alter table public.orders enable row level security;
alter table public.tickets enable row level security;
alter table public.payment_logs enable row level security;

create policy "Public can read public ticket types"
  on public.ticket_types for select
  using (is_public = true);

create policy "Public can create pending orders"
  on public.orders for insert
  with check (status = 'pending');

create policy "Public can read ticket by code"
  on public.tickets for select
  using (true);
