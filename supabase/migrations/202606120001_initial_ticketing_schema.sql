create extension if not exists pgcrypto;

create table if not exists public.ticket_types (
  id text primary key,
  name text not null,
  price_kes integer not null check (price_kes >= 0),
  description text,
  is_public boolean not null default true,
  delivery_mode text not null default 'physical' check (delivery_mode in ('physical', 'virtual', 'manual')),
  includes_zoom boolean not null default false,
  requires_scheduling boolean not null default false,
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
  calendly_invitee_uri text,
  calendly_event_uri text,
  zoom_join_url text,
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

create table if not exists public.assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_email text,
  buyer_phone text,
  message text not null,
  reply text not null,
  intent text,
  created_at timestamptz not null default now()
);

insert into public.ticket_types (id, name, price_kes, description, is_public, delivery_mode, includes_zoom, requires_scheduling)
values
  ('early-bird', 'Early Bird Physical Ticket', 2500, 'Early Bird access for the in-person Men Conference Nairobi 2026 experience at KICC.', true, 'physical', false, false),
  ('virtual', 'Virtual Ticket', 2500, 'Virtual access for attendees joining online through the official Zoom session.', true, 'virtual', true, true),
  ('vip', 'VIP', 5000, 'Priority conference access and premium experience.', true, 'physical', false, false),
  ('group', 'Group Ticket', 0, 'For churches, teams, organizations, and group leaders. Contact admin for pricing.', true, 'manual', false, true),
  ('sponsor-pass', 'Sponsor Pass', 0, 'Admin-created sponsor pass.', false, 'manual', false, false)
on conflict (id) do update set
  name = excluded.name,
  price_kes = excluded.price_kes,
  description = excluded.description,
  is_public = excluded.is_public,
  delivery_mode = excluded.delivery_mode,
  includes_zoom = excluded.includes_zoom,
  requires_scheduling = excluded.requires_scheduling;

alter table public.ticket_types enable row level security;
alter table public.orders enable row level security;
alter table public.tickets enable row level security;
alter table public.payment_logs enable row level security;
alter table public.assistant_conversations enable row level security;

create policy "Public can read public ticket types"
  on public.ticket_types for select
  using (is_public = true);

create policy "Public can create pending orders"
  on public.orders for insert
  with check (status = 'pending');

create policy "Public can read ticket by code"
  on public.tickets for select
  using (true);

create policy "Public can create assistant conversations"
  on public.assistant_conversations for insert
  with check (true);
