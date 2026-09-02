begin;

create extension if not exists pgcrypto;

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default auth.user_id(),
  name text not null,
  company text,
  role text,
  where_met text,
  notes text,
  priority text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_name_not_blank check (char_length(btrim(name)) > 0),
  constraint contacts_name_length check (char_length(name) <= 120),
  constraint contacts_company_length check (company is null or char_length(company) <= 160),
  constraint contacts_role_length check (role is null or char_length(role) <= 160),
  constraint contacts_where_met_length check (where_met is null or char_length(where_met) <= 240),
  constraint contacts_notes_length check (notes is null or char_length(notes) <= 2000),
  constraint contacts_priority_allowed check (priority in ('high', 'medium', 'low'))
);

create or replace function public.set_contacts_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
before update on public.contacts
for each row execute function public.set_contacts_updated_at();

create index if not exists contacts_user_updated_idx
  on public.contacts (user_id, updated_at desc);

alter table public.contacts enable row level security;

grant select, insert, update, delete on table public.contacts to authenticated;

drop policy if exists contacts_select_own on public.contacts;
create policy contacts_select_own
on public.contacts
for select
to authenticated
using (auth.user_id() = user_id);

drop policy if exists contacts_insert_own on public.contacts;
create policy contacts_insert_own
on public.contacts
for insert
to authenticated
with check (auth.user_id() = user_id);

drop policy if exists contacts_update_own on public.contacts;
create policy contacts_update_own
on public.contacts
for update
to authenticated
using (auth.user_id() = user_id)
with check (auth.user_id() = user_id);

drop policy if exists contacts_delete_own on public.contacts;
create policy contacts_delete_own
on public.contacts
for delete
to authenticated
using (auth.user_id() = user_id);

commit;
