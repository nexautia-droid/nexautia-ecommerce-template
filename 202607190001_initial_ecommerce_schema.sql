-- Nexautia reusable e-commerce schema (development template)
-- Each client should deploy this migration to an independent Supabase project.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.store_settings (
  id uuid primary key default gen_random_uuid(),
  internal_name text not null,
  store_slug text not null unique,
  currency_code text not null default 'EUR' check (currency_code ~ '^[A-Z]{3}$'),
  default_locale text not null default 'es-ES',
  supported_locales text[] not null default array['es-ES', 'ca-ES']::text[],
  contact_email text,
  logo_url text,
  theme jsonb not null default '{}'::jsonb,
  legal jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_translations (
  store_id uuid not null references public.store_settings(id) on delete cascade,
  locale text not null,
  store_name text not null,
  tagline text,
  legal jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (store_id, locale)
);

create table public.staff_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to anon, authenticated;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  internal_name text not null,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.category_translations (
  category_id uuid not null references public.categories(id) on delete cascade,
  locale text not null,
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (category_id, locale),
  unique (locale, slug)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  internal_name text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_translations (
  product_id uuid not null references public.products(id) on delete cascade,
  locale text not null,
  name text not null,
  slug text not null,
  short_description text,
  description text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (product_id, locale),
  unique (locale, slug)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.product_image_translations (
  image_id uuid not null references public.product_images(id) on delete cascade,
  locale text not null,
  alt_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (image_id, locale)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  internal_name text not null,
  attributes jsonb not null default '{}'::jsonb,
  price_cents integer not null check (price_cents >= 0),
  compare_at_price_cents integer check (
    compare_at_price_cents is null or compare_at_price_cents >= price_cents
  ),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  track_inventory boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variant_translations (
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  locale text not null,
  name text not null,
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (variant_id, locale)
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity_delta integer not null check (quantity_delta <> 0),
  reason text not null check (reason in ('initial', 'sale', 'return', 'adjustment', 'restock')),
  reference text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  full_name text not null,
  phone text,
  line1 text not null,
  line2 text,
  city text not null,
  region text,
  postal_code text not null,
  country_code text not null default 'ES' check (country_code ~ '^[A-Z]{2}$'),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'converted', 'abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index carts_one_active_per_user
  on public.carts(user_id) where status = 'active';

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_email text not null,
  status text not null default 'pending' check (
    status in ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded')
  ),
  currency_code text not null default 'EUR' check (currency_code ~ '^[A-Z]{3}$'),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  shipping_address jsonb not null,
  billing_address jsonb,
  customer_note text,
  payment_provider text,
  payment_reference text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  sku text not null,
  product_name text not null,
  variant_name text not null,
  attributes jsonb not null default '{}'::jsonb,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  line_total_cents integer not null check (line_total_cents >= 0),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_payment_id text not null unique,
  status text not null check (status in ('pending', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded')),
  amount_cents integer not null check (amount_cents >= 0),
  currency_code text not null check (currency_code ~ '^[A-Z]{3}$'),
  provider_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create index products_category_id_idx on public.products(category_id);
create index category_translations_locale_idx on public.category_translations(locale);
create index product_translations_locale_idx on public.product_translations(locale);
create index product_images_product_id_idx on public.product_images(product_id);
create index product_image_translations_locale_idx on public.product_image_translations(locale);
create index product_variants_product_id_idx on public.product_variants(product_id);
create index inventory_movements_variant_id_idx on public.inventory_movements(variant_id);
create index addresses_user_id_idx on public.addresses(user_id);
create index cart_items_cart_id_idx on public.cart_items(cart_id);
create index orders_user_id_idx on public.orders(user_id);
create index orders_created_at_idx on public.orders(created_at desc);
create index order_items_order_id_idx on public.order_items(order_id);
create index payments_order_id_idx on public.payments(order_id);

create trigger store_settings_set_updated_at before update on public.store_settings
for each row execute function public.set_updated_at();
create trigger store_translations_set_updated_at before update on public.store_translations
for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger category_translations_set_updated_at before update on public.category_translations
for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();
create trigger product_translations_set_updated_at before update on public.product_translations
for each row execute function public.set_updated_at();
create trigger product_variants_set_updated_at before update on public.product_variants
for each row execute function public.set_updated_at();
create trigger product_image_translations_set_updated_at before update on public.product_image_translations
for each row execute function public.set_updated_at();
create trigger product_variant_translations_set_updated_at before update on public.product_variant_translations
for each row execute function public.set_updated_at();
create trigger addresses_set_updated_at before update on public.addresses
for each row execute function public.set_updated_at();
create trigger carts_set_updated_at before update on public.carts
for each row execute function public.set_updated_at();
create trigger cart_items_set_updated_at before update on public.cart_items
for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments
for each row execute function public.set_updated_at();

alter table public.store_settings enable row level security;
alter table public.store_translations enable row level security;
alter table public.staff_users enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.category_translations enable row level security;
alter table public.products enable row level security;
alter table public.product_translations enable row level security;
alter table public.product_images enable row level security;
alter table public.product_image_translations enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_variant_translations enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;

create policy store_settings_public_read on public.store_settings
for select to anon, authenticated using (is_active or public.is_staff());
create policy store_settings_staff_all on public.store_settings
for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy store_translations_public_read on public.store_translations
for select to anon, authenticated using (
  exists (
    select 1 from public.store_settings s
    where s.id = store_id and (s.is_active or public.is_staff())
  )
);
create policy store_translations_staff_all on public.store_translations
for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy profiles_own_read on public.profiles
for select to authenticated using (user_id = auth.uid() or public.is_staff());
create policy profiles_own_insert on public.profiles
for insert to authenticated with check (user_id = auth.uid() or public.is_staff());
create policy profiles_own_update on public.profiles
for update to authenticated using (user_id = auth.uid() or public.is_staff())
with check (user_id = auth.uid() or public.is_staff());

create policy categories_public_read on public.categories
for select to anon, authenticated using (is_active or public.is_staff());
create policy categories_staff_all on public.categories
for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy category_translations_public_read on public.category_translations
for select to anon, authenticated using (
  exists (
    select 1 from public.categories c
    where c.id = category_id and (c.is_active or public.is_staff())
  )
);
create policy category_translations_staff_all on public.category_translations
for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy products_public_read on public.products
for select to anon, authenticated using (status = 'active' or public.is_staff());
create policy products_staff_all on public.products
for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy product_translations_public_read on public.product_translations
for select to anon, authenticated using (
  exists (
    select 1 from public.products p
    where p.id = product_id and (p.status = 'active' or public.is_staff())
  )
);
create policy product_translations_staff_all on public.product_translations
for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy product_images_public_read on public.product_images
for select to anon, authenticated using (
  exists (
    select 1 from public.products p
    where p.id = product_id and (p.status = 'active' or public.is_staff())
  )
);
create policy product_images_staff_all on public.product_images
for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy product_image_translations_public_read on public.product_image_translations
for select to anon, authenticated using (
  exists (
    select 1
    from public.product_images i
    join public.products p on p.id = i.product_id
    where i.id = image_id and (p.status = 'active' or public.is_staff())
  )
);
create policy product_image_translations_staff_all on public.product_image_translations
for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy product_variants_public_read on public.product_variants
for select to anon, authenticated using (
  (is_active and exists (
    select 1 from public.products p where p.id = product_id and p.status = 'active'
  )) or public.is_staff()
);
create policy product_variants_staff_all on public.product_variants
for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy product_variant_translations_public_read on public.product_variant_translations
for select to anon, authenticated using (
  exists (
    select 1
    from public.product_variants v
    join public.products p on p.id = v.product_id
    where v.id = variant_id and v.is_active and p.status = 'active'
  ) or public.is_staff()
);
create policy product_variant_translations_staff_all on public.product_variant_translations
for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy inventory_staff_all on public.inventory_movements
for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy addresses_own_all on public.addresses
for all to authenticated using (user_id = auth.uid() or public.is_staff())
with check (user_id = auth.uid() or public.is_staff());

create policy carts_own_all on public.carts
for all to authenticated using (user_id = auth.uid() or public.is_staff())
with check (user_id = auth.uid() or public.is_staff());

create policy cart_items_own_all on public.cart_items
for all to authenticated using (
  public.is_staff() or exists (
    select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()
  )
)
with check (
  public.is_staff() or exists (
    select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()
  )
);

create policy orders_own_read on public.orders
for select to authenticated using (user_id = auth.uid() or public.is_staff());
create policy orders_staff_all on public.orders
for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy order_items_own_read on public.order_items
for select to authenticated using (
  public.is_staff() or exists (
    select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
  )
);
create policy order_items_staff_all on public.order_items
for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy payments_own_read on public.payments
for select to authenticated using (
  public.is_staff() or exists (
    select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
  )
);
create policy payments_staff_all on public.payments
for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy webhook_events_staff_read on public.webhook_events
for select to authenticated using (public.is_staff());

grant usage on schema public to anon, authenticated;
grant select on public.store_settings, public.store_translations,
  public.categories, public.category_translations,
  public.products, public.product_translations,
  public.product_images, public.product_image_translations,
  public.product_variants,
  public.product_variant_translations to anon, authenticated;
grant select, insert, update on public.profiles, public.addresses,
  public.carts, public.cart_items to authenticated;
grant delete on public.addresses, public.carts, public.cart_items to authenticated;
grant select on public.orders, public.order_items, public.payments to authenticated;

-- Writes for orders, payments, inventory and webhooks must be performed by
-- trusted server-side code using the service role. Never expose that key.
