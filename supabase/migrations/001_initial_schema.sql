-- ─────────────────────────────────────────────────────────────────────────────
-- Velora Commerce — Initial Schema
-- Run this in Supabase SQL Editor → run sequentially
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension (already enabled in Supabase by default)
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER: auto-update updated_at timestamp
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: profiles
-- Extends auth.users — auto-created via trigger
-- ─────────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  phone       text,
  role        text not null default 'user' check (role in ('admin', 'user')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: categories
-- Supports parent/child hierarchy + multilingual translations
-- ─────────────────────────────────────────────────────────────────────────────
create table public.categories (
  id           uuid primary key default uuid_generate_v4(),
  slug         text not null unique,
  parent_id    uuid references public.categories(id) on delete set null,
  image        text,
  sort_order   int not null default 0,
  is_active    boolean not null default true,
  -- translations: { en: { name, description }, uz: {...}, ru: {...} }
  translations jsonb not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_categories_slug on public.categories(slug);
create index idx_categories_parent_id on public.categories(parent_id);

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: products
-- Core product table with multilingual translations in JSONB
-- ─────────────────────────────────────────────────────────────────────────────
create table public.products (
  id             uuid primary key default uuid_generate_v4(),
  sku            text not null unique,
  price          numeric(10, 2) not null check (price >= 0),
  compare_price  numeric(10, 2) check (compare_price >= 0),
  stock          int not null default 0 check (stock >= 0),
  images         text[] not null default '{}',
  category_id    uuid references public.categories(id) on delete set null,
  brand          text,
  tags           text[] not null default '{}',
  is_active      boolean not null default true,
  is_featured    boolean not null default false,
  -- translations: { en: { title, description, slug }, uz: {...}, ru: {...} }
  translations   jsonb not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_products_category_id on public.products(category_id);
create index idx_products_is_active on public.products(is_active);
create index idx_products_is_featured on public.products(is_featured);
create index idx_products_translations_en_slug on public.products ((translations -> 'en' ->> 'slug'));

create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: product_variants
-- Size, color, etc. variants with individual pricing/stock
-- ─────────────────────────────────────────────────────────────────────────────
create table public.product_variants (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  sku         text not null unique,
  price       numeric(10, 2) not null check (price >= 0),
  stock       int not null default 0 check (stock >= 0),
  -- attributes: { "color": "red", "size": "M" }
  attributes  jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index idx_product_variants_product_id on public.product_variants(product_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: carts
-- Supports both authenticated users and guests (via session_id)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.carts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade,
  session_id  text,  -- for guest carts
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- At least one of user_id or session_id must be set
  constraint cart_identity check (user_id is not null or session_id is not null)
);

create index idx_carts_user_id on public.carts(user_id);
create index idx_carts_session_id on public.carts(session_id);

create trigger carts_updated_at
  before update on public.carts
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: cart_items
-- ─────────────────────────────────────────────────────────────────────────────
create table public.cart_items (
  id          uuid primary key default uuid_generate_v4(),
  cart_id     uuid not null references public.carts(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  variant_id  uuid references public.product_variants(id) on delete set null,
  quantity    int not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  unique (cart_id, product_id, variant_id)
);

create index idx_cart_items_cart_id on public.cart_items(cart_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: wishlists
-- ─────────────────────────────────────────────────────────────────────────────
create table public.wishlists (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index idx_wishlists_user_id on public.wishlists(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: coupons
-- ─────────────────────────────────────────────────────────────────────────────
create table public.coupons (
  id                uuid primary key default uuid_generate_v4(),
  code              text not null unique,
  type              text not null check (type in ('percentage', 'fixed')),
  value             numeric(10, 2) not null check (value > 0),
  min_order_amount  numeric(10, 2) default 0,
  max_uses          int,  -- null = unlimited
  used_count        int not null default 0,
  is_active         boolean not null default true,
  expires_at        timestamptz,
  created_at        timestamptz not null default now()
);

create index idx_coupons_code on public.coupons(code);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: orders
-- ─────────────────────────────────────────────────────────────────────────────
create table public.orders (
  id                        uuid primary key default uuid_generate_v4(),
  user_id                   uuid not null references auth.users(id) on delete restrict,
  status                    text not null default 'pending'
                              check (status in ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  payment_status            text not null default 'unpaid'
                              check (payment_status in ('unpaid','paid','failed','refunded')),
  subtotal                  numeric(10, 2) not null check (subtotal >= 0),
  discount                  numeric(10, 2) not null default 0 check (discount >= 0),
  total                     numeric(10, 2) not null check (total >= 0),
  shipping_address          jsonb not null default '{}',
  coupon_code               text,
  stripe_payment_intent_id  text,
  notes                     text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_created_at on public.orders(created_at desc);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: order_items
-- Snapshot of product at time of purchase (price/title don't change with edits)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  variant_id  uuid references public.product_variants(id) on delete set null,
  title       text not null,
  image       text,
  price       numeric(10, 2) not null check (price >= 0),
  quantity    int not null check (quantity > 0),
  created_at  timestamptz not null default now()
);

create index idx_order_items_order_id on public.order_items(order_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: reviews
-- ─────────────────────────────────────────────────────────────────────────────
create table public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  is_approved boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product_id, user_id)
);

create index idx_reviews_product_id on public.reviews(product_id);

create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: payments
-- Mirrors Stripe payment intents for audit trail
-- ─────────────────────────────────────────────────────────────────────────────
create table public.payments (
  id                        uuid primary key default uuid_generate_v4(),
  order_id                  uuid not null references public.orders(id) on delete restrict,
  user_id                   uuid not null references auth.users(id) on delete restrict,
  stripe_payment_intent_id  text not null,
  stripe_charge_id          text,
  amount                    numeric(10, 2) not null,
  currency                  text not null default 'usd',
  status                    text not null, -- matches Stripe status strings
  created_at                timestamptz not null default now()
);

create index idx_payments_order_id on public.payments(order_id);
create index idx_payments_stripe_payment_intent_id on public.payments(stripe_payment_intent_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: notifications
-- ─────────────────────────────────────────────────────────────────────────────
create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null, -- 'order_update' | 'promotion' | 'system'
  title      text not null,
  message    text not null,
  is_read    boolean not null default false,
  metadata   jsonb default '{}',
  created_at timestamptz not null default now()
);

create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_is_read on public.notifications(user_id, is_read);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: addresses
-- ─────────────────────────────────────────────────────────────────────────────
create table public.addresses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  label       text not null default 'Home',
  full_name   text not null,
  phone       text not null,
  street      text not null,
  city        text not null,
  state       text,
  country     text not null,
  postal_code text not null,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_addresses_user_id on public.addresses(user_id);

create trigger addresses_updated_at
  before update on public.addresses
  for each row execute function public.handle_updated_at();
