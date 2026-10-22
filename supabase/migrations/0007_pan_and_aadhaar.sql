-- Wellthyfy — faculty applicants verify with BOTH a PAN card and an Aadhaar card.
--
-- Aadhaar keeps using id_front_path / id_back_path (with id_type = 'aadhaar');
-- the PAN card gets its own column and file name. Older applications, which
-- carried a single ID of any type, are left as they were.

alter table public.faculty_applications
  add column if not exists pan_path text;
alter table public.faculty_applications
  drop constraint if exists faculty_applications_pan_path_check;
alter table public.faculty_applications
  add constraint faculty_applications_pan_path_check
  check (pan_path is null or char_length(pan_path) <= 200);

-- Anonymous applicants may now also upload <uuid>/pan.<ext>.
drop policy if exists applications_upload on storage.objects;
create policy applications_upload on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'applications'
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/(id-front|id-back|pan)\.(jpg|png|webp|pdf)$'
  );
