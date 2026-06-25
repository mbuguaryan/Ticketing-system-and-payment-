-- Make ticket issuing idempotent so callbacks and provider notifications cannot create duplicate tickets.

create or replace function public.issue_tickets_for_order(p_order_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  created_count integer := 0;
  existing_count integer := 0;
  tickets_to_create integer := 0;
  i integer;
  v_order record;
begin
  select * into v_order from public.ticket_orders where id = p_order_id;

  if v_order.id is null then
    raise exception 'order_not_found';
  end if;

  if v_order.status <> 'paid' then
    raise exception 'order_not_paid';
  end if;

  for item in
    select oi.*, tt.delivery_mode
    from public.ticket_order_items oi
    join public.ticket_types tt on tt.id = oi.ticket_type_id
    where oi.order_id = p_order_id
  loop
    select count(*) into existing_count
    from public.tickets
    where order_id = p_order_id
      and ticket_type_id = item.ticket_type_id;

    tickets_to_create := greatest(item.quantity - existing_count, 0);

    for i in 1..tickets_to_create loop
      insert into public.tickets (
        event_id,
        order_id,
        ticket_type_id,
        ticket_code,
        secure_token_hash,
        attendee_name,
        attendee_phone,
        attendee_email,
        holder_name,
        holder_email,
        status,
        delivery_mode,
        qr_payload
      )
      values (
        v_order.event_id,
        p_order_id,
        item.ticket_type_id,
        public.generate_ticket_code(),
        encode(gen_random_bytes(32), 'hex'),
        v_order.buyer_full_name,
        v_order.buyer_phone,
        v_order.buyer_email,
        v_order.buyer_full_name,
        v_order.buyer_email,
        'valid',
        item.delivery_mode,
        jsonb_build_object('order_id', p_order_id, 'event_id', v_order.event_id)
      );

      created_count := created_count + 1;
    end loop;
  end loop;

  return created_count;
end;
$$;
