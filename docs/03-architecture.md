# ধাপ ৩: Technical Architecture & Database Schema

## ১. টেক স্ট্যাক (Tech Stack — ভিডিওর আর্কিটেকচারের বাংলাদেশি সংস্করণ)
- **Frontend & Backend Framework:** **Next.js (App Router) + React + Tailwind CSS + Lucide Icons**
  - সিঙ্গেল কোডবেসেই সুন্দর দ্বিভাষিক (`বাংলা / EN`) ফ্রন্টএন্ড এবং নিরাপদ ব্যাকএন্ড API Routes (`/api/...`)।
- **Poster Engine:** **HTML5 High-DPI Canvas / SVG-to-PNG Studio Engine** + AI Copy/Prompt Integration
  - কেন এটি দুর্দান্ত? সাধারণ AI ইমেজ মডেলে বাংলা অক্ষর মাঝে মাঝে ভেঙে যায়! আমাদের কাস্টম ব্র্যান্ডেড পোস্টার ইঞ্জিনে **১০০% নিখুঁত ঝকঝকে বাংলা ফন্ট (`Hind Siliguri` / `Noto Sans Bengali`), দোকানের আসল লোগো, প্রোডাক্টের ছবি, ডিসকাউন্ট ব্যাজ (`৩০% ছাড়!`) ও WhatsApp নম্বর** নিখুঁতভাবে বসে—এবং ১ ক্লিকে HD PNG ডাউনলোড হয়! চাইলে AI ব্যাকগ্রাউন্ড/ইমেজ API-ও যুক্ত করা যাবে।
- **AI Engine (`/api/generate`):** **OpenRouter / OpenAI / Gemini API** সাপোর্ট (`.env` বা Settings থেকে কী দিলেই রিয়েল AI মডেল চলবে, আর কী ছাড়াও স্মার্ট লোকাল বাংলা ইঞ্জিনে সাথে সাথে কাজ করবে যাতে ডেমো কখনো না ভাঙে)।
- **Database & Auth:**
  - **Local / Sandbox Live Preview:** বিল্ট-ইন ফাস্ট সার্ভার স্টোরেজ (`/data/db.json`) যাতে এখনি সাইনআপ, ব্র্যান্ড কিট সেভ, পোস্টার হিস্ট্রি ও ক্রেডিট ডিডাকশন ১০০% রিয়েল ডাটাবেসের মতো কাজ করে।
  - **Production Cloud:** **Supabase (PostgreSQL + Auth + Storage)** — নিচে রেডি SQL স্কিমা দেওয়া আছে যা Supabase MCP বা SQL Editor-এ ১ ক্লিকে রান করলেই ক্লাউড ডাটাবেস তৈরি হয়ে যাবে।
- **Payment Gateway (`/api/payment`):**
  - **UddoktaPay API (`bKash`, `Nagad`, `Rocket`)** + **SSLCommerz** ওয়েবহুক আর্কিটেকচার (ডেমো মোডে ইনস্ট্যান্ট bKash/Nagad চেকআউট সিমুলেটরসহ যাতে পুরো পেমেন্ট ফ্লো এখনই টেস্ট করা যায়)।
- **Hosting / Deployment:** **Vercel** (ফ্রি স্টার্ট) অথবা **Hostinger / VPS**।

---

## ২. সিস্টেম ফ্লো ডায়াগ্রাম (System Flow)
```
[User Browser (বাংলা / EN UI)]
       │
       ├──► Landing Page (Hero, Live Demo, Pricing in ৳ BDT)
       ├──► Auth & Onboarding (Shop Brand Kit Setup)
       └──► Studio Dashboard
               ├── POST /api/generate  ──► AI Model (Ad Copy + Poster Config + Inbox Scripts)
               │                       ──► Deduct 1 Credit & Save to Campaign History
               ├── GET/POST /api/brand ──► Save/Load Shop Logo, Colors, Delivery Info
               └── POST /api/payment   ──► UddoktaPay (bKash/Nagad) Checkout & Auto Credit Top-up
```

---

## ৩. প্রোডাকশন Supabase SQL Schema (পরে ক্লাউডে যুক্ত করার জন্য ১০০% রেডি)
```sql
-- ১. ইউজার প্রোফাইল ও ক্রেডিট ওয়ালেট টেবিল
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  plan text default 'free' check (plan in ('free', 'starter', 'pro', 'agency')),
  credits integer default 5,
  preferred_lang text default 'bn',
  created_at timestamptz default now()
);

-- ২. দোকানের ব্র্যান্ড কিট টেবিল (Shop Brand Kits)
create table public.brand_kits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  shop_name text not null,
  category text default 'fashion',
  tagline text,
  primary_color text default '#059669',
  accent_color text default '#f59e0b',
  phone_whatsapp text,
  delivery_inside_dhaka integer default 70,
  delivery_outside_dhaka integer default 130,
  payment_policy text default 'ক্যাশ অন ডেলিভারি সারা দেশে',
  logo_data_url text,
  created_at timestamptz default now()
);

-- ৩. জেনারেট করা ক্যাম্পেইন ও পোস্টার হিস্ট্রি টেবিল
create table public.campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  product_name text not null,
  regular_price integer,
  offer_price integer,
  features text,
  ad_copies jsonb not null,
  inbox_replies jsonb not null,
  poster_config jsonb not null,
  created_at timestamptz default now()
);

-- ৪. পেমেন্ট ও সাবস্ক্রিপশন লগ টেবিল (bKash / Nagad / UddoktaPay)
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  plan text not null,
  amount_bdt integer not null,
  method text check (method in ('bkash', 'nagad', 'rocket')),
  trx_id text,
  status text default 'completed',
  created_at timestamptz default now()
);
```

---

## ৪. এক্সিকিউশন প্ল্যান (Execution Plan — পরবর্তী ধাপসমূহ)
- **ধাপ ৩ (পরবর্তী ধাপ):** ব্র্যান্ড নাম ও কালার থিম লক করে সম্পূর্ণ দ্বিভাষিক (`বাংলা + EN`) **Live Full-Stack Web App** তৈরি ও লাইভ প্রিভিউ চালু করা।
- **ধাপ ৪:** লাইভ অ্যাপ টেস্ট করে আপনার মতামত অনুযায়ী ডিজাইন, পোস্টার টেমপ্লেট ও ফিচার পলিশ করা।
- **ধাপ ৫:** রিয়েল OpenRouter/OpenAI API Key, Supabase ক্লাউড ডাটাবেস, UddoktaPay (bKash/Nagad) ও GitHub + Vercel লাইভ ডিপ্লয়মেন্ট গাইড ও কানেকশন সম্পন্ন করা।
