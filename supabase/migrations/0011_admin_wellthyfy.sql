-- Make admin@wellthyfy.in an admin.
--
-- New account: handle_new_user() / the confirmation trigger set is_admin once
-- the address is in admin_emails and the email is confirmed.
-- Existing account: flag it directly below.

insert into public.admin_emails (email)
values ('admin@wellthyfy.in')
on conflict do nothing;

update public.profiles
   set is_admin = true
 where lower(email) = 'admin@wellthyfy.in';
