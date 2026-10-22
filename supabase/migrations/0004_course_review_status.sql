-- Wellthyfy — course review statuses.
--
-- Kept in its own file: a new enum value cannot be used in the same
-- transaction that adds it, and 0005 uses these in policies and triggers.

alter type public.course_status add value if not exists 'pending_review';
alter type public.course_status add value if not exists 'rejected';
