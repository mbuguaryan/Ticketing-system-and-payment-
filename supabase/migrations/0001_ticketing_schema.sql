create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'viewer' check (role in ('super_admin', 'event_admin', 'finance', 'gate_staff', 'viewer')),
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  venue text,
  city text default 'Nairobi',
  country text default 'Kenya',
  event_date date,
  start_time time,
  end_time time,
  status text not null default 'draft' check (status in ('draft', 'published', 'closed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  price numeric not null default 0,
  currency text not null default 'KES',
  delivery_mode text not null default 'physical' check (delivery_mode in ('physical', 'virtual')),
  quantity_limit integer,
  tickets_sold integer not null default 0,
  is_active boolean not null default true,
  is_public boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (event_id, code)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  buyer_name text not null,
  buyer_phone text not null,
  buyer_email text,
  quantity integer not null default 1,
  subtotal numeric not null default 0,
  service_fee numeric not null default 0,
  total_amount numeric not null default 0,
  currency text not null default 'KES',
  status text not null default 'pending' check (status in ('pending', 'awaiting_payment', 'paid', 'failed', 'cancelled', 'refunded', 'expired')),
  payment_method text not null default 'pesalink',
  payment_provider text,
  provider_reference text,
  payment_reference text unique,
  payment_access_code text,
  payment_authorization_url text,
  internal_reference text unique not null,
  paid_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  ticket_type_id uuid references public.ticket_types(id),
  quantity integer not null default 1,
  unit_price numeric not null,
  total_price numeric not null,
  created_at timestamptz not null default now()
);

create table public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'pesalink',
  provider_reference text,
  checkout_url text,
  payment_instructions jsonb,
  amount numeric not null,
  currency text not null default 'KES',
  status text not null default 'pending' check (status in ('pending', 'processing', 'paid', 'failed', 'expired', 'cancelled')),
  expires_at timestamptz,
  raw_request jsonb,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  payment_intent_id uuid references public.payment_intents(id) on delete set null,
  provider text not null,
  event_type text,
  provider_reference text,
  amount numeric,
  currency text default 'KES',
  status text,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_type text not null,
  provider_reference text,
  raw_payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  ticket_type_id uuid references public.ticket_types(id),
  ticket_code text unique not null,
  secure_token_hash text not null,
  attendee_name text not null,
  attendee_phone text not null,
  attendee_email text,
  qr_code_url text,
  status text not null default 'active' check (status in ('active', 'used', 'cancelled', 'refunded')),
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  checked_in_by uuid,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  checked_in_by uuid,
  checkin_method text not null default 'qr_scan',
  device_label text,
  location_label text,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index orders_reference_idx on public.orders(internal_reference);
create index orders_status_idx on public.orders(status);
create index tickets_code_idx on public.tickets(ticket_code);
create index tickets_order_idx on public.tickets(order_id);

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.ticket_types enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_intents enable row level security;
alter table public.payment_logs enable row level security;
alter table public.webhook_events enable row level security;
alter table public.tickets enable row level security;
alter table public.checkins enable row level security;
alter table public.audit_logs enable row level security;

create policy "public can read published events"
  on public.events for select
  using (status = 'published');

create policy "public can read active public ticket types"
  on public.ticket_types for select
  using (is_active = true and is_public = true);

create policy "public can create orders"
  on public.orders for insert
  with check (true);

create policy "public can create order items"
  on public.order_items for insert
  with check (true);

create or replace function public.increment_ticket_type_sold(ticket_type_id_input uuid, quantity_input integer)
returns void
language sql
security definer
as $$
  update public.ticket_types
  set tickets_sold = tickets_sold + quantity_input
  where id = ticket_type_id_input;
$$;
