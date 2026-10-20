create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users can read their own roles"
on public.user_roles for select to authenticated
using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create table public.presence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  city text not null,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

grant select (city, updated_at) on public.presence to anon;
grant select, insert, update on public.presence to authenticated;
grant all on public.presence to service_role;

alter table public.presence enable row level security;

create policy "Anyone can read the shared city"
on public.presence for select to anon, authenticated
using (true);

create policy "Only the owner can publish location"
on public.presence for insert to authenticated
with check (public.has_role(auth.uid(), 'admin') and user_id = auth.uid());

create policy "Only the owner can update location"
on public.presence for update to authenticated
using (public.has_role(auth.uid(), 'admin') and user_id = auth.uid())
with check (public.has_role(auth.uid(), 'admin') and user_id = auth.uid());