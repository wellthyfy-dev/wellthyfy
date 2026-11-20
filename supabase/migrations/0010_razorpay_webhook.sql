-- Razorpay webhook support.
--
-- record_razorpay_payment() now takes the student id explicitly (read from the
-- notes we stamped on the Razorpay order), so the order.paid webhook — which
-- has no signed-in user — can record a payment too. It is still gated by the
-- PAYMENTS_SECRET hash in cron_tokens; when a user *is* signed in, they must be
-- that student.
--
-- The verify route and the webhook can race for the same payment; the loser
-- now gets already_recorded = true instead of a unique-violation error.

drop function if exists public.record_razorpay_payment(text, uuid, uuid, integer, text, text);

create or replace function public.record_razorpay_payment(
  p_token       text,
  p_student     uuid,
  p_course      uuid,
  p_batch       uuid,
  p_amount_inr  integer,
  p_rzp_order   text,
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
  if p_student is null then
    raise exception 'Missing student.' using errcode = '22023';
  end if;
  if auth.uid() is not null and auth.uid() <> p_student then
    raise exception 'This payment belongs to a different account.' using errcode = '42501';
  end if;
  if coalesce(p_rzp_order, '') = '' or coalesce(p_rzp_payment, '') = '' or p_amount_inr is null then
    raise exception 'Missing payment details.' using errcode = '22023';
  end if;

  select * into v_order from public.orders o where o.razorpay_payment_id = p_rzp_payment;
  if found then
    v_again := true;
  else
    select * into v_course from public.courses c where c.id = p_course;
    if not found then
      raise exception 'That course no longer exists.' using errcode = '22023';
    end if;
    if v_course.faculty_id is not distinct from p_student then
      raise exception 'You cannot enrol in your own course.' using errcode = '42501';
    end if;
    select * into v_profile from public.profiles p where p.id = p_student;
    if not found then
      raise exception 'Missing student.' using errcode = '22023';
    end if;

    select * into v_order from public.orders o
    where o.course_id = p_course and o.student_id = p_student
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
      begin
        insert into public.orders (
          course_id, student_id, faculty_id, course_title, amount_inr,
          student_name, student_email, student_whatsapp,
          utr, batch_id, status, reviewed_at,
          payment_method, razorpay_order_id, razorpay_payment_id
        ) values (
          v_course.id, p_student, v_course.faculty_id, v_course.title, p_amount_inr,
          v_profile.full_name, v_profile.email, v_profile.whatsapp,
          p_rzp_payment, p_batch, 'verified', now(),
          'razorpay', p_rzp_order, p_rzp_payment
        )
        returning * into v_order;
      exception when unique_violation then
        -- The webhook and the verify route raced; the other one won.
        select * into v_order from public.orders o where o.razorpay_payment_id = p_rzp_payment;
        if not found then
          raise exception 'You are already enrolled in this course.' using errcode = '23505';
        end if;
        v_again := true;
      end;
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

revoke all on function public.record_razorpay_payment(text, uuid, uuid, uuid, integer, text, text) from public;
-- anon: the webhook route has no signed-in user. The secret is the gate.
grant execute on function public.record_razorpay_payment(text, uuid, uuid, uuid, integer, text, text) to anon, authenticated;
