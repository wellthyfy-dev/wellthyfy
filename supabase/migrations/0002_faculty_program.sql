-- Faculty programme: applications, admin role, invite-only faculty accounts.
-- Also closes two privilege holes in 0001 (self-promotion, self-verified orders).
-- Applied to project asldprpmsegjdtyvuett. Safe to re-run.

-- ── Enums ────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.application_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- ── Admin role ───────────────────────────────────────────────────────────────
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Emails that become admins the moment they CONFIRM their address. Granting on
-- confirmation (not on insert) stops someone pre-registering an admin email
-- they do not own. RLS on with no policies = invisible to every API role.
create table if not exists public.admin_emails (
  email text primary key check (email = lower(email))
);
alter table public.admin_emails enable row level security;
insert into public.admin_emails (email) values ('promaxx2021@gmail.com') on conflict do nothing;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false)
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ── Close hole 1: users could rewrite their own role ─────────────────────────
-- profiles_update_own allowed ANY column, so a student could PATCH role='faculty'
-- (and now is_admin=true). Allow only the self-service columns.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, phone, whatsapp, address,
              aadhaar_front_path, aadhaar_back_path, profile_completed)
  on public.profiles to authenticated;

-- ── Applications ─────────────────────────────────────────────────────────────
create table if not exists public.faculty_applications (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  status             public.application_status not null default 'pending',

  -- applicant
  full_name          text not null check (char_length(full_name) between 2 and 120),
  contact_email      text not null check (char_length(contact_email) <= 200
                       and contact_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'),
  phone              text not null check (char_length(phone) between 7 and 30),
  whatsapp           text check (whatsapp is null or char_length(whatsapp) <= 30),
  address            text not null check (char_length(address) between 5 and 500),
  experience         text not null check (char_length(experience) between 10 and 3000),

  -- government ID: storage paths in the private `applications` bucket
  id_type            text not null check (id_type in
                       ('aadhaar','pan','passport','driving_licence','voter_id','other')),
  id_front_path      text not null check (char_length(id_front_path) <= 200),
  id_back_path       text check (id_back_path is null or char_length(id_back_path) <= 200),

  -- the course they want to teach
  course_title       text not null check (char_length(course_title) between 3 and 140),
  course_summary     text check (course_summary is null or char_length(course_summary) <= 200),
  course_description text not null check (char_length(course_description) between 20 and 6000),
  course_modules     text not null check (char_length(course_modules) between 10 and 8000),
  category           public.course_category not null,
  subcategory        text not null check (char_length(subcategory) between 2 and 80),
  mode               public.course_mode not null,
  level              text check (level is null or char_length(level) <= 40),
  duration           text check (duration is null or char_length(duration) <= 60),
  language           text check (language is null or char_length(language) <= 40),
  fee_inr            integer not null check (fee_inr between 0 and 1000000),

  -- review (only ever written by the admin functions below)
  admin_note         text check (admin_note is null or char_length(admin_note) <= 1000),
  assigned_email     text,
  invite_token       text,
  reviewed_at        timestamptz,
  reviewed_by        uuid references public.profiles (id) on delete set null,
  faculty_user_id    uuid references public.profiles (id) on delete set null
);

create unique index if not exists faculty_applications_email_uq
  on public.faculty_applications (lower(assigned_email)) where assigned_email is not null;
create unique index if not exists faculty_applications_token_uq
  on public.faculty_applications (invite_token) where invite_token is not null;
create index if not exists faculty_applications_status_idx
  on public.faculty_applications (status, created_at desc);

alter table public.faculty_applications enable row level security;
grant insert on public.faculty_applications to anon, authenticated;
grant select, delete on public.faculty_applications to authenticated;

-- Anyone may SUBMIT, but only as a clean pending row: they cannot pre-approve
-- themselves or plant an invite token. Nobody but admins can read.
drop policy if exists applications_submit on public.faculty_applications;
create policy applications_submit on public.faculty_applications
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and assigned_email is null and invite_token is null
    and admin_note is null and reviewed_at is null and reviewed_by is null
    and faculty_user_id is null
  );

drop policy if exists applications_admin_select on public.faculty_applications;
create policy applications_admin_select on public.faculty_applications
  for select to authenticated using (public.is_admin());

drop policy if exists applications_admin_delete on public.faculty_applications;
create policy applications_admin_delete on public.faculty_applications
  for delete to authenticated using (public.is_admin());

-- ── Courses / orders: allow "live but not yet claimed by a faculty account" ──
alter table public.courses alter column faculty_id drop not null;
alter table public.courses add column if not exists application_id uuid
  references public.faculty_applications (id) on delete set null;
alter table public.courses add column if not exists modules text;

alter table public.orders alter column faculty_id drop not null;
alter table public.orders add column if not exists student_name text;
alter table public.orders add column if not exists student_email text;
alter table public.orders add column if not exists student_whatsapp text;

-- Admins see and manage everything.
drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin on public.profiles
  for select using (public.is_admin());

drop policy if exists courses_admin_all on public.courses;
create policy courses_admin_all on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

-- Course creation by faculty additionally requires a Wellthyfy mail id.
drop policy if exists courses_insert_own on public.courses;
create policy courses_insert_own on public.courses
  for insert with check (
    faculty_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'faculty'
        and lower(p.email) like '%@wellthyfy.in'
    )
  );

-- ── Close hole 2: students could insert pre-verified, any-amount orders ──────
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
  );

-- Payments go to Wellthyfy's UPI account, not the faculty's, so only Wellthyfy
-- can confirm a UTR. Faculty keep read access to their own enrolments.
drop policy if exists orders_update_faculty on public.orders;
drop policy if exists orders_select_admin on public.orders;
create policy orders_select_admin on public.orders
  for select using (public.is_admin());
drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- ── Storage: applicant ID documents ──────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('applications', 'applications', false, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update
  set public = false, file_size_limit = 5242880,
      allowed_mime_types = excluded.allowed_mime_types;

-- Applicants are not signed in, so uploads are open to anon but constrained to
-- <uuid>/id-front|id-back.<ext>. Nobody can read, overwrite or list them back.
drop policy if exists applications_upload on storage.objects;
create policy applications_upload on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'applications'
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/id-(front|back)\.(jpg|png|webp|pdf)$'
  );

drop policy if exists applications_admin_read on storage.objects;
create policy applications_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'applications' and public.is_admin());

drop policy if exists applications_admin_delete on storage.objects;
create policy applications_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'applications' and public.is_admin());

drop policy if exists kyc_admin_read on storage.objects;
create policy kyc_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'kyc' and public.is_admin());

-- ── Invitation lookup for the hidden faculty signup page ─────────────────────
create or replace function public.get_faculty_invite(p_token text)
returns table (email text, full_name text)
language sql stable security definer set search_path = public as $$
  select a.assigned_email, a.full_name
  from public.faculty_applications a
  where a.invite_token = p_token
    and a.status = 'approved'
    and a.faculty_user_id is null
  limit 1
$$;
revoke all on function public.get_faculty_invite(text) from public;
grant execute on function public.get_faculty_invite(text) to anon, authenticated;

-- ── Approve / reject, atomically ─────────────────────────────────────────────
create or replace function public.approve_faculty_application(
  p_id uuid, p_email text, p_note text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  a        public.faculty_applications;
  v_email  text := lower(trim(p_email));
  v_token  text;
  v_slug   text;
  v_course uuid;
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
  v_slug  := left(trim(both '-' from regexp_replace(lower(a.course_title), '[^a-z0-9]+', '-', 'g')), 60)
             || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 5);

  -- The course goes live now, owned by nobody yet. It is attached to the
  -- faculty account the moment that account is created (see handle_new_user).
  insert into public.courses (
    faculty_id, faculty_name, title, slug, summary, description, modules,
    mode, category, subcategory, level, duration, language, price_inr,
    status, published_at, application_id
  ) values (
    null, a.full_name, a.course_title, v_slug, a.course_summary, a.course_description,
    a.course_modules, a.mode, a.category, a.subcategory, a.level, a.duration, a.language,
    a.fee_inr, 'published', now(), a.id
  ) returning id into v_course;

  update public.faculty_applications
     set status = 'approved', assigned_email = v_email, invite_token = v_token,
         admin_note = nullif(trim(p_note), ''), reviewed_at = now(), reviewed_by = auth.uid()
   where id = p_id;

  return jsonb_build_object('token', v_token, 'slug', v_slug, 'course_id', v_course);
end $$;
revoke all on function public.approve_faculty_application(uuid, text, text) from public, anon;
grant execute on function public.approve_faculty_application(uuid, text, text) to authenticated;

create or replace function public.reject_faculty_application(p_id uuid, p_note text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare a public.faculty_applications;
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  select * into a from public.faculty_applications where id = p_id for update;
  if not found then raise exception 'Application not found'; end if;
  if a.status <> 'pending' then
    raise exception 'This application has already been %', a.status;
  end if;
  update public.faculty_applications
     set status = 'rejected', admin_note = nullif(trim(p_note), ''),
         reviewed_at = now(), reviewed_by = auth.uid()
   where id = p_id;
end $$;
revoke all on function public.reject_faculty_application(uuid, text) from public, anon;
grant execute on function public.reject_faculty_application(uuid, text) to authenticated;

-- ── New-user trigger: faculty accounts are invitation-only ───────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  want_role  text := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  app        public.faculty_applications;
  final_role public.user_role := 'student';
begin
  -- The role in user metadata is chosen by the client, so it is only a REQUEST.
  -- 'faculty' must be backed by an approved application: right mail id AND the
  -- secret invite token. 'admin' is never accepted from metadata at all.
  if want_role = 'faculty' then
    select * into app from public.faculty_applications
     where status = 'approved'
       and lower(assigned_email) = lower(new.email)
       and invite_token = (new.raw_user_meta_data ->> 'invite_token')
       and faculty_user_id is null
     for update;

    if not found then
      raise exception 'Faculty accounts are available by invitation only.' using errcode = 'P0001';
    end if;
    final_role := 'faculty';
  end if;

  insert into public.profiles (
    id, email, role, full_name, phone, whatsapp, address, profile_completed, is_admin
  ) values (
    new.id, new.email, final_role,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), app.full_name),
    app.phone, app.whatsapp, app.address,
    -- Faculty already supplied contact details and ID in their application.
    final_role = 'faculty',
    new.email_confirmed_at is not null
      and exists (select 1 from public.admin_emails e where e.email = lower(new.email))
  )
  on conflict (id) do nothing;

  if final_role = 'faculty' then
    update public.faculty_applications set faculty_user_id = new.id where id = app.id;
    update public.courses set faculty_id = new.id
     where application_id = app.id and faculty_id is null;
    update public.orders set faculty_id = new.id
     where faculty_id is null
       and course_id in (select id from public.courses where application_id = app.id);
  end if;

  return new;
end $$;

-- Admins are granted when the address is confirmed.
create or replace function public.grant_admin_on_confirm()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email_confirmed_at is not null
     and old.email_confirmed_at is null
     and exists (select 1 from public.admin_emails e where e.email = lower(new.email)) then
    update public.profiles set is_admin = true where id = new.id;
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute function public.grant_admin_on_confirm();
