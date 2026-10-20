"use client";

import React, { useEffect, useState } from "react";
import { BrandKit, Language } from "@/lib/types";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  UserPlus,
  Wand2,
  X,
  Zap,
} from "lucide-react";

export type AuthModalTab = "signup" | "login";

interface OnboardingModalProps {
  open: boolean;
  initialTab?: AuthModalTab;
  lang: Language;
  freeLaunchMode?: boolean;
  initialBrand: BrandKit;
  onClose: () => void;
  onSignup: (payload: {
    name: string;
    identifier: string;
    password: string;
    brandKit: BrandKit;
  }) => Promise<string | null>;
  onLogin: (payload: {
    identifier: string;
    password: string;
  }) => Promise<string | null>;
  onContinueAsGuest: () => void;
}

const BLANK_BRAND: BrandKit = {
  shopName: "",
  category: "general",
  tagline: "",
  primaryColor: "#e11d48",
  accentColor: "#f59e0b",
  phoneWhatsapp: "",
  pageUrl: "",
  deliveryInsideDhaka: 70,
  deliveryOutsideDhaka: 130,
  paymentPolicy: "পণ্য হাতে পেয়ে দেখে পেমেন্ট — সারা দেশে হোম ডেলিভারি",
  logoDataUrl: "",
};

export function OnboardingModal({
  open,
  initialTab = "signup",
  lang,
  initialBrand,
  onClose,
  onSignup,
  onLogin,
  onContinueAsGuest,
}: OnboardingModalProps) {
  const [tab, setTab] = useState<AuthModalTab>(initialTab);
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [brand, setBrand] = useState<BrandKit>({
    ...BLANK_BRAND,
    ...(initialBrand?.shopName ? initialBrand : {}),
  });

  const [extractSource, setExtractSource] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractedDone, setExtractedDone] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTab(initialTab);
    setErrorMsg(null);
  }, [initialTab, open]);

  if (!open) return null;

  const handleExtract = async () => {
    if (!extractSource.trim()) return;
    setExtracting(true);
    setExtractedDone(false);
    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "extract", source: extractSource }),
      });
      const json = await res.json();
      if (json.ok && json.extracted) {
        setBrand((prev) => ({ ...prev, ...json.extracted }));
        setExtractedDone(true);
      }
    } finally {
      setExtracting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const err = await onSignup({
        name,
        identifier,
        password,
        brandKit: brand,
      });
      if (err) setErrorMsg(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const err = await onLogin({ identifier, password });
      if (err) setErrorMsg(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs">
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl md:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Switcher Tabs: Sign Up vs Login */}
        <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100 p-1.5 pr-10">
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setErrorMsg(null);
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition sm:text-sm ${
              tab === "signup"
                ? "bg-white text-rose-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>{lang === "bn" ? "নতুন অ্যাকাউন্ট খুলুন" : "Create Account"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMsg(null);
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition sm:text-sm ${
              tab === "login"
                ? "bg-white text-rose-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LogIn className="h-4 w-4" />
            <span>{lang === "bn" ? "লগইন করুন" : "Log In"}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
            ⚠️ {errorMsg}
          </div>
        )}

        {tab === "signup" ? (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                {lang === "bn"
                  ? "আপনার নিজস্ব ফ্রি অ্যাকাউন্ট ও দোকান সেটআপ করুন"
                  : "Create Your Personal Account & Shop Workspace"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {lang === "bn"
                  ? "আপনার দোকানের তথ্য ও তৈরি করা পোস্টার আপনার নিজস্ব অ্যাকাউন্টে সুরক্ষিত থাকবে।"
                  : "Your shop branding and generated posters stay saved in your private workspace."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  {lang === "bn" ? "আপনার নাম *" : "Your Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === "bn" ? "যেমন: মো. করিম উদ্দিন" : "e.g. Rahim Uddin"}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  {lang === "bn"
                    ? "মোবাইল নম্বর অথবা ইমেইল *"
                    : "Mobile Number or Email *"}
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    lang === "bn"
                      ? "যেমন: 017XXXXXXXX বা email"
                      : "e.g. 017XXXXXXXX or email"
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                {lang === "bn"
                  ? "পাসওয়ার্ড দিন (কমপক্ষে ৪ সংখ্যা বা অক্ষর) *"
                  : "Set Password (min 4 characters) *"}
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    lang === "bn"
                      ? "পছন্দমতো গোপন পাসওয়ার্ড লিখুন"
                      : "Create a secret password"
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Shop Setup Section */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3.5">
              <p className="text-xs font-extrabold text-rose-600 uppercase">
                {lang === "bn"
                  ? "আপনার দোকানের তথ্য (পোস্টারে অটো বসবে)"
                  : "Your Shop Info (Auto-applied to Posters)"}
              </p>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {lang === "bn"
                      ? "Facebook Page / দোকানের নাম *"
                      : "Facebook Page / Shop Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={brand.shopName}
                    onChange={(e) =>
                      setBrand({ ...brand, shopName: e.target.value })
                    }
                    placeholder={
                      lang === "bn" ? "যেমন: মদিনা ফ্যাশন হাউস" : "e.g. Madina Fashion"
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {lang === "bn"
                      ? "অর্ডার WhatsApp / ফোন নম্বর *"
                      : "Order WhatsApp / Phone *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={brand.phoneWhatsapp}
                    onChange={(e) =>
                      setBrand({ ...brand, phoneWhatsapp: e.target.value })
                    }
                    placeholder={lang === "bn" ? "যেমন: 01712-345678" : "e.g. 01712-345678"}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    {lang === "bn" ? "ব্র্যান্ড রঙ" : "Color"}
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
                    <input
                      type="color"
                      value={brand.primaryColor}
                      onChange={(e) =>
                        setBrand({ ...brand, primaryColor: e.target.value })
                      }
                      className="h-6 w-8 cursor-pointer border-0 bg-transparent"
                    />
                    <span className="font-mono text-[11px] text-slate-600">
                      {brand.primaryColor}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    {lang === "bn" ? "ঢাকা ডেলিভারি (৳)" : "Inside Dhaka"}
                  </label>
                  <input
                    type="number"
                    value={brand.deliveryInsideDhaka}
                    onChange={(e) =>
                      setBrand({
                        ...brand,
                        deliveryInsideDhaka: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    {lang === "bn" ? "ঢাকার বাইরে (৳)" : "Outside Dhaka"}
                  </label>
                  <input
                    type="number"
                    value={brand.deliveryOutsideDhaka}
                    onChange={(e) =>
                      setBrand({
                        ...brand,
                        deliveryOutsideDhaka: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Optional Website Auto-Extractor */}
              <div className="pt-1">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                    <Wand2 className="h-3.5 w-3.5 text-rose-500" />
                    {lang === "bn"
                      ? "ঐচ্ছিক: ওয়েবসাইট লিংক থাকলে অটো-ফিল করুন"
                      : "Optional: Auto-fill from Website URL"}
                  </span>
                  {extractedDone && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" /> OK
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex gap-2">
                  <input
                    type="text"
                    value={extractSource}
                    onChange={(e) => setExtractSource(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleExtract}
                    disabled={extracting}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700"
                  >
                    {extracting ? "..." : lang === "bn" ? "অটো-ফিল" : "Extract"}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-rose-600/25 transition hover:bg-rose-700 disabled:opacity-60 sm:text-base"
            >
              <Sparkles className="h-5 w-5" />
              <span>
                {submitting
                  ? lang === "bn"
                    ? "অ্যাকাউন্ট তৈরি হচ্ছে..."
                    : "Creating Account..."
                  : lang === "bn"
                  ? "ফ্রি অ্যাকাউন্ট খুলে স্টুডিওতে ঢুকুন →"
                  : "Create Free Account & Enter Studio →"}
              </span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                {lang === "bn"
                  ? "আপনার অ্যাকাউন্টে লগইন করুন"
                  : "Log In to Your Shop Account"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {lang === "bn"
                  ? "যে মোবাইল নম্বর বা ইমেইল দিয়ে অ্যাকাউন্ট খুলেছিলেন সেটি দিন।"
                  : "Enter the mobile number or email and password you registered with."}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                {lang === "bn"
                  ? "মোবাইল নম্বর অথবা ইমেইল *"
                  : "Mobile Number or Email *"}
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={lang === "bn" ? "017XXXXXXXX বা ইমেইল" : "017XXXXXXXX or email"}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                {lang === "bn" ? "পাসওয়ার্ড *" : "Password *"}
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-11 text-sm text-slate-900 focus:border-rose-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-3.5 text-base font-extrabold text-white shadow-lg shadow-rose-600/25 transition hover:bg-rose-700 disabled:opacity-60"
            >
              <LogIn className="h-5 w-5" />
              <span>
                {submitting
                  ? lang === "bn"
                    ? "লগইন হচ্ছে..."
                    : "Signing In..."
                  : lang === "bn"
                  ? "লগইন করুন →"
                  : "Sign In →"}
              </span>
            </button>
          </form>
        )}

        {/* Instant Free Guest Mode Divider */}
        <div className="mt-5 border-t border-slate-200 pt-4 text-center">
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-5 py-3 text-xs font-extrabold text-slate-800 transition hover:bg-slate-100 sm:text-sm"
          >
            <Zap className="h-4 w-4 text-amber-500" />
            <span>
              {lang === "bn"
                ? "অ্যাকাউন্ট না খুলেই সরাসরি ফ্রি গেস্ট মোডে ব্যবহার করুন →"
                : "Skip Login — Start Instant Free Guest Studio →"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
