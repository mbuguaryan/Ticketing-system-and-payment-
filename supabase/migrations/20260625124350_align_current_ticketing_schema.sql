-- Align already-applied databases with the current Paystack ticketing app schema.
-- This is intentionally guarded and preserves existing data where possible.

create extension if not exists pgcrypto;

alter table if exists public.events
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table if exists public.events
  add column if not exists updated_at timestamptz not null default now();

insert into public.events (
  name,
  slug,
  description,
  venue,
  city,
  country,
  event_date,
  start_time,
  end_time,
  status
)
values (
  '2026 Men Conference Nairobi',
  'men-conference-nairobi-2026',
  'Men''s Conference 2026 Live in Nairobi at KICC, hosted by Keith Muoki.',
  'KICC Nairobi',
  'Nairobi',
  'Kenya',
  '2026-08-15',
  '12:00',
  '17:00',
  'published'
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  venue = excluded.venue,
  city = excluded.city,
  country = excluded.country,
  event_date = excluded.event_date,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  status = excluded.status,
  updated_at = now();

alter table if exists public.ticket_types
  add column if not exists price_kes integer,
  add column if not exists includes_zoom boolean not null default false,
  add column if not exists requires_scheduling boolean not null default false,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

update public.ticket_types
set price_kes = coalesce(price_kes, round(price)::integer, 0)
where price_kes is null;

alter table public.ticket_types alter column price_kes set default 0;
alter table public.ticket_types alter column price_kes set not null;

create table if not exists public.ticket_orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  buyer_full_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  status text not null default 'pending',
  amount_kes integer not null check (amount_kes >= 0),
  currency text not null default 'KES',
  payment_provider text not null default 'paystack',
  payment_reference text unique,
  payment_access_code text,
  payment_authorization_url text,
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ticket_orders_status_check check (
    status in ('pending', 'payment_initialized', 'paid', 'failed', 'cancelled', 'refunded')
  )
);

alter table public.ticket_orders add column if not exists event_id uuid references public.events(id) on delete cascade;
alter table public.ticket_orders add column if not exists buyer_full_name text;
alter table public.ticket_orders add column if not exists buyer_email text;
alter table public.ticket_orders add column if not exists buyer_phone text;
alter table public.ticket_orders add column if not exists status text not null default 'pending';
alter table public.ticket_orders add column if not exists amount_kes integer not null default 0;
alter table public.ticket_orders add column if not exists currency text not null default 'KES';
alter table public.ticket_orders add column if not exists payment_provider text not null default 'paystack';
alter table public.ticket_orders add column if not exists payment_reference text;
alter table public.ticket_orders add column if not exists payment_access_code text;
alter table public.ticket_orders add column if not exists payment_authorization_url text;
alter table public.ticket_orders add column if not exists failure_reason text;
alter table public.ticket_orders add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.ticket_orders add column if not exists paid_at timestamptz;
alter table public.ticket_orders add column if not exists created_at timestamptz not null default now();
alter table public.ticket_orders add column if not exists updated_at timestamptz not null default now();

update public.ticket_orders
set status = case
  when status = 'awaiting_payment' then 'payment_initialized'
  when status = 'expired' then 'failed'
  else status
end
where status in ('awaiting_payment', 'expired');

alter table public.ticket_orders drop constraint if exists ticket_orders_status_check;
alter table public.ticket_orders add constraint ticket_orders_status_check
  check (status in ('pending', 'payment_initialized', 'paid', 'failed', 'cancelled', 'refunded'));

create table if not exists public.ticket_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.ticket_orders(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id),
  quantity integer not null check (quantity > 0),
  unit_price_kes integer not null check (unit_price_kes >= 0),
  total_price_kes integer not null check (total_price_kes >= 0),
  created_at timestamptz not null default now()
);

alter table public.ticket_order_items add column if not exists order_id uuid references public.ticket_orders(id) on delete cascade;
alter table public.ticket_order_items add column if not exists ticket_type_id uuid references public.ticket_types(id);
alter table public.ticket_order_items add column if not exists quantity integer not null default 1;
alter table public.ticket_order_items add column if not exists unit_price_kes integer not null default 0;
alter table public.ticket_order_items add column if not exists total_price_kes integer not null default 0;
alter table public.ticket_order_items add column if not exists created_at timestamptz not null default now();

insert into public.ticket_orders (
  id,
  event_id,
  buyer_full_name,
  buyer_email,
  buyer_phone,
  status,
  amount_kes,
  currency,
  payment_provider,
  payment_reference,
  payment_access_code,
  payment_authorization_url,
  paid_at,
  created_at,
  updated_at
)
select
  o.id,
  o.event_id,
  coalesce(o.buyer_name, 'Ticket Buyer'),
  coalesce(o.buyer_email, ''),
  coalesce(o.buyer_phone, ''),
  case
    when o.status = 'awaiting_payment' then 'payment_initialized'
    when o.status = 'expired' then 'failed'
    else o.status
  end,
  greatest(round(coalesce(o.total_amount, o.subtotal, 0))::integer, 0),
  coalesce(o.currency, 'KES'),
  coalesce(o.payment_provider, 'paystack'),
  o.payment_reference,
  o.payment_access_code,
  o.payment_authorization_url,
  o.paid_at,
  o.created_at,
  o.updated_at
from public.orders o
on conflict (id) do nothing;

insert into public.ticket_order_items (
  id,
  order_id,
  ticket_type_id,
  quantity,
  unit_price_kes,
  total_price_kes,
  created_at
)
select
  oi.id,
  oi.order_id,
  oi.ticket_type_id,
  greatest(coalesce(oi.quantity, 1), 1),
  greatest(round(coalesce(oi.unit_price, 0))::integer, 0),
  greatest(round(coalesce(oi.total_price, 0))::integer, 0),
  oi.created_at
from public.order_items oi
where exists (select 1 from public.ticket_orders o where o.id = oi.order_id)
on conflict (id) do nothing;

alter table public.tickets add column if not exists holder_name text;
alter table public.tickets add column if not exists holder_email text;
alter table public.tickets add column if not exists delivery_mode text not null default 'physical';
alter table public.tickets add column if not exists qr_payload jsonb not null default '{}'::jsonb;

update public.tickets
set
  holder_name = coalesce(holder_name, attendee_name, 'Ticket Holder'),
  holder_email = coalesce(holder_email, attendee_email, ''),
  status = case
    when status = 'active' then 'valid'
    when status = 'used' then 'checked_in'
    else status
  end
where holder_name is null
   or holder_email is null
   or status in ('active', 'used');

alter table public.tickets alter column holder_name set not null;
alter table public.tickets alter column holder_email set not null;
alter table public.tickets alter column status set default 'valid';
alter table public.tickets drop constraint if exists tickets_status_check;
alter table public.tickets add constraint tickets_status_check
  check (status in ('valid', 'checked_in', 'cancelled', 'refunded'));
alter table public.tickets drop constraint if exists tickets_order_id_fkey;
alter table public.tickets add constraint tickets_order_id_fkey
  foreign key (order_id) references public.ticket_orders(id) on delete set null;

alter table public.payment_logs add column if not exists reference text;
alter table public.payment_logs add column if not exists payload jsonb not null default '{}'::jsonb;

update public.payment_logs
set
  reference = coalesce(reference, provider_reference),
  payload = case
    when payload <> '{}'::jsonb then payload
    else coalesce(raw_payload, '{}'::jsonb)
  end
where reference is null
   or payload = '{}'::jsonb;

alter table public.payment_logs drop constraint if exists payment_logs_order_id_fkey;
alter table public.payment_logs add constraint payment_logs_order_id_fkey
  foreign key (order_id) references public.ticket_orders(id) on delete set null;

create table if not exists public.checkin_logs (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.tickets(id) on delete set null,
  ticket_code text not null,
  result text not null,
  actor_label text,
  detail text,
  created_at timestamptz not null default now()
);

create or replace function public.generate_ticket_code()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := 'MNC2026-' || upper(encode(gen_random_bytes(5), 'hex'));
    exit when not exists (
      select 1 from public.tickets where ticket_code = candidate
    );
  end loop;

  return candidate;
end;
$$;

alter table public.ticket_orders enable row level security;
alter table public.ticket_order_items enable row level security;
alter table public.checkin_logs enable row level security;

drop policy if exists "Public can read ticket by code" on public.tickets;
drop policy if exists "Public can create pending ticket orders" on public.ticket_orders;
drop policy if exists "Public can create ticket order items" on public.ticket_order_items;

create policy "Public can create pending ticket orders"
  on public.ticket_orders for insert
  with check (status = 'pending');

create policy "Public can create ticket order items"
  on public.ticket_order_items for insert
  with check (true);

create index if not exists ticket_orders_status_idx on public.ticket_orders(status);
create index if not exists ticket_orders_payment_reference_idx on public.ticket_orders(payment_reference);
create index if not exists ticket_order_items_order_idx on public.ticket_order_items(order_id);
create index if not exists tickets_order_ticket_type_idx on public.tickets(order_id, ticket_type_id);
