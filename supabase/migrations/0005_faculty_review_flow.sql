-- Wellthyfy — two-stage faculty flow.
--
--   1. Apply: personal details, qualification and a government ID only.
--   2. Admin approves the PERSON and assigns an @wellthyfy.in mail id.
--   3. Faculty signs up with that mail id and creates courses.
--   4. Every course (and every change to a live course) is approved by an
--      admin before it is shown on the site.
--
-- Requires 0004 (the 'pending_review' / 'rejected' course statuses).

-- ── Applications no longer carry a course ────────────────────────────────────
alter table public.faculty_applications
  add column if not exists qualification text;
alter table public.faculty_applications
  drop constraint if exists faculty_applications_qualification_check;
alter table public.faculty_applications
  add constraint faculty_applications_qualification_check
  check (qualification is null or char_length(qualification) between 2 and 1000);

alter table public.faculty_applications alter column experience         drop not null;
alter table public.faculty_applications alter column course_title       drop not null;
alter table public.faculty_applications alter column course_description drop not null;
alter table public.faculty_applications alter column category           drop not null;
alter table public.faculty_applications alter column subcategory        drop not null;
alter table public.faculty_applications alter column mode               drop not null;
alter table public.faculty_applications alter column fee_inr            drop not null;

-- ── Course review fields ─────────────────────────────────────────────────────
alter table public.courses add column if not exists review_note  text;
alter table public.courses add column if not exists submitted_at timestamptz;
alter table public.courses add column if not exists reviewed_at  timestamptz;
alter table public.courses drop constraint if exists courses_review_note_check;
alter table public.courses add constraint courses_review_note_check
  check (review_note is null or char_length(review_note) <= 1000);

create index if not exists courses_review_queue_idx
  on public.courses (submitted_at) where status = 'pending_review';

-- ── Faculty can never publish their own course ───────────────────────────────
-- RLS lets faculty write their own rows; this trigger decides WHICH statuses
-- they may move between. Admins (and server-side code with no end-user JWT,
-- such as the signup trigger) are unrestricted.
create or replace function public.courses_review_guard()
returns trigger language plpgsql set search_path = public as $$
declare
  v_meta    text[] := array['status', 'published_at', 'updated_at',
                            'review_note', 'submitted_at', 'reviewed_at'];
  v_changed boolean;
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'pending_review') then
      raise exception 'Courses are published by Wellthyfy after review.' using errcode = '42501';
    end if;
    new.published_at := null;
    new.review_note  := null;
    new.reviewed_at  := null;
    new.submitted_at := case when new.status = 'pending_review' then now() end;
    return new;
  end if;

  -- Review outcome fields belong to admins.
  new.review_note := old.review_note;
  new.reviewed_at := old.reviewed_at;

  v_changed := (to_jsonb(new) - v_meta) is distinct from (to_jsonb(old) - v_meta);

  if new.status = 'published' then
    if old.status <> 'published' then
      raise exception 'Courses are published by Wellthyfy after review.' using errcode = '42501';
    end if;
    if v_changed then
      -- An edit to a live course is re-reviewed before the public sees it.
      new.status       := 'pending_review';
      new.published_at := null;
      new.submitted_at := now();
    else
      new.published_at := old.published_at;
      new.submitted_at := old.submitted_at;
    end if;
  elsif new.status = 'rejected' then
    if old.status <> 'rejected' then
      raise exception 'Only Wellthyfy can reject a course.' using errcode = '42501';
    end if;
    new.published_at := null;
  elsif new.status = 'pending_review' then
    new.published_at := null;
    new.submitted_at := case when old.status = 'pending_review' and not v_changed
                             then old.submitted_at else now() end;
  else -- draft / archived
    new.published_at := null;
  end if;

  return new;
end $$;

drop trigger if exists courses_review_guard on public.courses;
create trigger courses_review_guard
  before insert or update on public.courses
  for each row execute function public.courses_review_guard();

-- ── Approving an application approves the person, not a course ───────────────
create or replace function public.approve_faculty_application(
  p_id uuid, p_email text, p_note text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  a       public.faculty_applications;
  v_email text := lower(trim(p_email));
  v_token text;
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;

  select * into a from public.faculty_applications where id = p_id for update;
  if not found then raise exception 'Application not found'; end if;
  if a.status <> 'pending' then
    raise exception 'This application has already been %', a.status;
  end if;

  if v_email !~ '^[a-z0-9._%+-]+@wellthyfy\.in$' then
    raise exception 'The faculty mail id must be an @wellthyfy.in address';
  end if;
  if exists (select 1 from public.faculty_applications where lower(assigned_email) = v_email) then
    raise exception 'That mail id is already assigned to another applicant';
  end if;
  if exists (select 1 from public.profiles where lower(email) = v_email) then
    raise exception 'That mail id already has an account';
  end if;

  v_token := encode(extensions.gen_random_bytes(24), 'hex');

  update public.faculty_applications
     set status = 'approved', assigned_email = v_email, invite_token = v_token,
         admin_note = nullif(trim(p_note), ''), reviewed_at = now(), reviewed_by = auth.uid()
   where id = p_id;

  return jsonb_build_object('token', v_token);
end $$;
revoke all on function public.approve_faculty_application(uuid, text, text) from public, anon;
grant execute on function public.approve_faculty_application(uuid, text, text) to authenticated;
