-- Reintroduce Virtual Ticket for international/online attendees.
-- Men Conference remains one event, but buyers can now choose physical or virtual access.

with event_row as (
  select id from public.events where slug = 'men-conference-nairobi-2026'
)
insert into public.ticket_types (
  event_id,
  code,
  name,
  price_kes,
  currency,
  description,
  delivery_mode,
  includes_zoom,
  requires_scheduling,
  is_public,
  sort_order,
  metadata
)
select
  event_row.id,
  'virtual',
  'Virtual Ticket',
  2500,
  'KES',
  'Online access for men joining from outside Kenya or anyone who cannot attend physically.',
  'virtual',
  true,
  true,
  true,
  4,
  jsonb_build_object(
    'target_audience', 'outside_kenya',
    'scheduling_provider', 'calendly',
    'meeting_provider', 'zoom'
  )
from event_row
on conflict (event_id, code) do update set
  name = excluded.name,
  price_kes = excluded.price_kes,
  currency = excluded.currency,
  description = excluded.description,
  delivery_mode = excluded.delivery_mode,
  includes_zoom = excluded.includes_zoom,
  requires_scheduling = excluded.requires_scheduling,
  is_public = excluded.is_public,
  sort_order = excluded.sort_order,
  metadata = excluded.metadata,
  updated_at = now();

with event_row as (
  select id from public.events where slug = 'men-conference-nairobi-2026'
)
update public.events
set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'virtual_access_enabled', true,
    'virtual_access_provider', 'zoom',
    'scheduling_provider', 'calendly'
  ),
  updated_at = now()
where id in (select id from event_row);
