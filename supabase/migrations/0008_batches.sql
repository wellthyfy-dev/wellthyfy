-- Wellthyfy: live-class batches (Phase 1).
--
--   Course (approved once)
--    └── Batch: a group of up to `seats` students on one timetable
--          └── Sessions: generated from the timetable (IST)
--                └── Recording (recap): visible only to that batch, forever
--
-- Students pick a batch when they enrol. A pending payment holds the seat; a
-- rejected one frees it. Only one online class can run at a time (one Zoom
-- licence), so online/hybrid sessions may not overlap across the whole site.
--
-- Private things live in their own tables so the public timetable can be read
-- by anyone without exposing them:
--   batch_private      the meeting link (faculty, admin, verified students)
--   session_recordings recap links    (faculty, admin, verified students)

do $$ begin
  create type public.batch_mode as enum ('online', 'offline', 'hybrid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.batch_status as enum ('open', 'closed', 'cancelled', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.session_status as enum ('scheduled', 'cancelled');
exception when duplicate_object then null; end $$;

-- ── Tables ───────────────────────────────────────────────────────────────────
create table if not exists public.batches (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses (id) on delete cascade,
  faculty_id    uuid not null references public.profiles (id) on delete cascade,
  name          text not null check (char_length(name) between 2 and 80),
  mode          public.batch_mode not null,
  start_date    date not null,
  -- ISO weekdays: 1 = Monday … 7 = Sunday.
  days          smallint[] not null check (cardinality(days) between 1 and 7 and days <@ array[1,2,3,4,5,6,7]::smallint[]),
  start_time    time not null,
  duration_min  integer not null check (duration_min between 15 and 480),
  session_count integer not null check (session_count between 1 and 200),
  seats         integer not null default 20 check (seats between 1 and 500),
  venue         text check (venue is null or char_length(venue) <= 500),
  status        public.batch_status not null default 'open',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists batches_course_idx on public.batches (course_id, start_date);
create index if not exists batches_faculty_idx on public.batches (faculty_id);

create table if not exists public.batch_private (
  batch_id    uuid primary key references public.batches (id) on delete cascade,
  meeting_url text check (meeting_url is null or (char_length(meeting_url) <= 500 and meeting_url ~ '^https://[^\s]{4,}$')),
  updated_at  timestamptz not null default now()
);

create table if not exists public.batch_sessions (
  id         uuid primary key default gen_random_uuid(),
  batch_id   uuid not null references public.batches (id) on delete cascade,
  seq        integer not null,
  starts_at  timestamptz not null,
  ends_at    timestamptz not null check (ends_at > starts_at),
  status     public.session_status not null default 'scheduled',
  -- Reminder bookkeeping so each reminder goes out once.
  reminded_day_at   timestamptz,
  reminded_soon_at  timestamptz,
  created_at timestamptz not null default now(),
  unique (batch_id, seq)
);
create index if not exists batch_sessions_time_idx on public.batch_sessions (starts_at);

create table if not exists public.session_recordings (
  session_id uuid primary key references public.batch_sessions (id) on delete cascade,
  url        text not null check (char_length(url) <= 500 and url ~ '^https://[^\s]{4,}$'),
  added_at   timestamptz not null default now()
);

alter table public.orders add column if not exists batch_id uuid
  references public.batches (id) on delete set null;
create index if not exists orders_batch_idx on public.orders (batch_id) where batch_id is not null;

drop trigger if exists batches_touch on public.batches;
create trigger batches_touch before update on public.batches
  for each row execute function public.touch_updated_at();

-- ── Helpers (security definer: they read orders the caller can't) ─────────────
create or replace function public.is_batch_member(p_batch uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.orders o
    where o.batch_id = p_batch and o.student_id = auth.uid() and o.status = 'verified'
  )
$$;

create or replace function public.owns_batch(p_batch uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.batches b where b.id = p_batch and b.faculty_id = auth.uid())
$$;

/** Seats held (pending + verified orders) per batch; safe to show publicly. */
create or replace function public.batch_seats_taken(p_batches uuid[])
returns table (batch_id uuid, taken integer)
language sql stable security definer set search_path = public as $$
  select o.batch_id, count(*)::integer
  from public.orders o
  where o.batch_id = any (p_batches) and o.status in ('pending', 'verified')
  group by o.batch_id
$$;

/**
 * First online/hybrid session elsewhere on the site that overlaps the given
 * time range. Cancelled sessions and batches are ignored.
 */
create or replace function public.find_live_clash(
  p_starts timestamptz, p_ends timestamptz, p_exclude_batch uuid
) returns text
language sql stable security definer set search_path = public as $$
  select c.title || ' – ' || b.name || ' on ' ||
         to_char(s.starts_at at time zone 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM')
  from public.batch_sessions s
  join public.batches b on b.id = s.batch_id
  join public.courses c on c.id = b.course_id
  where s.status = 'scheduled'
    and b.status not in ('cancelled')
    and b.mode in ('online', 'hybrid')
    and b.id is distinct from p_exclude_batch
    and tstzrange(s.starts_at, s.ends_at) && tstzrange(p_starts, p_ends)
  order by s.starts_at
  limit 1
$$;

-- ── Create a batch and its sessions in one step ──────────────────────────────
create or replace function public.create_batch(
  p_course_id     uuid,
  p_name          text,
  p_mode          public.batch_mode,
  p_start_date    date,
  p_days          smallint[],
  p_start_time    time,
  p_duration_min  integer,
  p_session_count integer,
  p_seats         integer,
  p_venue         text,
  p_meeting_url   text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_course  public.courses%rowtype;
  v_batch   uuid;
  v_day     date := p_start_date;
  v_seq     integer := 0;
  v_starts  timestamptz;
  v_ends    timestamptz;
  v_clash   text;
begin
  select * into v_course from public.courses where id = p_course_id;
  if not found then
    raise exception 'That course was not found.' using errcode = 'P0002';
  end if;
  if v_course.faculty_id is distinct from auth.uid() and not public.is_admin() then
    raise exception 'You can only add batches to your own courses.' using errcode = '42501';
  end if;
  if v_course.faculty_id is null then
    raise exception 'This course has no faculty account yet.' using errcode = '22023';
  end if;
  if v_course.status = 'archived' then
    raise exception 'This course is archived.' using errcode = '22023';
  end if;
  if v_course.mode = 'recorded' then
    raise exception 'Recorded courses do not have live batches.' using errcode = '22023';
  end if;
  if p_start_date < (now() at time zone 'Asia/Kolkata')::date then
    raise exception 'The start date is in the past.' using errcode = '22023';
  end if;
  if p_mode in ('offline', 'hybrid') and coalesce(btrim(p_venue), '') = '' then
    raise exception 'Add the venue address for offline classes.' using errcode = '22023';
  end if;

  insert into public.batches (
    course_id, faculty_id, name, mode, start_date, days, start_time,
    duration_min, session_count, seats, venue
  ) values (
    p_course_id, v_course.faculty_id, btrim(p_name), p_mode, p_start_date,
    (select array_agg(distinct d order by d) from unnest(p_days) d), p_start_time,
    p_duration_min, p_session_count, p_seats, nullif(btrim(p_venue), '')
  ) returning id into v_batch;

  insert into public.batch_private (batch_id, meeting_url)
  values (v_batch, nullif(btrim(p_meeting_url), ''));

  -- Walk forward from the start date, one session per chosen weekday.
  while v_seq < p_session_count loop
    if extract(isodow from v_day)::smallint = any (p_days) then
      v_seq    := v_seq + 1;
      v_starts := (v_day + p_start_time) at time zone 'Asia/Kolkata';
      v_ends   := v_starts + make_interval(mins => p_duration_min);

      if p_mode in ('online', 'hybrid') then
        v_clash := public.find_live_clash(v_starts, v_ends, v_batch);
        if v_clash is not null then
          raise exception 'Session % clashes with %. Only one online class can run at a time — pick another time.',
            v_seq, v_clash using errcode = '23P01';
        end if;
      end if;

      insert into public.batch_sessions (batch_id, seq, starts_at, ends_at)
      values (v_batch, v_seq, v_starts, v_ends);
    end if;
    v_day := v_day + 1;
    if v_day > p_start_date + 800 then
      raise exception 'That timetable runs too long.' using errcode = '22023';
    end if;
  end loop;

  return v_batch;
end $$;

-- ── Move or cancel one session ───────────────────────────────────────────────
create or replace function public.update_batch_session(
  p_session   uuid,
  p_starts_at timestamptz,
  p_status    public.session_status
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_session public.batch_sessions%rowtype;
  v_batch   public.batches%rowtype;
  v_ends    timestamptz;
  v_clash   text;
begin
  select * into v_session from public.batch_sessions where id = p_session for update;
  if not found then
    raise exception 'That class was not found.' using errcode = 'P0002';
  end if;
  select * into v_batch from public.batches where id = v_session.batch_id;
  if v_batch.faculty_id is distinct from auth.uid() and not public.is_admin() then
    raise exception 'Not your batch.' using errcode = '42501';
  end if;

  v_ends := p_starts_at + (v_session.ends_at - v_session.starts_at);

  if p_status = 'scheduled' and v_batch.mode in ('online', 'hybrid') then
    v_clash := public.find_live_clash(p_starts_at, v_ends, v_batch.id);
    if v_clash is not null then
      raise exception 'That time clashes with %. Only one online class can run at a time.',
        v_clash using errcode = '23P01';
    end if;
  end if;

  update public.batch_sessions
  set starts_at = p_starts_at,
      ends_at   = v_ends,
      status    = p_status,
      -- A moved class deserves fresh reminders.
      reminded_day_at  = case when p_starts_at <> v_session.starts_at then null else reminded_day_at end,
      reminded_soon_at = case when p_starts_at <> v_session.starts_at then null else reminded_soon_at end
  where id = p_session;
end $$;

-- ── Seat limit and batch rules on enrolment ──────────────────────────────────
create or replace function public.orders_batch_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_batch public.batches%rowtype;
  v_taken integer;
begin
  -- Only new holds of a seat matter: a new order, a batch change, or a rejected
  -- order being reopened.
  if new.batch_id is null then
    if tg_op = 'INSERT' and auth.uid() is not null and exists (
      select 1 from public.batches b
      where b.course_id = new.course_id and b.status = 'open'
    ) then
      raise exception 'Choose a batch to enrol in.' using errcode = '23514';
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE'
     and new.batch_id is not distinct from old.batch_id
     and not (old.status = 'rejected' and new.status <> 'rejected') then
    return new;
  end if;
  if new.status = 'rejected' then
    return new;
  end if;

  select * into v_batch from public.batches where id = new.batch_id for update;
  if not found or v_batch.course_id <> new.course_id then
    raise exception 'That batch does not belong to this course.' using errcode = '23514';
  end if;
  -- Admins may still move a student into a closed or full batch.
  if not public.is_admin() then
    if v_batch.status <> 'open' then
      raise exception 'That batch is not taking enrolments.' using errcode = '23514';
    end if;
  end if;

  select count(*) into v_taken from public.orders o
  where o.batch_id = new.batch_id and o.status in ('pending', 'verified') and o.id <> new.id;
  if v_taken >= v_batch.seats and not public.is_admin() then
    raise exception 'Sorry, that batch is full. Please pick another batch.' using errcode = '23514';
  end if;
  return new;
end $$;

drop trigger if exists orders_batch_guard on public.orders;
create trigger orders_batch_guard
  before insert or update of batch_id, status on public.orders
  for each row execute function public.orders_batch_guard();

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.batches            enable row level security;
alter table public.batch_private      enable row level security;
alter table public.batch_sessions     enable row level security;
alter table public.session_recordings enable row level security;

-- Timetables of live courses are public (they help people choose a batch).
drop policy if exists batches_select on public.batches;
create policy batches_select on public.batches
  for select using (
    faculty_id = auth.uid()
    or public.is_admin()
    or public.is_batch_member(id)
    or exists (select 1 from public.courses c where c.id = course_id and c.status = 'published')
  );

-- Faculty edit their own batch details. Inserts go through create_batch().
drop policy if exists batches_update_own on public.batches;
create policy batches_update_own on public.batches
  for update using (faculty_id = auth.uid() or public.is_admin())
  with check (faculty_id = auth.uid() or public.is_admin());

drop policy if exists batch_sessions_select on public.batch_sessions;
create policy batch_sessions_select on public.batch_sessions
  for select using (exists (select 1 from public.batches b where b.id = batch_id));

drop policy if exists batch_private_select on public.batch_private;
create policy batch_private_select on public.batch_private
  for select using (
    public.owns_batch(batch_id) or public.is_admin() or public.is_batch_member(batch_id)
  );

drop policy if exists batch_private_update on public.batch_private;
create policy batch_private_update on public.batch_private
  for update using (public.owns_batch(batch_id) or public.is_admin())
  with check (public.owns_batch(batch_id) or public.is_admin());

drop policy if exists recordings_select on public.session_recordings;
create policy recordings_select on public.session_recordings
  for select using (exists (
    select 1 from public.batch_sessions s
    where s.id = session_id
      and (public.owns_batch(s.batch_id) or public.is_admin() or public.is_batch_member(s.batch_id))
  ));

drop policy if exists recordings_write on public.session_recordings;
create policy recordings_write on public.session_recordings
  for all using (exists (
    select 1 from public.batch_sessions s
    where s.id = session_id and (public.owns_batch(s.batch_id) or public.is_admin())
  )) with check (exists (
    select 1 from public.batch_sessions s
    where s.id = session_id and (public.owns_batch(s.batch_id) or public.is_admin())
  ));

-- Faculty may not re-point a batch at someone else's course or change its owner.
revoke update on public.batches from anon, authenticated;
grant update (name, seats, venue, status) on public.batches to authenticated;
revoke insert, delete on public.batches, public.batch_sessions, public.batch_private from anon, authenticated;
revoke update on public.batch_sessions from anon, authenticated;
revoke update on public.batch_private from anon;
grant update (meeting_url, updated_at) on public.batch_private to authenticated;

-- ── Enrolment may name a batch of the same course ────────────────────────────
drop policy if exists orders_insert_student on public.orders;
create policy orders_insert_student on public.orders
  for insert with check (
    student_id = auth.uid()
    and status = 'pending'
    and reviewed_at is null
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

-- ── Reminder emails (called by the cron route, no service key needed) ────────
-- The route proves itself with a shared secret whose SHA-256 is stored here.
create table if not exists public.cron_tokens (
  name       text primary key,
  token_hash text not null,
  created_at timestamptz not null default now()
);
alter table public.cron_tokens enable row level security;
revoke all on public.cron_tokens from anon, authenticated;

/**
 * Claims the reminders that are due now and returns one row per student.
 * 'day'  → classes starting in the next 24 hours
 * 'soon' → classes starting in the next 20 minutes
 * Each session is claimed once per kind, so overlapping cron runs never
 * double-send.
 */
create or replace function public.claim_class_reminders(p_token text, p_kind text)
returns table (
  session_id    uuid,
  seq           integer,
  starts_at     timestamptz,
  ends_at       timestamptz,
  batch_name    text,
  batch_mode    public.batch_mode,
  venue         text,
  course_title  text,
  course_slug   text,
  student_name  text,
  student_email text
)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_window interval := case p_kind when 'day' then interval '24 hours' when 'soon' then interval '20 minutes' end;
begin
  if v_window is null then
    raise exception 'Unknown reminder kind.' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.cron_tokens t
    where t.name = 'reminders'
      and t.token_hash = encode(extensions.digest(convert_to(coalesce(p_token, ''), 'UTF8'), 'sha256'), 'hex')
  ) then
    raise exception 'Not allowed.' using errcode = '42501';
  end if;

  return query
  with due as (
    update public.batch_sessions s
    set reminded_day_at  = case when p_kind = 'day'  then now() else s.reminded_day_at  end,
        reminded_soon_at = case when p_kind = 'soon' then now() else s.reminded_soon_at end
    from public.batches b
    where b.id = s.batch_id
      and b.status in ('open', 'closed')
      and s.status = 'scheduled'
      and s.starts_at > now()
      and s.starts_at <= now() + v_window
      and (case when p_kind = 'day' then s.reminded_day_at else s.reminded_soon_at end) is null
      -- The 24-hour note is pointless when the "starting soon" one is due.
      and (p_kind = 'soon' or s.starts_at > now() + interval '1 hour')
    returning s.id, s.seq, s.starts_at, s.ends_at, s.batch_id
  )
  select d.id, d.seq, d.starts_at, d.ends_at, b.name, b.mode, b.venue,
         c.title, c.slug, o.student_name, o.student_email
  from due d
  join public.batches b on b.id = d.batch_id
  join public.courses c on c.id = b.course_id
  join public.orders o on o.batch_id = b.id and o.status = 'verified'
  where o.student_email is not null;
end $$;

revoke all on function public.claim_class_reminders(text, text) from public;
grant execute on function public.claim_class_reminders(text, text) to anon, authenticated;

revoke all on function public.create_batch(uuid, text, public.batch_mode, date, smallint[], time, integer, integer, integer, text, text) from public;
grant execute on function public.create_batch(uuid, text, public.batch_mode, date, smallint[], time, integer, integer, integer, text, text) to authenticated;
revoke all on function public.update_batch_session(uuid, timestamptz, public.session_status) from public;
grant execute on function public.update_batch_session(uuid, timestamptz, public.session_status) to authenticated;
revoke all on function public.find_live_clash(timestamptz, timestamptz, uuid) from public;
grant execute on function public.batch_seats_taken(uuid[]) to anon, authenticated;
grant execute on function public.is_batch_member(uuid) to anon, authenticated;
grant execute on function public.owns_batch(uuid) to anon, authenticated;
