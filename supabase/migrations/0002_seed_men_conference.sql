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
  'men-conference-2026',
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
  status = excluded.status,
  updated_at = now();

with event_row as (
  select id from public.events where slug = 'men-conference-2026'
)
insert into public.ticket_types (event_id, code, name, description, price, currency, delivery_mode, quantity_limit, is_active, is_public, sort_order)
select id, 'early-bird', 'Early Bird', 'Physical KICC access', 2500, 'KES', 'physical', 300, true, true, 1 from event_row
union all
select id, 'two-men', '2 Men', 'Physical KICC access for two men', 4500, 'KES', 'physical', null, true, true, 2 from event_row
union all
select id, 'five-men', '5 Men', 'Physical KICC access for five men', 10000, 'KES', 'physical', null, true, true, 3 from event_row
union all
select id, 'virtual', 'Virtual Ticket', 'Zoom/online access for outside-Kenya buyers', 2500, 'KES', 'virtual', null, true, true, 4 from event_row
on conflict (event_id, code) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  currency = excluded.currency,
  delivery_mode = excluded.delivery_mode,
  quantity_limit = excluded.quantity_limit,
  is_active = excluded.is_active,
  is_public = excluded.is_public,
  sort_order = excluded.sort_order;
