-- Internal Nexautia control tables.
-- These tables belong only to Nexautia and must not be copied to client projects.

create table if not exists public.nexautia_control_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

insert into public.nexautia_control_users (user_id)
select user_id from public.staff_users
on conflict (user_id) do nothing;

create or replace function public.is_nexautia_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.nexautia_control_users where user_id = auth.uid()
  );
$$;

create table if not exists public.nexautia_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  contact_email text,
  status text not null default 'trial' check (status in ('trial', 'active', 'inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nexautia_client_stores (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.nexautia_clients(id) on delete cascade,
  name text not null,
  public_url text,
  admin_url text,
  github_repository text,
  supabase_project_ref text,
  languages text[] not null default array['es','ca']::text[],
  status text not null default 'planning' check (status in ('planning', 'building', 'published', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nexautia_clients_status_idx on public.nexautia_clients(status);
create index if not exists nexautia_client_stores_status_idx on public.nexautia_client_stores(status);

drop trigger if exists nexautia_clients_set_updated_at on public.nexautia_clients;
create trigger nexautia_clients_set_updated_at before update on public.nexautia_clients
for each row execute function public.set_updated_at();

drop trigger if exists nexautia_client_stores_set_updated_at on public.nexautia_client_stores;
create trigger nexautia_client_stores_set_updated_at before update on public.nexautia_client_stores
for each row execute function public.set_updated_at();

alter table public.nexautia_clients enable row level security;
alter table public.nexautia_client_stores enable row level security;
alter table public.nexautia_control_users enable row level security;

drop policy if exists nexautia_control_users_self_read on public.nexautia_control_users;
create policy nexautia_control_users_self_read on public.nexautia_control_users
for select to authenticated using (user_id = auth.uid());

drop policy if exists nexautia_clients_staff_all on public.nexautia_clients;
create policy nexautia_clients_staff_all on public.nexautia_clients
for all to authenticated using (public.is_nexautia_operator()) with check (public.is_nexautia_operator());

drop policy if exists nexautia_client_stores_staff_all on public.nexautia_client_stores;
create policy nexautia_client_stores_staff_all on public.nexautia_client_stores
for all to authenticated using (public.is_nexautia_operator()) with check (public.is_nexautia_operator());

grant select, insert, update, delete on public.nexautia_clients, public.nexautia_client_stores to authenticated;
grant select on public.nexautia_control_users to authenticated;
grant execute on function public.is_nexautia_operator() to authenticated;

-- Safe demo records. They represent control-panel tests, not separate Supabase projects.
insert into public.nexautia_clients (name, slug, contact_email, status, notes)
values ('Nexautia', 'nexautia', 'nexautia@gmail.com', 'active', 'Tienda real utilizada para desarrollar y comprobar la plantilla.')
on conflict (slug) do update set
  name = excluded.name,
  contact_email = excluded.contact_email,
  status = excluded.status,
  notes = excluded.notes;

insert into public.nexautia_client_stores (client_id, name, public_url, admin_url, github_repository, supabase_project_ref, languages, status)
select id,
  'Nexautia E-commerce',
  'https://nexautia-droid.github.io/nexautia-ecommerce-template/es/',
  'https://nexautia-droid.github.io/nexautia-ecommerce-template/es/admin/',
  'nexautia-droid/nexautia-ecommerce-template',
  'hrzpuozofqtbxpkrqprw',
  array['es','ca']::text[],
  'published'
from public.nexautia_clients where slug = 'nexautia'
on conflict (client_id) do update set
  name = excluded.name,
  public_url = excluded.public_url,
  admin_url = excluded.admin_url,
  github_repository = excluded.github_repository,
  supabase_project_ref = excluded.supabase_project_ref,
  languages = excluded.languages,
  status = excluded.status;

insert into public.nexautia_clients (name, slug, contact_email, status, notes)
values
  ('Cliente Demo Barcelona', 'demo-barcelona', 'barcelona@example.com', 'trial', 'Cliente ficticio para comprobar el panel.'),
  ('Cliente Demo Girona', 'demo-girona', 'girona@example.com', 'trial', 'Cliente ficticio para comprobar el panel.'),
  ('Cliente Demo Tarragona', 'demo-tarragona', 'tarragona@example.com', 'trial', 'Cliente ficticio para comprobar el panel.')
on conflict (slug) do nothing;

insert into public.nexautia_client_stores (client_id, name, languages, status)
select id, name || ' - Tienda', array['es','ca']::text[], 'planning'
from public.nexautia_clients
where slug in ('demo-barcelona', 'demo-girona', 'demo-tarragona')
on conflict (client_id) do nothing;
