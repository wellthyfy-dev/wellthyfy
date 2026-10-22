-- Wellthyfy — applications no longer include a course, so anonymous visitors
-- no longer need to upload a modules PDF. Close the anonymous upload path to
-- the public `course-modules` bucket; faculty uploads (own folder) remain.

drop policy if exists course_modules_apply_upload on storage.objects;
