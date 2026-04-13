-- ─────────────────────────────────────────────────────────────────────────────
-- Velora Commerce — Row Level Security Policies
-- Run AFTER 001_initial_schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper function: check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Users can read their own profile; admins can read all
create policy "profiles_select"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- Users can update only their own profile (except role)
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- Admins can update any profile (including role)
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.categories enable row level security;

-- Anyone can read active categories
create policy "categories_select"
  on public.categories for select
  using (is_active = true or public.is_admin());

-- Only admins can write
create policy "categories_insert_admin"
  on public.categories for insert
  with check (public.is_admin());

create policy "categories_update_admin"
  on public.categories for update
  using (public.is_admin());

create policy "categories_delete_admin"
  on public.categories for delete
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.products enable row level security;

-- Anyone can read active products; admins can read all
create policy "products_select"
  on public.products for select
  using (is_active = true or public.is_admin());

-- Only admins can write
create policy "products_insert_admin"
  on public.products for insert
  with check (public.is_admin());

create policy "products_update_admin"
  on public.products for update
  using (public.is_admin());

create policy "products_delete_admin"
  on public.products for delete
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- PRODUCT VARIANTS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.product_variants enable row level security;

create policy "variants_select"
  on public.product_variants for select
  using (
    exists (
      select 1 from public.products
      where id = product_id and (is_active = true or public.is_admin())
    )
  );

create policy "variants_write_admin"
  on public.product_variants for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- CARTS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.carts enable row level security;

-- Users access only their own cart
create policy "carts_select_own"
  on public.carts for select
  using (auth.uid() = user_id);

create policy "carts_insert_own"
  on public.carts for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "carts_update_own"
  on public.carts for update
  using (auth.uid() = user_id);

create policy "carts_delete_own"
  on public.carts for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- CART ITEMS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.cart_items enable row level security;

create policy "cart_items_own"
  on public.cart_items for all
  using (
    exists (
      select 1 from public.carts
      where id = cart_id and user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.carts
      where id = cart_id and user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- WISHLISTS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.wishlists enable row level security;

create policy "wishlists_own"
  on public.wishlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.orders enable row level security;

-- Users can read their own orders; admins can read all
create policy "orders_select"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

-- Only authenticated users can create orders for themselves
create policy "orders_insert"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Users can update their own orders (limited); admins can update all
create policy "orders_update_admin"
  on public.orders for update
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.order_items enable row level security;

create policy "order_items_select"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where id = order_id and (user_id = auth.uid() or public.is_admin())
    )
  );

create policy "order_items_insert"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where id = order_id and user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.reviews enable row level security;

-- Anyone can read approved reviews; admins can read all
create policy "reviews_select"
  on public.reviews for select
  using (is_approved = true or auth.uid() = user_id or public.is_admin());

-- Authenticated users can write their own review
create policy "reviews_insert"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "reviews_update_own"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admins can approve/delete
create policy "reviews_manage_admin"
  on public.reviews for all
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- COUPONS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.coupons enable row level security;

-- Authenticated users can look up coupons (to validate codes)
create policy "coupons_select"
  on public.coupons for select
  using (auth.role() = 'authenticated');

-- Only admins can manage coupons
create policy "coupons_manage_admin"
  on public.coupons for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.payments enable row level security;

create policy "payments_select"
  on public.payments for select
  using (auth.uid() = user_id or public.is_admin());

-- Payments are only written server-side via service role — no client insert policy

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.notifications enable row level security;

create policy "notifications_own"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ADDRESSES
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.addresses enable row level security;

create policy "addresses_own"
  on public.addresses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "addresses_admin"
  on public.addresses for select
  using (public.is_admin());
