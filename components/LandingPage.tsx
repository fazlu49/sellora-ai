"use client";

import React, { useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { PosterCanvas } from "./PosterCanvas";
import { BrandKit, Language, PlanTier, PosterTemplateId } from "@/lib/types";
import {
  ArrowRight,
  Check,
  Download,
  Image as ImageIcon,
  MessageSquareText,
  Sparkles,
  Store,
  Zap,
} from "lucide-react";

interface LandingPageProps {
  lang: Language;
  freeLaunchMode: boolean;
  onToggleLang: (next: Language) => void;
  onStartFree: () => void;
  onLoginClick: () => void;
  onOpenDashboard: () => void;
  onSelectPaidPlan: (plan: PlanTier) => void;
  brandKit: BrandKit;
}

const SHOWCASE_BRAND: BrandKit = {
  shopName: "আরোরা বুটিক হাউস",
  category: "fashion",
  tagline: "খাঁটি দেশি বুনন ও প্রিমিয়াম ফ্যাশন কালেকশন",
  primaryColor: "#e11d48",
  accentColor: "#f59e0b",
  phoneWhatsapp: "01712-987654",
  pageUrl: "fb.com/auroraboutiquebd",
  deliveryInsideDhaka: 70,
  deliveryOutsideDhaka: 130,
  paymentPolicy: "পণ্য হাতে পেয়ে দেখে পেমেন্ট — সারা দেশে হোম ডেলিভারি",
};

const HERO_SAMPLES: Array<{
  id: string;
  labelBn: string;
  labelEn: string;
  productNameBn: string;
  productNameEn: string;
  reg: number;
  offer: number;
  img: string;
  highlightsBn: string[];
  highlightsEn: string[];
}> = [
  {
    id: "kurti",
    labelBn: "জামদানি থ্রি-পিস",
    labelEn: "Jamdani 3-Piece",
    productNameBn: "রয়েল মেরুন জামদানি এমব্রয়ডারি থ্রি-পিস",
    productNameEn: "Royal Maroon Jamdani Embroidered 3-Piece",
    reg: 2450,
    offer: 1750,
    img: "/samples/kurti.png",
    highlightsBn: ["১০০% সুতি কাপড়", "রঙ গ্যারান্টি", "হাতে পেয়ে পেমেন্ট"],
    highlightsEn: ["100% Pure Cotton", "Color Guaranteed", "Cash on Delivery"],
  },
  {
    id: "honey",
    labelBn: "সুন্দরবনের মধু",
    labelEn: "Organic Honey",
    productNameBn: "খাঁটি সুন্দরবনের প্রাকৃতিক চাকের মধু (১ কেজি)",
    productNameEn: "100% Raw Sundarbans Honeycomb Honey (1kg)",
    reg: 1650,
    offer: 1290,
    img: "/samples/honey.png",
    highlightsBn: ["১০০% খাঁটি প্রাকৃতিক", "ল্যাব টেস্টেড", "ফ্রি হোম ডেলিভারি"],
    highlightsEn: ["100% Raw Natural", "Lab Tested", "Check Before Pay"],
  },
  {
    id: "watch",
    labelBn: "স্মার্টওয়াচ আলট্রা",
    labelEn: "Smartwatch Pro",
    productNameBn: "টাইটানিয়াম অ্যামোলেড কলিং স্মার্টওয়াচ প্রো",
    productNameEn: "Titanium AMOLED Bluetooth Calling Watch",
    reg: 3200,
    offer: 2190,
    img: "/samples/watch.png",
    highlightsBn: ["ব্লুটুথ কলিং সুবিধা", "৭ দিন ব্যাটারি ব্যাকআপ", "৬ মাসের ওয়ারেন্টি"],
    highlightsEn: ["BT Calling", "7-Day Battery", "6 Months Warranty"],
  },
];

const TEMPLATE_PILLS: Array<{ id: PosterTemplateId; bn: string; en: string }> = [
  { id: "magenta_luxe", bn: "ম্যাজেন্টা লাক্স", en: "Magenta Luxe" },
  { id: "dark_executive", bn: "ডার্ক প্রিমিয়াম", en: "Dark Studio" },
  { id: "minimal_boutique", bn: "মিনিমাল বুটিক", en: "Minimal Boutique" },
  { id: "flash_split", bn: "ফ্ল্যাশ স্প্লিট", en: "Flash Split" },
];

export function LandingPage({
  lang,
  freeLaunchMode,
  onToggleLang,
  onStartFree,
  onLoginClick,
  onOpenDashboard,
  onSelectPaidPlan,
}: LandingPageProps) {
  const [sampleIdx, setSampleIdx] = useState(0);
  const [templateId, setTemplateId] = useState<PosterTemplateId>("magenta_luxe");
  const [wlShop, setWlShop] = useState("");
  const [wlContact, setWlContact] = useState("");
  const [wlDone, setWlDone] = useState(false);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wlContact.trim()) return;
    await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "join_waitlist",
        shopName: wlShop,
        contact: wlContact,
      }),
    });
    setWlContact("");
    setWlShop("");
    setWlDone(true);
  };

  const activeSample = HERO_SAMPLES[sampleIdx];
  const discount = Math.round(
    ((activeSample.reg - activeSample.offer) / activeSample.reg) * 100
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo lang={lang} />

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-rose-600">
              {lang === "bn" ? "ফিচারসমূহ" : "Features"}
            </a>
            <a href="#workflow" className="transition hover:text-rose-600">
              {lang === "bn" ? "কীভাবে কাজ করে" : "How It Works"}
            </a>
            <a href="#pricing" className="transition hover:text-rose-600">
              {freeLaunchMode
                ? lang === "bn"
                  ? "ফ্রি অ্যাক্সেস"
                  : "Free Access"
                : lang === "bn"
                ? "প্রাইসিং (৳)"
                : "Pricing (৳)"}
            </a>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Switcher */}
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => onToggleLang("bn")}
                className={`rounded-lg px-2.5 py-1.5 transition ${
                  lang === "bn"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => onToggleLang("en")}
                className={`rounded-lg px-2.5 py-1.5 transition ${
                  lang === "en"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={onLoginClick}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:text-sm"
            >
              {lang === "bn" ? "লগইন" : "Login"}
            </button>

            <button
              type="button"
              onClick={onStartFree}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm shadow-rose-600/25 transition hover:bg-rose-700 sm:px-4 sm:text-sm"
            >
              <span>{lang === "bn" ? "অ্যাকাউন্ট খুলুন" : "Sign Up"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-white via-rose-50/25 to-slate-50 pt-12 pb-20 lg:pt-18 lg:pb-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700">
              <Sparkles className="h-3.5 w-3.5 text-rose-600" />
              <span>
                {lang === "bn"
                  ? "বাংলাদেশের F-Commerce সেলারদের #১ AI মার্কেটিং স্টুডিও"
                  : "#1 AI Marketing Studio Built for Bangladesh F-Commerce"}
              </span>
            </div>

            <h1 className="text-3xl leading-[1.2] font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              {lang === "bn" ? (
                <>
                  পণ্যের ছবি ও দাম দিন —{" "}
                  <span className="text-rose-600">৩০ সেকেন্ডে তৈরি করুন</span>{" "}
                  বুস্ট-রেডি পোস্টার ও বাংলা অ্যাড কপি
                </>
              ) : (
                <>
                  Drop a Product Photo & Price —{" "}
                  <span className="text-rose-600">Launch Boost-Ready</span>{" "}
                  Bangla Posters & Ad Copy in 30s
                </>
              )}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {lang === "bn"
                ? "গ্রাফিক ডিজাইনার বা কপিরাইটার ছাড়াই আপনার Facebook Page-এর লোগো, রঙ ও WhatsApp নম্বরসহ HD অফার ব্যানার, ৩ ধরনের হাই-কনভার্টিং বাংলা অ্যাড কপি এবং ইনবক্স ক্লোজিং স্ক্রিপ্ট তৈরি করুন এক ক্লিকে।"
                : "No expensive graphic designer needed. Automatically generate 1080×1080 HD Bangla promotional posters, high-converting Facebook ad hooks, and customer inbox closing replies tailored to your shop."}
            </p>

            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onStartFree}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-7 py-4 text-base font-bold text-white shadow-lg shadow-rose-600/25 transition hover:bg-rose-700"
              >
                <Zap className="h-5 w-5" />
                <span>
                  {lang === "bn"
                    ? "ফ্রি অ্যাকাউন্ট খুলুন"
                    : "Create Free Account"}
                </span>
              </button>

              <button
                type="button"
                onClick={onOpenDashboard}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <span>
                  {lang === "bn"
                    ? "লগইন ছাড়াই ফ্রি স্টুডিও →"
                    : "Try Free Guest Studio →"}
                </span>
              </button>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" />
                {lang === "bn"
                  ? "শুরু করতে কোনো কার্ড লাগবে না"
                  : "No credit card required"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" />
                {freeLaunchMode
                  ? lang === "bn"
                    ? "কোনো পেমেন্ট লাগবে না — ১০০% ফ্রি লঞ্চ অফার"
                    : "Zero payment required — 100% Free Launch Access"
                  : lang === "bn"
                  ? "bKash, Nagad ও Rocket পেমেন্ট সাপোর্ট"
                  : "bKash, Nagad & Rocket supported"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" />
                {lang === "bn"
                  ? "ঝকঝকে বাংলা ফন্ট ও HD 1080px PNG"
                  : "Crisp Bangla Fonts & 1080px HD PNG"}
              </span>
            </div>
          </div>

          {/* Right Interactive Studio Showcase */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                  {lang === "bn" ? "লাইভ ইন্টারেক্টিভ প্রিভিউ:" : "Interactive Live Output:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {HERO_SAMPLES.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSampleIdx(idx)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                        sampleIdx === idx
                          ? "bg-rose-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {lang === "bn" ? item.labelBn : item.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <PosterCanvas
                poster={{
                  templateId,
                  aspect: "square",
                  badgeText:
                    lang === "bn"
                      ? `${discount}% বিশেষ ছাড়`
                      : `FLAT ${discount}% OFF`,
                  headline:
                    lang === "bn"
                      ? activeSample.productNameBn
                      : activeSample.productNameEn,
                  subline:
                    lang === "bn"
                      ? "আজ অর্ডারে বিশেষ ছাড় • স্টক সীমিত!"
                      : "Limited Stock Offer • Order Today!",
                  highlights:
                    lang === "bn"
                      ? activeSample.highlightsBn
                      : activeSample.highlightsEn,
                  ctaText:
                    lang === "bn"
                      ? `অর্ডার করুন: ${SHOWCASE_BRAND.phoneWhatsapp}`
                      : `Order Now: ${SHOWCASE_BRAND.phoneWhatsapp}`,
                  productImageUrl: activeSample.img,
                }}
                brandKit={SHOWCASE_BRAND}
                regularPrice={activeSample.reg}
                offerPrice={activeSample.offer}
                copyStyle={lang === "bn" ? "bn" : "en"}
              />

              {/* Template Style Selector Pills */}
              <div className="mt-3.5 grid grid-cols-4 gap-1.5">
                {TEMPLATE_PILLS.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setTemplateId(tpl.id)}
                    className={`rounded-xl border px-2 py-2 text-[11px] font-bold transition ${
                      templateId === tpl.id
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {lang === "bn" ? tpl.bn : tpl.en}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core 3 Value Pillars */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-wider text-rose-600 uppercase">
            {lang === "bn" ? "কেন Sellora AI আলাদা" : "Why Sellora AI"}
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-4xl">
            {lang === "bn"
              ? "একজন ডিজাইনার ও কপিরাইটারের পুরো কাজ — একা একটি টুলে"
              : "Your Graphic Designer, Ad Copywriter & Sales Closer in One Studio"}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <ImageIcon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {lang === "bn"
                ? "১. ভাঙা বাংলা অক্ষর নয় — ১০০% নিখুঁত HD পোস্টার"
                : "1. Zero Broken Bangla Fonts — 1080px HD Posters"}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
              {lang === "bn"
                ? "সাধারণ AI ইমেজ টুলে বাংলা বানান ভেঙে যায়। আমাদের Smart Canvas ইঞ্জিনে আপনার দোকানের লোগো, পণ্যের ছবি, ছাড় % ব্যাজ ও WhatsApp নম্বর একদম প্রিন্ট-কোয়ালিটিতে বসে।"
                : "Generic AI image tools garble Bengali text. Our dedicated studio engine renders razor-sharp Hind Siliguri typography, auto discount badges, and your shop branding."}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-rose-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {lang === "bn"
                ? "২. ৩ ধরনের পরীক্ষিত Facebook Boost Ad Copy"
                : "2. 3 High-Converting Facebook Boost Hooks"}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
              {lang === "bn"
                ? "প্রতিটি পণ্যের জন্য আলাদাভাবে অফার হুক, ক্যাশ-অন-ডেলিভারি ট্রাস্ট হুক এবং রিস্টক স্টোরিটেলিং কপি তৈরি হয়—বাংলা, বাংলিশ অথবা ইংরেজিতে।"
                : "Get three ready-to-run Meta ad variations per product—Urgency Hook, Zero-Risk COD Trust Angle, and Restock Social Proof—in Bangla, Banglish, or English."}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xs">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <MessageSquareText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {lang === "bn"
                ? "৩. ইনবক্স ও কমেন্ট ক্লোজার স্ক্রিপ্ট ব্যাংক"
                : "3. Instant Inbox & Comment Sales Closer"}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
              {lang === "bn"
                ? '"দাম কত?", "অরিজিনাল হবে তো?", "ঢাকার বাইরে বিকাশ অ্যাডভান্স কেন দেবো?"—প্রতিটি প্রশ্নের রেডি উত্তর ১ ক্লিকে কপি করে মেসেঞ্জারে পাঠান।'
                : 'Turn "Price please?" comments into confirmed orders with pre-personalized replies for pricing, authenticity doubts, bargaining, and outside-Dhaka courier booking.'}
            </p>
          </div>
        </div>
      </section>

      {/* 3-Step How It Works */}
      <section id="workflow" className="border-y border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-4xl">
              {lang === "bn"
                ? "মাত্র ৩টি সহজ ধাপে সেল পোস্ট রেডি"
                : "From Raw Phone Photo to Live Ad in 3 Steps"}
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: Store,
                step: "০১",
                titleBn: "১ বার Shop Brand Kit সেভ করুন",
                titleEn: "Save Your Shop Brand Kit Once",
                descBn:
                  "দোকানের নাম, লোগো, ব্র্যান্ড রঙ, WhatsApp নম্বর ও ডেলিভারি চার্জ একবার সেভ করলেই সব পোস্টারে অটো বসে যাবে।",
                descEn:
                  "Set your page name, logo, colors, WhatsApp number, and Dhaka/Outside-Dhaka delivery charges once.",
              },
              {
                icon: Zap,
                step: "০২",
                titleBn: "পণ্যের ছবি, দাম ও বৈশিষ্ট্য দিন",
                titleEn: "Upload Product Photo & Offer Price",
                descBn:
                  "ফোনে তোলা পণ্যের ছবি আপলোড করে আসল দাম ও অফার দাম লিখুন—AI নিজেই ছাড়ের হিসাব ও হুক সাজিয়ে নেবে।",
                descEn:
                  "Add your product image, regular vs offer price, and key highlights—Sellora AI builds the full campaign.",
              },
              {
                icon: Download,
                step: "০৩",
                titleBn: "HD পোস্টার ডাউনলোড ও বুস্ট করুন",
                titleEn: "Download HD PNG & Start Selling",
                descBn:
                  "পছন্দের টেমপ্লেট বেছে ১০৮০×১০৮০ PNG ডাউনলোড করুন এবং রেডি ক্যাপশন পেস্ট করে সাথে সাথে পোস্ট করুন!",
                descEn:
                  "Switch between 4 commercial templates, export crisp 1080px PNGs, copy the ad script, and close orders faster.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-3xl border border-slate-200 bg-slate-50/70 p-7"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl font-extrabold text-rose-600/20">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {lang === "bn" ? item.titleBn : item.titleEn}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {lang === "bn" ? item.descBn : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Launch Access OR Transparent BDT Pricing Section */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {freeLaunchMode ? (
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-xl sm:p-12">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-300">
                  🎉 {lang === "bn" ? "লঞ্চ অফার: ১০০% ফ্রি আর্লি অ্যাক্সেস" : "Launch Offer: 100% Free Early Access"}
                </span>
                <h2 className="mt-3 text-2xl font-extrabold sm:text-4xl">
                  {lang === "bn"
                    ? "এখন সম্পূর্ণ ফ্রিতে আনলিমিটেড পোস্টার ও অ্যাড কপি তৈরি করুন!"
                    : "Create Unlimited Posters & Ad Copies — 100% Free Right Now!"}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {lang === "bn"
                    ? "প্রাথমিক উদ্যোক্তাদের জন্য আমাদের সবগুলো প্রিমিয়াম ফিচার এখন সম্পূর্ণ উন্মুক্ত রাখা হয়েছে—কোনো পেমেন্ট বা ক্রেডিট কার্ড ছাড়াই সাথে সাথে ব্যবহার করুন।"
                    : "During our early launch period, all 4 HD poster templates, Bangla/Banglish ad copies, and Inbox Closer tools are unlocked for free."}
                </p>

                <button
                  type="button"
                  onClick={onStartFree}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition hover:bg-rose-500"
                >
                  <Zap className="h-4 w-4" />
                  <span>
                    {lang === "bn"
                      ? "এখনই ফ্রিতে স্টুডিও চালু করুন →"
                      : "Open Free Studio Now →"}
                  </span>
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-5">
                <h3 className="text-sm font-bold text-white">
                  {lang === "bn"
                    ? "VIP আর্লি মেম্বার লিস্টে যুক্ত থাকুন"
                    : "Join VIP Early-Supporter List"}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {lang === "bn"
                    ? "ভবিষ্যতে নতুন প্রো ফিচার এলে সবার আগে আপডেট ও বিশেষ ছাড় পেতে আপনার WhatsApp/Email দিন:"
                    : "Get notified first with lifetime founder perks when future Pro features launch:"}
                </p>

                {wlDone ? (
                  <div className="mt-4 rounded-xl bg-emerald-500/20 p-3 text-xs font-bold text-emerald-300">
                    ✓ {lang === "bn" ? "ধন্যবাদ! আপনার নাম VIP তালিকায় যুক্ত হয়েছে।" : "Added to VIP Early-Supporter list!"}
                  </div>
                ) : (
                  <form onSubmit={handleWaitlist} className="mt-4 space-y-2.5">
                    <input
                      type="text"
                      value={wlShop}
                      onChange={(e) => setWlShop(e.target.value)}
                      placeholder={lang === "bn" ? "আপনার Facebook Page-এর নাম" : "Your Facebook Page Name"}
                      className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-400 focus:border-rose-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={wlContact}
                      onChange={(e) => setWlContact(e.target.value)}
                      placeholder={lang === "bn" ? "WhatsApp নম্বর অথবা Email *" : "WhatsApp Number or Email *"}
                      className="w-full rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-400 focus:border-rose-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-rose-100"
                    >
                      {lang === "bn" ? "VIP লিস্টে যুক্ত হোন" : "Join VIP List"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ) : (
        <>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-wider text-rose-600 uppercase">
            {lang === "bn" ? "সহজ দেশি প্রাইসিং" : "Simple BDT Pricing"}
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-4xl">
            {lang === "bn"
              ? "একজন ডিজাইনারের ১ দিনের খরচে — পুরো মাসের মার্কেটিং স্টুডিও"
              : "Full-Month AI Marketing Studio at a Fraction of One Designer Fee"}
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            {lang === "bn"
              ? "bKash, Nagad এবং Rocket দিয়ে ১০ সেকেন্ডে তাৎক্ষণিক অ্যাক্টিভেশন"
              : "Instant activation in seconds with bKash, Nagad, and Rocket"}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              tier: "free" as PlanTier,
              nameBn: "ফ্রি ট্রায়াল",
              nameEn: "Free Trial",
              priceBn: "৳০",
              priceEn: "৳0",
              subBn: "এককালীন ফ্রি টেস্ট",
              subEn: "One-time starter pack",
              creditsBn: "৫টি পূর্ণাঙ্গ ক্যাম্পেইন",
              creditsEn: "5 Full AI Campaigns",
              featuresBn: [
                "সব ৪টি HD পোস্টার টেমপ্লেট",
                "বাংলা ও বাংলিশ অ্যাড কপি",
                "ইনবক্স ক্লোজার স্ক্রিপ্ট",
              ],
              featuresEn: [
                "All 4 HD Poster Templates",
                "Bangla & Banglish Ad Copies",
                "Inbox Closer Replies",
              ],
              popular: false,
            },
            {
              tier: "starter" as PlanTier,
              nameBn: "স্টার্টার প্যাক",
              nameEn: "Starter Plan",
              priceBn: "৳৪৯৯",
              priceEn: "৳499",
              subBn: "প্রতি মাস",
              subEn: "per month",
              creditsBn: "৬০টি ক্যাম্পেইন ক্রেডিট",
              creditsEn: "60 Campaign Credits / mo",
              featuresBn: [
                "১টি শপ Brand Kit ও লোগো",
                "১০৮০×১০৮০ ও ৪:৫ অ্যাড সাইজ",
                "আনলিমিটেড ইনবক্স রিপ্লাই জেনারেটর",
              ],
              featuresEn: [
                "1 Custom Shop Brand Kit",
                "1:1 Square & 4:5 Ad Sizes",
                "Unlimited Smart Reply Generator",
              ],
              popular: false,
            },
            {
              tier: "pro" as PlanTier,
              nameBn: "প্রো বিজনেস",
              nameEn: "Pro Business",
              priceBn: "৳৯৯৯",
              priceEn: "৳999",
              subBn: "প্রতি মাস",
              subEn: "per month",
              creditsBn: "২০০টি ক্যাম্পেইন ক্রেডিট",
              creditsEn: "200 Campaign Credits / mo",
              featuresBn: [
                "ওয়েবসাইট অটো-ব্র্যান্ড এক্সট্রাক্টর",
                "প্রায়োরিটি ক্লাউড AI কপিরাইটার",
                "সম্পূর্ণ ক্যাম্পেইন আর্কাইভ সেভ",
              ],
              featuresEn: [
                "Website Auto Brand Extractor",
                "Priority Cloud AI Copywriter",
                "Full Campaign History Library",
              ],
              popular: true,
            },
            {
              tier: "agency" as PlanTier,
              nameBn: "এজেন্সি প্যাক",
              nameEn: "Agency Pack",
              priceBn: "৳২,৪৯৯",
              priceEn: "৳2,499",
              subBn: "প্রতি মাস",
              subEn: "per month",
              creditsBn: "৬০০টি ক্যাম্পেইন ক্রেডিট",
              creditsEn: "600 Campaign Credits / mo",
              featuresBn: [
                "মাল্টিপল ক্লায়েন্ট পেজ ম্যানেজমেন্ট",
                "হাই-ভলিউম বুস্ট এজেন্সি সাপোর্ট",
                "ডেডিকেটেড WhatsApp সাপোর্ট",
              ],
              featuresEn: [
                "Multi-Client Page Management",
                "High-Volume Ad Agency Workflow",
                "Dedicated Priority Support",
              ],
              popular: false,
            },
          ].map((card) => (
            <div
              key={card.tier}
              className={`relative flex flex-col justify-between rounded-3xl border p-6 transition ${
                card.popular
                  ? "border-rose-600 bg-slate-900 text-white shadow-xl shadow-rose-950/15"
                  : "border-slate-200 bg-white text-slate-900 shadow-xs"
              }`}
            >
              {card.popular && (
                <span className="absolute -top-3.5 left-6 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white">
                  {lang === "bn" ? "সবচেয়ে জনপ্রিয়" : "Most Popular"}
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold">
                  {lang === "bn" ? card.nameBn : card.nameEn}
                </h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold">
                    {lang === "bn" ? card.priceBn : card.priceEn}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      card.popular ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    / {lang === "bn" ? card.subBn : card.subEn}
                  </span>
                </div>

                <div
                  className={`mt-4 rounded-xl px-3 py-2 text-xs font-bold ${
                    card.popular
                      ? "bg-white/10 text-rose-300"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  ✦ {lang === "bn" ? card.creditsBn : card.creditsEn}
                </div>

                <ul className="mt-5 space-y-2.5 text-sm">
                  {(lang === "bn" ? card.featuresBn : card.featuresEn).map(
                    (f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            card.popular ? "text-rose-400" : "text-emerald-600"
                          }`}
                        />
                        <span
                          className={
                            card.popular ? "text-slate-200" : "text-slate-600"
                          }
                        >
                          {f}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <button
                type="button"
                onClick={() =>
                  card.tier === "free"
                    ? onStartFree()
                    : onSelectPaidPlan(card.tier)
                }
                className={`mt-7 w-full rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  card.popular
                    ? "bg-rose-600 text-white hover:bg-rose-500"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {card.tier === "free"
                  ? lang === "bn"
                    ? "ফ্রি একাউন্ট খুলুন"
                    : "Start Free Trial"
                  : lang === "bn"
                  ? "bKash / Nagad দিয়ে নিন"
                  : "Subscribe with bKash/Nagad"}
              </button>
            </div>
          ))}
        </div>
        </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-950 py-10 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <BrandLogo darkBg lang={lang} />
          <div className="flex flex-col items-center gap-1.5 text-center sm:items-end sm:text-right">
            <p className="text-xs text-slate-400">
              © 2026 Sellora AI •{" "}
              {lang === "bn"
                ? "বাংলাদেশের উদ্যোক্তাদের জন্য তৈরি AI SaaS প্ল্যাটফর্ম"
                : "Built for High-Growth F-Commerce Sellers"}
            </p>
            <p className="text-xs font-medium text-slate-300">
              {lang === "bn" ? "তৈরি করেছেন " : "Created by "}
              <span className="font-bold text-white">Md Mobarak Hossain</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
