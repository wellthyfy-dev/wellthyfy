-- Let a student pick a batch for an enrolment that has none.
--
-- Students who paid before any batch existed (or for a course that had no open
-- batch at the time) hold an order with batch_id = null, so no timetable or
-- Join button ever appears for them. Students cannot update orders directly,
-- so this narrow function does exactly one thing: attach a batch to their own
-- batch-less, non-rejected order. orders_batch_guard() still enforces that the
-- batch belongs to the same course, is open, and has a free seat.

create or replace function public.choose_batch(p_order uuid, p_batch uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order for update;

  if not found or v_order.student_id is distinct from auth.uid() then
    raise exception 'Enrolment not found.' using errcode = '42501';
  end if;
  if v_order.status = 'rejected' then
    raise exception 'This enrolment was not approved.' using errcode = '23514';
  end if;
  if v_order.batch_id is not null then
    raise exception 'You already have a batch for this course.' using errcode = '23514';
  end if;

  update public.orders set batch_id = p_batch where id = p_order;
end $$;

revoke all on function public.choose_batch(uuid, uuid) from public, anon;
grant execute on function public.choose_batch(uuid, uuid) to authenticated;
