-- Razorpay Standard Checkout for course enrolment.
--
-- Flow: /api/razorpay/create-order opens a Razorpay order (nothing is written
-- here, so an abandoned checkout never holds a seat). After the student pays,
-- /api/razorpay/verify-payment checks the HMAC signature with the key secret
-- and then calls record_razorpay_payment(), which writes a *verified* order.
--
-- The app has no service-role key on purpose, so the function is security
-- definer and gated by a shared secret (PAYMENTS_SECRET) whose SHA-256 lives in
-- public.cron_tokens — the same pattern as the reminder cron. A student calling
-- the RPC directly cannot mark their own order paid without that secret.
--
-- One-time setup after running this file (replace <PAYMENTS_SECRET>):
--   insert into public.cron_tokens (name, token_hash)
--   values ('payments', encode(extensions.digest(convert_to('<PAYMENTS_SECRET>', 'UTF8'), 'sha256'), 'hex'))
--   on conflict (name) do update set token_hash = excluded.token_hash;

-- ── Orders: how they were paid ───────────────────────────────────────────────
alter table public.orders add column if not exists payment_method text not null default 'upi';
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('upi', 'razorpay'));
alter table public.orders add column if not exists razorpay_order_id text;
alter table public.orders add column if not exists razorpay_payment_id text;
create unique index if not exists orders_razorpay_payment_idx
  on public.orders (razorpay_payment_id) where razorpay_payment_id is not null;

-- Students insert manual-UPI orders only; Razorpay orders come from the RPC.
drop policy if exists orders_insert_student on public.orders;
create policy orders_insert_student on public.orders
  for insert with check (
    student_id = auth.uid()
    and status = 'pending'
    and reviewed_at is null
    and payment_method = 'upi'
    and razorpay_order_id is null
    and razorpay_payment_id is null
    and exists (
      select 1 from public.courses c
      where c.id = course_id
        and c.status = 'published'
        and c.price_inr = amount_inr
        and c.title = course_title
        and c.faculty_id is not distinct from orders.faculty_id
        and c.faculty_id is distinct from auth.uid()
    )
    and (
      batch_id is null
      or exists (select 1 from public.batches b where b.id = batch_id and b.course_id = orders.course_id)
    )
  );

/**
 * Records a Razorpay payment the server has already verified, as a verified
 * order for the signed-in student. Idempotent on the payment id. An existing
 * pending or rejected manual-UPI order for the same course is upgraded in
 * place (the student paid by card/UPI through Razorpay instead).
 *
 * Seat limits still apply through orders_batch_guard; if the last seat went
 * while the student was paying, this raises 23514 and the route tells them the
 * team will refund or move them.
 */
create or replace function public.record_razorpay_payment(
  p_token      text,
  p_course     uuid,
  p_batch      uuid,
  p_amount_inr integer,
  p_rzp_order  text,
  p_rzp_payment text
)
returns table (
  id               uuid,
  course_id        uuid,
  faculty_id       uuid,
  batch_id         uuid,
  course_title     text,
  amount_inr       integer,
  utr              text,
  student_name     text,
  student_email    text,
  student_whatsapp text,
  faculty_email    text,
  faculty_name     text,
  course_slug      text,
  already_recorded boolean
)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_uid     uuid := auth.uid();
  v_course  public.courses%rowtype;
  v_profile public.profiles%rowtype;
  v_order   public.orders%rowtype;
  v_again   boolean := false;
begin
  if not exists (
    select 1 from public.cron_tokens t
    where t.name = 'payments'
      and t.token_hash = encode(extensions.digest(convert_to(coalesce(p_token, ''), 'UTF8'), 'sha256'), 'hex')
  ) then
    raise exception 'Not allowed.' using errcode = '42501';
  end if;
  if v_uid is null then
    raise exception 'Sign in to enrol.' using errcode = '42501';
  end if;
  if coalesce(p_rzp_order, '') = '' or coalesce(p_rzp_payment, '') = '' or p_amount_inr is null then
    raise exception 'Missing payment details.' using errcode = '22023';
  end if;

  select * into v_order from public.orders o where o.razorpay_payment_id = p_rzp_payment;
  if found then
    if v_order.student_id <> v_uid then
      raise exception 'Not allowed.' using errcode = '42501';
    end if;
    v_again := true;
  else
    select * into v_course from public.courses c where c.id = p_course;
    if not found then
      raise exception 'That course no longer exists.' using errcode = '22023';
    end if;
    if v_course.faculty_id is not distinct from v_uid then
      raise exception 'You cannot enrol in your own course.' using errcode = '42501';
    end if;
    select * into v_profile from public.profiles p where p.id = v_uid;

    select * into v_order from public.orders o
    where o.course_id = p_course and o.student_id = v_uid
    for update;

    if found then
      if v_order.status = 'verified' then
        raise exception 'You are already enrolled in this course.' using errcode = '23505';
      end if;
      update public.orders o set
        status              = 'verified',
        reviewed_at         = now(),
        batch_id            = coalesce(p_batch, o.batch_id),
        amount_inr          = p_amount_inr,
        utr                 = p_rzp_payment,
        payment_method      = 'razorpay',
        razorpay_order_id   = p_rzp_order,
        razorpay_payment_id = p_rzp_payment
      where o.id = v_order.id
      returning * into v_order;
    else
      insert into public.orders (
        course_id, student_id, faculty_id, course_title, amount_inr,
        student_name, student_email, student_whatsapp,
        utr, batch_id, status, reviewed_at,
        payment_method, razorpay_order_id, razorpay_payment_id
      ) values (
        v_course.id, v_uid, v_course.faculty_id, v_course.title, p_amount_inr,
        v_profile.full_name, v_profile.email, v_profile.whatsapp,
        p_rzp_payment, p_batch, 'verified', now(),
        'razorpay', p_rzp_order, p_rzp_payment
      )
      returning * into v_order;
    end if;
  end if;

  return query
  select v_order.id, v_order.course_id, v_order.faculty_id, v_order.batch_id,
         v_order.course_title, v_order.amount_inr, v_order.utr,
         v_order.student_name, v_order.student_email, v_order.student_whatsapp,
         f.email, f.full_name, c.slug, v_again
  from public.courses c
  left join public.profiles f on f.id = v_order.faculty_id
  where c.id = v_order.course_id;
end $$;

revoke all on function public.record_razorpay_payment(text, uuid, uuid, integer, text, text) from public;
grant execute on function public.record_razorpay_payment(text, uuid, uuid, integer, text, text) to authenticated;
