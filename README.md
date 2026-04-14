# Velora Commerce

> **Shop Beautifully. Scale Effortlessly.**

A premium, production-ready e-commerce platform built with Nuxt 4, Supabase, and Stripe. Velora Commerce delivers a luxurious shopping experience with a fully multilingual UI, real-time data, and a powerful admin panel — all in a modern, dark-mode-ready design.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
  - [Storefront](#storefront)
  - [Authentication](#authentication)
  - [Product System](#product-system)
  - [Shopping Cart & Checkout](#shopping-cart--checkout)
  - [User Account](#user-account)
  - [Admin Panel](#admin-panel)
  - [Multilingual Support](#multilingual-support)
  - [Design System](#design-system)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## Overview

Velora Commerce is a full-stack e-commerce application built for real-world use. It covers the complete customer journey — from browsing and wishlisting to checkout and order tracking — alongside a feature-rich admin dashboard for managing products, orders, users, coupons, reviews, and analytics.

The platform is multilingual from day one, supporting **English**, **Uzbek**, and **Russian** across both UI labels and database content (product titles, descriptions, category names).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) (Vue 3 + TypeScript) |
| Database & Auth | [Supabase](https://supabase.com) (PostgreSQL + RLS) |
| Payments | [Stripe](https://stripe.com) (PaymentIntents + Webhooks) |
| UI Components | [Nuxt UI v4](https://ui.nuxt.com) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| State Management | [Pinia](https://pinia.vuejs.org) |
| Internationalization | [Nuxt i18n](https://i18n.nuxtjs.org) |
| Utilities | [VueUse](https://vueuse.org) |
| Linting / Formatting | ESLint + Prettier |

---

## Features

### Storefront

- **Cinematic hero section** — two-column layout with floating 3D product cards using CSS perspective transforms and continuous float animations
- **Featured products** — curated grid of highlighted products with hover animations and quick-add-to-cart
- **Promo banners** — "Limited Time Deals" (links to `/shop?sale=true`) and "Just Dropped" (links to `/shop?sort=newest`) with hover lift effects
- **Categories showcase** — full-bleed image cards with dark gradient overlay and scale-on-hover
- **Trust bar** — free shipping, secure checkout, easy returns, and 24/7 support icons
- **Shop page** — full product catalog with:
  - URL-synced filters (category, sort, price range, sale toggle)
  - Debounced search (400ms)
  - Pagination (20 products per page)
  - Responsive sidebar for desktop, slide-over drawer for mobile
- **Product detail page** — image gallery with thumbnails, variant picker (color/size), stock status, wishlist toggle, add to cart, and full reviews section
- **About, Contact, Privacy, Terms** — static marketing pages

---

### Authentication

Powered by Supabase Auth with session persistence across page reloads.

- **Register** — email + password with auto profile creation via database trigger
- **Login** — email + password with redirect to intended page
- **Forgot password** — sends reset email via Supabase
- **Email confirmation** — callback page at `/auth/confirm` handles verification tokens
- **Session persistence** — 30-day cookie, refreshed automatically
- **Auth middleware** — protects account and admin routes; redirects unauthenticated users
- **Role-based access** — `profiles.role` field (`user` / `admin`) used for admin panel access

---

### Product System

Products support a rich set of attributes:

| Field | Details |
|---|---|
| Title / Description | Multilingual via JSONB (`{en, uz, ru}`) |
| Slug | URL-friendly unique identifier |
| Images | Array of URLs (Supabase Storage) |
| Price / Compare Price | Decimal; compare price enables "sale" detection |
| Stock | Integer with per-variant breakdown |
| SKU | Unique stock keeping unit |
| Brand / Tags | Searchable metadata |
| Category | Foreign key to categories table |
| Featured flag | Surfaces product on homepage |
| Variants | Separate table: color, size, price, stock per variant |
| Reviews | Approved ratings (1–5) with comments |

**Category system:**

- Hierarchical (parent/child support)
- Multilingual names and slugs
- Sort order + active/inactive toggle
- Category images (Supabase Storage)

---

### Shopping Cart & Checkout

**Cart:**
- Animated slide-over cart drawer
- Add/remove items, quantity controls
- Guest cart via `session_id` (anonymous), persisted across browsing
- Cart merges into user account on login
- Real-time item count badge in header

**Wishlist:**
- Toggle products in/out of wishlist
- Persisted to database for logged-in users
- Wishlist page with grid view and remove controls

**Checkout:**
- Stripe PaymentIntent flow — client creates intent, completes payment on frontend
- Order created in database before payment confirmation
- Stripe webhook updates order status on `payment_intent.succeeded` / `payment_intent.payment_failed`
- Coupon code field with real-time validation (discount type: percentage or fixed, min order amount, usage limits, expiry)
- Shipping address collection
- Order summary with itemized totals
- Success page with order confirmation and link to order detail

---

### User Account

All account pages require authentication.

| Page | Features |
|---|---|
| Dashboard | Overview of recent orders, quick links |
| Profile | Edit full name, phone; upload avatar (drag-and-drop or click; 5 MB limit; instant preview) |
| Orders | Filterable order history with status badges |
| Order Detail | Line items, shipping info, payment status, Stripe payment reference |
| Addresses | Add / edit / delete / set-default delivery addresses |
| Wishlist | Saved products with add-to-cart and remove |

---

### Admin Panel

Admin routes are SPA-rendered (SSR disabled) and protected by role middleware.

#### Dashboard
- KPI cards: total orders, today's orders, active products, total users, 30-day revenue
- Quick links to all admin sections

#### Products
- Searchable, filterable product list (status: active / draft / archived)
- **Create / Edit product form** — full multilingual support (en/uz/ru tabs), image upload to Supabase Storage, variant management (add/remove/price/stock per variant), pricing, category, brand, tags, SKU, stock, featured toggle
- Soft-delete / status toggle

#### Categories
- List with image, name, slug, sort order
- Create / edit with image upload
- Active / inactive toggle

#### Orders
- List with search, status filter, date range
- **Inline status select** — change order status directly from the table row without navigating away
- Order detail: full line items, customer info, shipping address, payment info
- **Stripe sync button** — manually pulls the latest PaymentIntent state from Stripe (detects refunds, cancellations, async card flows) and updates the order's `payment_status` and `status`

#### Users
- Full user list with search (pre-filters when navigating from "View Customer" on an order)
- Role badge, join date, email

#### Coupons
- Create / edit discount codes
- Type: percentage or fixed amount
- Fields: code, discount value, min order amount, max uses, expiry date, active toggle

#### Reviews
- Moderation queue: filter by pending / approved / all
- Approve / unapprove / delete reviews
- Star ratings displayed inline
- Product and user linked for context

#### Analytics
- Revenue chart: 7-day, 30-day, 90-day periods with period-over-period comparison
- Order status breakdown (pie / bar)
- Top products by revenue

---

### Multilingual Support

All UI text is managed via **Nuxt i18n** with locale files at `i18n/locales/`.

| Language | Code | Label |
|---|---|---|
| English | `en` | English (default) |
| Uzbek | `uz` | O'zbek |
| Russian | `ru` | Русский |

- Locale persisted in a cookie across visits
- Language switcher in header and mobile menu
- Database content (product titles, descriptions, category names) stored as JSONB with `{en, uz, ru}` keys and served in the active locale

---

### Design System

- **Color palette** — Rose primary, Zinc neutral (configured in `app.config.ts`)
- **Typography** — Inter (body), Plus Jakarta Sans (display headings) via Google Fonts
- **Dark mode** — full support across all pages and components via Nuxt UI's color mode
- **Animations:**
  - Page transitions (fade + translateY)
  - Float animation for hero product cards
  - Hover lift on product cards with gradient overlay and glassmorphic quick-add button
  - Skeleton loaders on all data-fetching views
  - Smooth scroll behavior
- **Responsive** — mobile-first; breakpoints at sm/md/lg/xl
- **Custom scrollbar** — styled via webkit pseudo-elements
- **Focus ring** — accessible, uses `--ui-primary` token

---

## Project Structure

```
velora-commerce/
├── app/
│   ├── pages/
│   │   ├── index.vue                  # Homepage
│   │   ├── about.vue
│   │   ├── contact.vue
│   │   ├── privacy.vue
│   │   ├── terms.vue
│   │   ├── shop/index.vue             # Product catalog
│   │   ├── product/[slug].vue         # Product detail
│   │   ├── cart/index.vue
│   │   ├── checkout/
│   │   │   ├── index.vue              # Payment form
│   │   │   └── success.vue
│   │   ├── auth/
│   │   │   ├── login.vue
│   │   │   ├── register.vue
│   │   │   ├── forgot-password.vue
│   │   │   └── confirm.vue
│   │   ├── account/
│   │   │   ├── index.vue              # Account dashboard
│   │   │   ├── profile.vue
│   │   │   ├── addresses.vue
│   │   │   ├── wishlist.vue
│   │   │   └── orders/
│   │   │       ├── index.vue
│   │   │       └── [id].vue
│   │   └── admin/
│   │       ├── index.vue              # Admin dashboard
│   │       ├── analytics/index.vue
│   │       ├── products/
│   │       │   ├── index.vue
│   │       │   ├── new.vue
│   │       │   └── [id].vue
│   │       ├── categories/index.vue
│   │       ├── orders/
│   │       │   ├── index.vue
│   │       │   └── [id].vue
│   │       ├── coupons/index.vue
│   │       ├── reviews/index.vue
│   │       └── users/index.vue
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppNavigation.vue
│   │   │   ├── AppFooter.vue
│   │   │   ├── AppMobileMenu.vue
│   │   │   ├── CartButton.vue
│   │   │   ├── WishlistButton.vue
│   │   │   ├── LanguageSwitcher.vue
│   │   │   └── ThemeToggle.vue
│   │   ├── product/
│   │   │   ├── ProductCard.vue
│   │   │   ├── ProductGrid.vue
│   │   │   ├── ProductFilters.vue
│   │   │   └── ProductImageGallery.vue
│   │   ├── cart/
│   │   │   ├── CartDrawer.vue
│   │   │   └── CartItem.vue
│   │   ├── admin/
│   │   │   ├── AdminHeader.vue
│   │   │   ├── AdminSidebar.vue
│   │   │   ├── AdminProductForm.vue
│   │   │   ├── AdminImageUpload.vue
│   │   │   └── AdminStatCard.vue
│   │   └── ui/
│   │       ├── VCard.vue
│   │       ├── VBadge.vue
│   │       └── VSkeleton.vue
│   ├── composables/
│   │   ├── useSupabase.ts
│   │   ├── useAuth.ts
│   │   ├── useProduct.ts
│   │   ├── useProducts.ts
│   │   ├── useCategories.ts
│   │   ├── useProductReviews.ts
│   │   ├── useCart.ts
│   │   ├── useWishlist.ts
│   │   ├── useAdminStats.ts
│   │   ├── useAdminProducts.ts
│   │   ├── useAdminOrders.ts
│   │   ├── useAdminProductForm.ts
│   │   └── useAdminAnalytics.ts
│   ├── stores/
│   │   ├── cart.ts
│   │   └── wishlist.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── admin.ts
│   ├── plugins/
│   │   └── auth.client.ts
│   ├── assets/css/main.css
│   ├── app.vue
│   └── app.config.ts
├── server/
│   └── api/
│       ├── checkout/
│       │   ├── intent.post.ts         # Create Stripe PaymentIntent
│       │   └── webhook.post.ts        # Stripe webhook handler
│       └── admin/
│           └── sync-stripe.post.ts    # Manual Stripe sync for order detail
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql     # All tables + triggers
│       ├── 002_rls_policies.sql       # Row-Level Security
│       ├── 003_storage_buckets.sql    # Storage buckets + policies
│       └── 004_seed_data.sql          # Sample data
├── i18n/
│   └── locales/
│       ├── en.json
│       ├── uz.json
│       └── ru.json
├── public/
├── nuxt.config.ts
├── app.config.ts
└── package.json
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `profiles` | Extended user data (name, avatar, phone, role) — auto-created on sign-up |
| `categories` | Hierarchical product categories with multilingual JSONB names |
| `products` | Core product catalog with multilingual JSONB titles/descriptions |
| `product_variants` | Per-variant stock, pricing, and attribute combinations |
| `carts` | Dual-mode: user cart (`user_id`) or guest cart (`session_id`) |
| `cart_items` | Line items in a cart (product + optional variant + quantity) |
| `wishlists` | Saved products per user (unique constraint: user + product) |
| `coupons` | Discount codes (percentage/fixed, min amount, usage limits, expiry) |
| `orders` | Purchase orders with status, payment status, totals, Stripe reference |
| `order_items` | Immutable snapshot of purchased items at time of order |
| `reviews` | Product ratings (1–5) with approval workflow |
| `payments` | Stripe payment audit trail (intent ID, charge ID, amounts, events) |
| `notifications` | User notifications (order updates, promotions, system) with read state |
| `addresses` | Saved delivery addresses with default flag |

All tables use Row-Level Security (RLS). Admins have full access via the `is_admin()` helper function. Users can only read and write their own data. Products and categories are publicly readable.

**Storage buckets:**

| Bucket | Access | Max Size | Accepted Types |
|---|---|---|---|
| `products` | Public read / Admin write | 5 MB | JPEG, PNG, WebP, GIF |
| `categories` | Public read / Admin write | 5 MB | JPEG, PNG, WebP, GIF |
| `avatars` | Public read / Owner write | 2 MB | JPEG, PNG, WebP, GIF |

---

## API Routes

### `POST /api/checkout/intent`

Creates a Stripe PaymentIntent for the current order.

**Body:**
```json
{
  "amount": 4999,
  "currency": "usd",
  "metadata": { "orderId": "uuid" }
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "intentId": "pi_xxx"
}
```

---

### `POST /api/checkout/webhook`

Stripe webhook endpoint. Validates the `Stripe-Signature` header.

Handles:
- `payment_intent.succeeded` → sets order `status: paid`, `payment_status: paid`
- `payment_intent.payment_failed` → sets `payment_status: failed`

---

### `POST /api/admin/sync-stripe`

Pulls the latest state of a PaymentIntent from Stripe and updates the matching order. Detects refunds by checking `latest_charge.amount_refunded`.

**Body:**
```json
{ "paymentIntentId": "pi_xxx" }
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account

### 1. Clone and install

```bash
git clone https://github.com/your-username/velora-commerce.git
cd velora-commerce
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### 3. Run Supabase migrations

Apply migrations in order using the Supabase CLI or the SQL editor in the Supabase dashboard:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_storage_buckets.sql
supabase/migrations/004_seed_data.sql
```

### 4. Set up Stripe webhook (local dev)

```bash
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

Copy the webhook signing secret printed to the terminal and set it as `STRIPE_WEBHOOK_SECRET` in `.env`.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous (public) key |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI or dashboard webhook signing secret |
| `APP_URL` | Base URL of the deployed app (e.g. `https://velora.example.com`) |
| `APP_NAME` | App display name (default: `Velora Commerce`) |

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run generate     # Static site generation
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format with Prettier
npm run typecheck    # TypeScript type check
```

---

## License

MIT
