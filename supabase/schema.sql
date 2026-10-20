-- ============================================================
-- Sellora AI — Complete Production Supabase PostgreSQL Schema
-- Copy & Run inside: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null default 'উদ্যোক্তা',
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro', 'agency')),
  credits integer not null default 5,
  preferred_lang text not null default 'bn' check (preferred_lang in ('bn', 'en')),
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  shop_name text not null,
  category text not null default 'fashion',
  tagline text default '',
  primary_color text not null default '#e11d48',
  accent_color text not null default '#f59e0b',
  phone_whatsapp text default '',
  page_url text default '',
  delivery_inside_dhaka integer not null default 70,
  delivery_outside_dhaka integer not null default 130,
  payment_policy text default 'পণ্য হাতে পেয়ে দেখে পেমেন্ট — সারা দেশে হোম ডেলিভারি',
  logo_data_url text default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  product_name text not null,
  regular_price integer not null default 0,
  offer_price integer not null default 0,
  features text default '',
  copy_style text not null default 'bn',
  poster_config jsonb not null,
  ad_copies jsonb not null,
  inbox_replies jsonb not null,
  source_engine text not null default 'smart_engine',
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  plan text not null,
  credits_added integer not null default 0,
  amount_bdt integer not null default 0,
  method text not null check (method in ('bkash', 'nagad', 'rocket')),
  sender_number text not null,
  trx_id text not null,
  status text not null default 'completed' check (status in ('pending', 'completed', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.app_kv_store (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
