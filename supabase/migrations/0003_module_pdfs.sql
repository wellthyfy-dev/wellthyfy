-- Wellthyfy — course modules as a PDF upload instead of typed text.
--
-- Applicants and faculty now upload one PDF that outlines their modules. It is
-- curriculum, shown to prospective students, so it lives in a PUBLIC bucket.
-- The old text columns stay so existing courses keep rendering.

-- ── Columns ──────────────────────────────────────────────────────────────────
alter table public.faculty_applications
  add column if not exists modules_pdf_path text;

-- Typed modules are no longer collected.
alter table public.faculty_applications
  alter column course_modules drop not null;
alter table public.faculty_applications
  drop constraint if exists faculty_applications_course_modules_check;
alter table public.faculty_applications
  add constraint faculty_applications_course_modules_check
  check (course_modules is null or char_length(course_modules) <= 8000);

-- Applications must point at their own folder.
alter table public.faculty_applications
  drop constraint if exists faculty_applications_modules_pdf_path_check;
alter table public.faculty_applications
  add constraint faculty_applications_modules_pdf_path_check
  check (modules_pdf_path is null or modules_pdf_path = 'apply/' || id::text || '/modules.pdf');

alter table public.courses
  add column if not exists modules_pdf_path text;
alter table public.courses
  drop constraint if exists courses_modules_pdf_path_check;
alter table public.courses
  add constraint courses_modules_pdf_path_check
  check (modules_pdf_path is null or modules_pdf_path ~ '^[A-Za-z0-9/_.-]{1,200}\.pdf$');

-- ── Storage ──────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('course-modules', 'course-modules', true, 10485760, array['application/pdf'])
on conflict (id) do update
  set public = true, file_size_limit = 10485760,
      allowed_mime_types = excluded.allowed_mime_types;

-- Applicants are not signed in: insert-only, exactly apply/<uuid>/modules.pdf.
-- No upsert, so nobody can overwrite a file that is already there.
drop policy if exists course_modules_apply_upload on storage.objects;
create policy course_modules_apply_upload on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'course-modules'
    and name ~ '^apply/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/modules\.pdf$'
  );

-- Faculty upload into their own <uid>/ folder.
drop policy if exists course_modules_faculty_upload on storage.objects;
create policy course_modules_faculty_upload on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'course-modules'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'faculty')
  );

drop policy if exists course_modules_faculty_delete on storage.objects;
create policy course_modules_faculty_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'course-modules' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists course_modules_admin_delete on storage.objects;
create policy course_modules_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'course-modules' and public.is_admin());

-- ── Approval carries the PDF onto the live course ────────────────────────────
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
    faculty_id, faculty_name, title, slug, summary, description, modules, modules_pdf_path,
    mode, category, subcategory, level, duration, language, price_inr,
    status, published_at, application_id
  ) values (
    null, a.full_name, a.course_title, v_slug, a.course_summary, a.course_description,
    a.course_modules, a.modules_pdf_path, a.mode, a.category, a.subcategory, a.level,
    a.duration, a.language, a.fee_inr, 'published', now(), a.id
  ) returning id into v_course;

  update public.faculty_applications
     set status = 'approved', assigned_email = v_email, invite_token = v_token,
         admin_note = nullif(trim(p_note), ''), reviewed_at = now(), reviewed_by = auth.uid()
   where id = p_id;

  return jsonb_build_object('token', v_token, 'slug', v_slug, 'course_id', v_course);
end $$;
revoke all on function public.approve_faculty_application(uuid, text, text) from public, anon;
grant execute on function public.approve_faculty_application(uuid, text, text) to authenticated;
