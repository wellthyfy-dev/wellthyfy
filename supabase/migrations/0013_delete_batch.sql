-- Let faculty delete a batch they own (admins: any batch) — but only while no
-- student holds a seat in it. Deleting a batch with paid students would strand
-- them without a timetable; for those, close or cancel the batch instead.
--
-- The delete cascades to batch_sessions, batch_private and session_recordings.
-- Rejected orders that pointed at it keep their row (orders.batch_id is
-- "on delete set null").

create or replace function public.delete_batch(p_batch uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_held integer;
begin
  perform 1 from public.batches where id = p_batch for update;
  if not found or not (public.owns_batch(p_batch) or public.is_admin()) then
    raise exception 'Batch not found.' using errcode = '42501';
  end if;

  select count(*) into v_held from public.orders
   where batch_id = p_batch and status in ('pending', 'verified');
  if v_held > 0 then
    raise exception 'Students are enrolled in this batch, so it cannot be deleted. Close or complete it instead.'
      using errcode = '23514';
  end if;

  delete from public.batches where id = p_batch;
end $$;

revoke all on function public.delete_batch(uuid) from public, anon;
grant execute on function public.delete_batch(uuid) to authenticated;
