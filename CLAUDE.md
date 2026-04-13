# Velora Commerce — Build a Modern Full-Stack E-Commerce Application

Create **Velora Commerce**, a premium production-ready e-commerce platform with a luxurious modern feel, fast performance, and scalable architecture.

The name **Velora** represents elegance, velocity, and modern digital commerce.

---

## Brand Identity

**Product Name:** Velora Commerce  
**Tagline:** _Shop Beautifully. Scale Effortlessly._

### Brand Feel

- Premium
- Modern
- Fast
- Elegant
- Trustworthy
- Tech-forward

---

# Core Requirement (Important)

The platform must be **fully multilingual** in both:

1. **Frontend UI**
2. **Database Content**

Supported languages:

- **English** (default)
- **Uzbek**
- **Russian**

All content and UI must be designed with localization in mind from day one.

---

### Visual Direction

Inspired by:

- Apple
- Stripe
- Shopify
- Linear
- Vercel

Use soft gradients, smooth motion, refined typography, subtle shadows, rounded layouts, and a clean premium shopping experience.

---

## Tech Stack

- **Frontend:** Nuxt 3 (Vue 3 + TypeScript)
- **Backend / Database / Auth:** Supabase
- **UI Library:** Nuxt UI / ShadCN Vue / premium modern component system
- **Styling:** Tailwind CSS
- **Animations:** GSAP / Motion One / Vue transitions
- **Deployment:** Vercel / Netlify / Docker ready

---

# Main Goal

Build a complete startup-quality e-commerce ecosystem with:

- Premium UI/UX
- Smooth animations
- Secure auth
- Admin panel
- Customer dashboard
- Product management
- Payment system
- SEO optimized pages
- Production architecture

---

# Design Requirements

Claude should fully design the UI.

## Must Include

- Cinematic landing page hero
- Smooth scrolling effects
- Hover animations
- Premium buttons
- Elegant cards
- Product image zoom/transitions
- Skeleton loaders
- Page transitions
- Dark / light mode
- Mobile-first responsive design
- Excellent spacing & typography

---

# User Roles

## Guest

- Browse products
- Search products
- View product pages
- Register / Login
- Add to cart locally

## User

- Checkout
- Wishlist
- Orders
- Addresses
- Reviews
- Notifications
- Profile management

## Admin

- Revenue dashboard
- Product CRUD
- Orders management
- User management
- Coupon system
- Inventory
- Analytics
- Role management
- Site settings

---

# Core Features

## Authentication

Use Supabase Auth:

- Register
- Login
- Password reset
- Email verification
- Session persistence
- Role middleware

---

## Product System

Products support:

- Title
- Slug
- Description
- Gallery
- Price
- Discount
- Stock
- SKU
- Variants
- Brand
- Category
- Tags
- Reviews
- Ratings

---

## Cart & Checkout

- Animated cart drawer
- Save cart
- Guest/user cart merge
- Shipping info
- Billing info
- Coupon codes
- Order summary
- Secure payment

---

# Payment Integration

Use Stripe preferred:

- Card payments
- Webhooks
- Success / fail states
- Refund-ready architecture

---

# Supabase Tables

Create tables:

- profiles
- roles
- products
- categories
- carts
- cart_items
- wishlists
- orders
- order_items
- reviews
- coupons
- payments
- notifications

Use RLS and secure policies.

---

# Pages

## Public

- Home
- Shop
- Product
- About
- Contact
- Login
- Register

## User

- Dashboard
- Orders
- Wishlist
- Profile

## Admin

- Dashboard
- Products
- Orders
- Users
- Analytics
- Settings

---

# Nuxt Structure

```bash
pages/
components/
layouts/
middleware/
composables/
stores/
server/
types/
utils/
plugins/
```

# Multilanguage Frontend Requirements

Use **Nuxt i18n** for full localization.

## Supported locales

```ts
en (default)
uz
ru
```
