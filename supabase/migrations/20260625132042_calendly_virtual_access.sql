create table if not exists public.calendly_schedules (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.ticket_orders(id) on delete set null,
  ticket_id uuid references public.tickets(id) on delete set null,
  ticket_code text,
  invitee_uri text unique,
  invitee_email text,
  invitee_name text,
  event_uri text,
  scheduled_event_uri text,
  scheduled_start_time timestamptz,
  scheduled_end_time timestamptz,
  location jsonb not null default '{}'::jsonb,
  zoom_join_url text,
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled')),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.calendly_schedules enable row level security;

create index if not exists calendly_schedules_order_idx on public.calendly_schedules(order_id);
create index if not exists calendly_schedules_ticket_code_idx on public.calendly_schedules(ticket_code);
create index if not exists calendly_schedules_invitee_email_idx on public.calendly_schedules(invitee_email);
