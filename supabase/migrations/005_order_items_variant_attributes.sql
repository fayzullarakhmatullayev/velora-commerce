-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 005 — Snapshot variant attributes on order_items
-- Stores the selected attributes (e.g. {"Size":"M"}) at purchase time so
-- they remain readable even if the variant row is later deleted.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.order_items
  add column if not exists variant_attributes jsonb;
