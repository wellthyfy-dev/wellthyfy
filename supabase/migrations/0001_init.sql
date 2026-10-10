-- Wellthyfy platform schema: profiles, courses, manual-UPI orders.
-- Applied to project asldprpmsegjdtyvuett. Safe to re-run.

-- ── Enums ────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.user_role as enum ('student', 'faculty');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.course_mode as enum ('online_live', 'recorded', 'offline', 'hybrid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.course_category as enum ('wellness', 'wealth', 'happiness');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.course_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum ('pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

-- ── Profiles ─────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  role               public.user_role not null default 'student',
  full_name          text,
  email              text not null,
  phone              text,
  whatsapp           text,
  address            text,
  -- Storage object paths in the private `kyc` bucket, never public URLs.
  aadhaar_front_path text,
  aadhaar_back_path  text,
  profile_completed  boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ── Courses ──────────────────────────────────────────────────────────────────
create table if not exists public.courses (
  id            uuid primary key default gen_random_uuid(),
  faculty_id    uuid not null references public.profiles (id) on delete cascade,
  -- Denormalised so public course cards never need to read the profiles table
  -- (which holds phone, address and KYC paths). Kept in sync by trigger below.
  faculty_name  text,
  title         text not null,
  slug          text not null unique,
  summary       text,
  description   text not null,
  mode          public.course_mode not null,
  category      public.course_category not null,
  subcategory   text not null,
  level         text,
  duration      text,
  language      text,
  price_inr     integer not null default 0 check (price_inr >= 0),
  cover_url     text,
  status        public.course_status not null default 'draft',
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists courses_published_idx
  on public.courses (status, published_at desc);
create index if not exists courses_faculty_idx on public.courses (faculty_id);
create index if not exists courses_category_idx on public.courses (category);

-- ── Orders (manual UPI) ──────────────────────────────────────────────────────
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses (id) on delete cascade,
  student_id  uuid not null references public.profiles (id) on delete cascade,
  faculty_id  uuid not null references public.profiles (id) on delete cascade,
  course_title text not null,
  amount_inr  integer not null check (amount_inr >= 0),
  utr         text not null,
  payer_note  text,
  status      public.order_status not null default 'pending',
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (course_id, student_id)
);

create index if not exists orders_faculty_idx on public.orders (faculty_id, created_at desc);
create index if not exists orders_student_idx on public.orders (student_id, created_at desc);

-- ── Keep denormalised faculty_name current ───────────────────────────────────
create or replace function public.sync_course_faculty_name()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.courses set faculty_name = new.full_name where faculty_id = new.id;
  return new;
end $$;

drop trigger if exists profiles_sync_course_name on public.profiles;
create trigger profiles_sync_course_name
  after update of full_name on public.profiles
  for each row execute function public.sync_course_faculty_name();

-- ── Create a profile row whenever someone signs up ───────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'student'),
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── updated_at ───────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists courses_touch on public.courses;
create trigger courses_touch before update on public.courses
  for each row execute function public.touch_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.courses  enable row level security;
alter table public.orders   enable row level security;

-- profiles: strictly owner-only. Nothing here is public.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- courses: published rows are world-readable; drafts only by their author.
drop policy if exists courses_select_published on public.courses;
create policy courses_select_published on public.courses
  for select using (status = 'published' or faculty_id = auth.uid());

drop policy if exists courses_insert_own on public.courses;
create policy courses_insert_own on public.courses
  for insert with check (
    faculty_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'faculty'
    )
  );

drop policy if exists courses_update_own on public.courses;
create policy courses_update_own on public.courses
  for update using (faculty_id = auth.uid()) with check (faculty_id = auth.uid());

drop policy if exists courses_delete_own on public.courses;
create policy courses_delete_own on public.courses
  for delete using (faculty_id = auth.uid());

-- orders: visible to the buyer and to the course's faculty.
drop policy if exists orders_select_party on public.orders;
create policy orders_select_party on public.orders
  for select using (student_id = auth.uid() or faculty_id = auth.uid());

drop policy if exists orders_insert_student on public.orders;
create policy orders_insert_student on public.orders
  for insert with check (student_id = auth.uid());

-- Only the faculty may move an order to verified/rejected.
drop policy if exists orders_update_faculty on public.orders;
create policy orders_update_faculty on public.orders
  for update using (faculty_id = auth.uid()) with check (faculty_id = auth.uid());

-- ── Storage buckets ──────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('kyc', 'kyc', false)
on conflict (id) do update set public = false;

insert into storage.buckets (id, name, public)
values ('course-covers', 'course-covers', true)
on conflict (id) do update set public = true;

-- KYC: an Aadhaar image is only ever reachable by the person who uploaded it.
-- Objects are stored at `<uid>/front.<ext>` so the first path segment is the owner.
drop policy if exists kyc_rw_own on storage.objects;
create policy kyc_rw_own on storage.objects
  for all
  using (bucket_id = 'kyc' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'kyc' and (storage.foldername(name))[1] = auth.uid()::text);

-- Course covers: world-readable, writable only inside your own folder.
drop policy if exists covers_read_all on storage.objects;
create policy covers_read_all on storage.objects
  for select using (bucket_id = 'course-covers');

drop policy if exists covers_write_own on storage.objects;
create policy covers_write_own on storage.objects
  for insert with check (
    bucket_id = 'course-covers' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists covers_update_own on storage.objects;
create policy covers_update_own on storage.objects
  for update using (
    bucket_id = 'course-covers' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists covers_delete_own on storage.objects;
create policy covers_delete_own on storage.objects
  for delete using (
    bucket_id = 'course-covers' and (storage.foldername(name))[1] = auth.uid()::text
  );
