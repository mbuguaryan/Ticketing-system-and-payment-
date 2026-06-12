-- Align Supabase ticket types with the single-event conversion page.
-- This keeps the Men Conference flow focused on only the real public offers.

with event_row as (
  select id from public.events where slug = 'men-conference-nairobi-2026'
)
update public.ticket_types
set is_public = false,
    updated_at = now()
where event_id in (select id from event_row)
  and code in ('virtual', 'vip', 'group');

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
  sort_order
)
select event_row.id, values_table.code, values_table.name, values_table.price_kes, 'KES', values_table.description, 'physical', false, false, true, values_table.sort_order
from event_row
cross join (values
  ('early-bird', 'Early Bird', 2500, 'Single in-person access at KICC Nairobi.', 1),
  ('two-men', '2 Men', 4500, 'Bring one brother, friend, colleague, son, or partner.', 2),
  ('five-men', '5 Men', 10000, 'Best for teams, churches, families, and men’s groups.', 3)
) as values_table(code, name, price_kes, description, sort_order)
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
  updated_at = now();
