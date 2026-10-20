"use client";

import React, { useEffect, useRef, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { PosterCanvas, PosterCanvasHandle } from "./PosterCanvas";
import { InstallAppButton } from "./InstallAppButton";
import { InvoiceGenerator } from "./InvoiceGenerator";
import { ProfitCalculator } from "./ProfitCalculator";
import {
  BrandKit,
  Campaign,
  Language,
  PaymentRecord,
  PLAN_CATALOG,
  PlanTier,
  PosterAspect,
  PosterTemplateId,
  RegisteredUserSummary,
  UserProfile,
  WaitlistLead,
} from "@/lib/types";
import {
  ArrowLeft,
  Calculator,
  Check,
  Clapperboard,
  Copy,
  CreditCard,
  Download,
  FolderClock,
  ImagePlus,
  LayoutTemplate,
  Lock,
  LogIn,
  LogOut,
  Menu,
  MessageSquareMore,
  QrCode,
  ReceiptText,
  RotateCcw,
  Send,
  Settings2,
  Sparkles,
  Store,
  Trash2,
  Users,
  Wand2,
  X,
  Zap,
} from "lucide-react";

type TabId =
  | "studio"
  | "invoice"
  | "calculator"
  | "inbox"
  | "brand"
  | "history"
  | "billing"
  | "founder";

interface DashboardAppProps {
  lang: Language;
  freeLaunchMode: boolean;
  onToggleLang: (next: Language) => void;
  user: UserProfile;
  brandKit: BrandKit;
  campaigns: Campaign[];
  payments: PaymentRecord[];
  waitlist: WaitlistLead[];
  hasLiveAiKey: boolean;
  settingsPreview: {
    hasOpenRouter: boolean;
    hasOpenAi: boolean;
    hasSupabase?: boolean;
    aiModel: string;
    paymentApprovalMode?: "auto" | "manual";
    merchantBkash?: string;
    merchantNagad?: string;
    hasUddoktaPay: boolean;
    uddoktaPayBaseUrl: string;
  };
  onBackToLanding: () => void;
  onOpenAuthModal: (tab: "signup" | "login") => void;
  onLogout: () => void;
  onOpenPayment: (plan: PlanTier) => void;
  onRefreshState: () => Promise<void>;
  onCampaignGenerated: (campaign: Campaign, updatedCredits?: number) => void;
  onBrandUpdated: (kit: BrandKit) => void;
  onCampaignsUpdated: (list: Campaign[]) => void;
}

const SAMPLE_PRODUCTS = [
  {
    labelBn: "জামদানি থ্রি-পিস",
    labelEn: "Jamdani 3-Piece",
    productName: "রয়েল মেরুন জামদানি এমব্রয়ডারি থ্রি-পিস",
    regularPrice: 2450,
    offerPrice: 1750,
    features:
      "১০০% সুতি কাপড়, নিখুঁত জরি ও সুতার কাজ, রঙ ১০০% গ্যারান্টি, প্রশস্ত ওড়না",
    productImageUrl: "/samples/kurti.png",
  },
  {
    labelBn: "খাঁটি মধু",
    labelEn: "Organic Honey",
    productName: "খাঁটি সুন্দরবনের প্রাকৃতিক চাকের মধু (১ কেজি)",
    regularPrice: 1650,
    offerPrice: 1290,
    features:
      "১০০% কেমিক্যালমুক্ত খাঁটি মধু, ল্যাব টেস্টেড, সারা দেশে ক্যাশ অন ডেলিভারি",
    productImageUrl: "/samples/honey.png",
  },
  {
    labelBn: "স্মার্টওয়াচ প্রো",
    labelEn: "Smartwatch Pro",
    productName: "টাইটানিয়াম অ্যামোলেড ব্লুটুথ কলিং স্মার্টওয়াচ",
    regularPrice: 3200,
    offerPrice: 2190,
    features:
      "ব্লুটুথ কলিং সুবিধা, ৭ দিন ব্যাটারি ব্যাকআপ, ওয়াটার রেজিস্ট্যান্ট ও ৬ মাসের ওয়ারেন্টি",
    productImageUrl: "/samples/watch.png",
  },
];

const SUPABASE_SQL_SNIPPET = `-- Run inside Supabase SQL Editor (Production Cloud Setup)
create table if not exists public.app_kv_store (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz default now()
);`;

export function DashboardApp({
  lang,
  freeLaunchMode,
  onToggleLang,
  user,
  brandKit,
  campaigns,
  payments,
  waitlist,
  hasLiveAiKey,
  settingsPreview,
  onBackToLanding,
  onOpenAuthModal,
  onLogout,
  onOpenPayment,
  onRefreshState,
  onCampaignGenerated,
  onBrandUpdated,
  onCampaignsUpdated,
}: DashboardAppProps) {
  const [activeTab, setActiveTab] = useState<TabId>("studio");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active campaign & clean blank form state
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(
    campaigns[0] || null
  );
  const [productName, setProductName] = useState<string>(
    campaigns[0]?.productName || ""
  );
  const [regularPriceInput, setRegularPriceInput] = useState<string>(
    campaigns[0]?.regularPrice ? String(campaigns[0].regularPrice) : ""
  );
  const [offerPriceInput, setOfferPriceInput] = useState<string>(
    campaigns[0]?.offerPrice ? String(campaigns[0].offerPrice) : ""
  );
  const [features, setFeatures] = useState<string>(campaigns[0]?.features || "");
  const [copyStyle, setCopyStyle] = useState<"bn" | "banglish" | "en">("bn");
  const [productImageUrl, setProductImageUrl] = useState<string>(
    campaigns[0]?.posterConfig.productImageUrl || ""
  );
  const [templateId, setTemplateId] = useState<PosterTemplateId>(
    campaigns[0]?.posterConfig.templateId || "magenta_luxe"
  );
  const [aspect, setAspect] = useState<PosterAspect>(
    campaigns[0]?.posterConfig.aspect || "square"
  );
  const [customBadge, setCustomBadge] = useState<string>(
    campaigns[0]?.posterConfig.badgeText || ""
  );
  const [customHeadline, setCustomHeadline] = useState<string>(
    campaigns[0]?.posterConfig.headline || ""
  );
  const [fbFeedPreview, setFbFeedPreview] = useState(false);
  const [showQrOnPoster, setShowQrOnPoster] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync draftBrand when user logs in / switches account
  const [draftBrand, setDraftBrand] = useState<BrandKit>(brandKit);
  useEffect(() => {
    setDraftBrand(brandKit);
  }, [brandKit]);

  useEffect(() => {
    if (campaigns[0]) {
      setActiveCampaign(campaigns[0]);
    } else {
      setActiveCampaign(null);
      setProductName("");
      setRegularPriceInput("");
      setOfferPriceInput("");
      setFeatures("");
      setProductImageUrl("");
      setCustomBadge("");
      setCustomHeadline("");
    }
  }, [user.id, campaigns]);

  // Inbox smart reply tester state
  const [customerMsg, setCustomerMsg] = useState("");
  const [smartReply, setSmartReply] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);

  // Brand extractor state
  const [extractInput, setExtractInput] = useState("");
  const [extractingBrand, setExtractingBrand] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);
  const [brandSavedToast, setBrandSavedToast] = useState(false);

  // Secret Founder Admin PIN state (Hidden from ordinary users!)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPinModalOpen, setAdminPinModalOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [verifiedAdminPin, setVerifiedAdminPin] = useState("");
  const [adminPinError, setAdminPinError] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserSummary[]>([]);

  // Founder API Settings & Simulator state
  const [newAdminPin, setNewAdminPin] = useState("");
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [uddoktaKey, setUddoktaKey] = useState("");
  const [merchantBkash, setMerchantBkash] = useState(
    settingsPreview.merchantBkash || "01700-889911"
  );
  const [merchantNagad, setMerchantNagad] = useState(
    settingsPreview.merchantNagad || "01800-889922"
  );
  const [approvalMode, setApprovalMode] = useState<"auto" | "manual">(
    settingsPreview.paymentApprovalMode || "auto"
  );
  const [simStarterUsers, setSimStarterUsers] = useState(60);
  const [simProUsers, setSimProUsers] = useState(45);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  const posterRef = useRef<PosterCanvasHandle | null>(null);

  const regularPriceNum = Number(regularPriceInput) || 0;
  const offerPriceNum = Number(offerPriceInput) || 0;

  // Auto-calculate live discount badge whenever user types regular/offer prices
  const computedDiscountPct =
    regularPriceNum > offerPriceNum && offerPriceNum > 0
      ? Math.round(((regularPriceNum - offerPriceNum) / regularPriceNum) * 100)
      : 0;

  const effectiveBadge =
    customBadge.trim() ||
    (computedDiscountPct > 0
      ? lang === "bn"
        ? `${computedDiscountPct}% বিশেষ ছাড়`
        : `FLAT ${computedDiscountPct}% OFF`
      : lang === "bn"
      ? "বিশেষ অফার চলছে"
      : "SPECIAL OFFER");

  const effectiveHeadline =
    customHeadline.trim() ||
    productName.trim() ||
    (lang === "bn"
      ? "আপনার পণ্যের নাম এখানে দেখাবে"
      : "Your Product Title Appears Here");

  const effectiveFeaturesList = features
    .split(/[,।\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const displayBrandForPoster: BrandKit = {
    ...brandKit,
    shopName:
      brandKit.shopName?.trim() ||
      (lang === "bn" ? "আপনার দোকানের নাম" : "Your Shop Name"),
    tagline:
      brandKit.tagline?.trim() ||
      (lang === "bn" ? "বিশ্বস্ত অনলাইন শপ" : "Trusted Online Store"),
    phoneWhatsapp:
      brandKit.phoneWhatsapp?.trim() ||
      (lang === "bn" ? "01XXXXXXXXX" : "01XXXXXXXXX"),
  };

  const resetFormBlank = () => {
    setProductName("");
    setRegularPriceInput("");
    setOfferPriceInput("");
    setFeatures("");
    setProductImageUrl("");
    setCustomBadge("");
    setCustomHeadline("");
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleProductPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProductImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQuickLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const nextKit = { ...brandKit, logoDataUrl: reader.result };
        setDraftBrand(nextKit);
        onBrandUpdated(nextKit);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInlineShopChange = (field: keyof BrandKit, val: string) => {
    const nextKit = { ...brandKit, [field]: val };
    setDraftBrand(nextKit);
    onBrandUpdated(nextKit);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeLaunchMode && user.credits <= 0) {
      onOpenPayment("starter");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userCredits: user.credits,
          brandKit: displayBrandForPoster,
          productName,
          regularPrice: regularPriceNum || offerPriceNum,
          offerPrice: offerPriceNum || regularPriceNum,
          features,
          copyStyle,
          productImageUrl,
          templateId,
          aspect,
        }),
      });
      const json = await res.json();
      if (res.status === 402 || json.code === "INSUFFICIENT_CREDITS") {
        onOpenPayment("starter");
        return;
      }
      if (json.ok && json.campaign) {
        const enrichedCampaign: Campaign = {
          ...json.campaign,
          posterConfig: {
            ...json.campaign.posterConfig,
            productImageUrl: productImageUrl || "",
          },
        };
        setActiveCampaign(enrichedCampaign);
        setCustomBadge(enrichedCampaign.posterConfig.badgeText);
        setCustomHeadline(enrichedCampaign.posterConfig.headline);
        onCampaignGenerated(enrichedCampaign, json.user?.credits);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSmartReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerMsg.trim()) return;
    setLoadingReply(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "smart_reply",
          brandKit: displayBrandForPoster,
          targetCampaign: activeCampaign,
          productName: productName || activeCampaign?.productName || "আমাদের পণ্য",
          regularPrice: regularPriceNum || activeCampaign?.regularPrice || 1500,
          offerPrice: offerPriceNum || activeCampaign?.offerPrice || 1200,
          features,
          customerMessage: customerMsg,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setSmartReply(json.reply);
      }
    } finally {
      setLoadingReply(false);
    }
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBrand(true);
    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, brandKit: draftBrand }),
      });
      const json = await res.json();
      if (json.ok) {
        onBrandUpdated(json.brandKit);
        setBrandSavedToast(true);
        setTimeout(() => setBrandSavedToast(false), 2000);
      }
    } finally {
      setSavingBrand(false);
    }
  };

  const handleExtractBrand = async () => {
    if (!extractInput.trim()) return;
    setExtractingBrand(true);
    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "extract", source: extractInput }),
      });
      const json = await res.json();
      if (json.ok && json.extracted) {
        setDraftBrand((prev) => ({ ...prev, ...json.extracted }));
      }
    } finally {
      setExtractingBrand(false);
    }
  };

  const handleDeleteCampaign = (id: string) => {
    const updated = campaigns.filter((c) => c.id !== id);
    onCampaignsUpdated(updated);
    if (activeCampaign?.id === id) {
      setActiveCampaign(updated[0] || null);
    }
  };

  const handleVerifyAdminPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPinError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify_admin", pin: adminPinInput }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setAdminPinError(json.error || "ভুল পিন!");
      return;
    }
    setVerifiedAdminPin(adminPinInput.trim());
    setRegisteredUsers(json.usersSummary || []);
    setIsAdminUnlocked(true);
    setAdminPinModalOpen(false);
    setAdminPinInput("");
    setActiveTab("founder");
    setMobileMenuOpen(false);
  };

  const handleSaveFounderSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPin: verifiedAdminPin,
          ...(newAdminPin.trim().length >= 4
            ? { newAdminPin: newAdminPin.trim() }
            : {}),
          ...(openRouterKey ? { openRouterApiKey: openRouterKey } : {}),
          ...(openAiKey ? { openAiApiKey: openAiKey } : {}),
          ...(supabaseUrl ? { supabaseUrl } : {}),
          ...(supabaseKey ? { supabaseKey } : {}),
          ...(uddoktaKey ? { uddoktaPayApiKey: uddoktaKey } : {}),
          paymentApprovalMode: approvalMode,
          merchantBkash,
          merchantNagad,
        }),
      });
      const json = await res.json();
      if (json.ok && json.activeAdminPin) {
        setVerifiedAdminPin(json.activeAdminPin);
      }
      setNewAdminPin("");
      setOpenRouterKey("");
      setOpenAiKey("");
      setSupabaseUrl("");
      setSupabaseKey("");
      setUddoktaKey("");
      await onRefreshState();
      setSettingsSavedToast(true);
      setTimeout(() => setSettingsSavedToast(false), 2200);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleReviewPayment = async (
    paymentId: string,
    decision: "approve" | "reject"
  ) => {
    await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "review_payment", paymentId, decision }),
    });
    await onRefreshState();
  };

  const livePosterConfig = {
    templateId,
    aspect,
    badgeText: effectiveBadge,
    headline: effectiveHeadline,
    subline:
      activeCampaign?.posterConfig?.subline ||
      (lang === "bn"
        ? "আজ অর্ডারে বিশেষ ছাড় • সীমিত স্টক!"
        : "Limited Stock Offer • Order Now!"),
    highlights:
      effectiveFeaturesList.length > 0
        ? effectiveFeaturesList
        : activeCampaign?.posterConfig?.highlights?.length
        ? activeCampaign.posterConfig.highlights
        : lang === "bn"
        ? ["১০০% প্রিমিয়াম কোয়ালিটি", "হাতে পেয়ে পেমেন্ট"]
        : ["100% Premium Quality", "Cash on Delivery"],
    ctaText:
      copyStyle === "en"
        ? `Order Now: ${displayBrandForPoster.phoneWhatsapp}`
        : `অর্ডার করুন: ${displayBrandForPoster.phoneWhatsapp}`,
    productImageUrl,
    showQr: showQrOnPoster,
  };

  const NAV_ITEMS: Array<{
    id: TabId;
    labelBn: string;
    labelEn: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    {
      id: "studio",
      labelBn: "AI পোস্টার ও অ্যাড স্টুডিও",
      labelEn: "AI Poster & Ad Studio",
      icon: LayoutTemplate,
    },
    {
      id: "invoice",
      labelBn: "ডিজিটাল ক্যাশ মেমো",
      labelEn: "Cash Memo & Slip",
      icon: ReceiptText,
      badge: "NEW",
    },
    {
      id: "inbox",
      labelBn: "ইনবক্স ও কমেন্ট ক্লোজার",
      labelEn: "Inbox & Comment Closer",
      icon: MessageSquareMore,
    },
    {
      id: "calculator",
      labelBn: "লাভ ও বুস্ট ক্যালকুলেটর",
      labelEn: "Profit & Boost ROI",
      icon: Calculator,
    },
    {
      id: "brand",
      labelBn: "আমার দোকানের তথ্য",
      labelEn: "My Shop Brand Kit",
      icon: Store,
    },
    {
      id: "history",
      labelBn: "আমার সেভ করা পোস্টার",
      labelEn: "My Saved Campaigns",
      icon: FolderClock,
      badge: String(campaigns.length),
    },
    ...(!freeLaunchMode
      ? [
          {
            id: "billing" as TabId,
            labelBn: "প্ল্যান ও bKash পেমেন্ট",
            labelEn: "Plans & bKash Billing",
            icon: CreditCard,
          },
        ]
      : []),
    ...(isAdminUnlocked
      ? [
          {
            id: "founder" as TabId,
            labelBn: "ফাউন্ডার অ্যাডমিন প্যানেল",
            labelEn: "Founder Admin Panel",
            icon: Settings2,
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Deep Slate Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-68 flex-col justify-between bg-slate-950 text-white transition-transform lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5">
          <div className="flex items-center justify-between">
            <BrandLogo darkBg lang={lang} />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 lg:hidden"
            >
              ✕
            </button>
          </div>

          {/* Active User & Shop Pill */}
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-3.5">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: brandKit.primaryColor || "#e11d48" }}
              >
                {brandKit.logoDataUrl ? (
                  <img
                    src={brandKit.logoDataUrl}
                    alt="Shop"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (brandKit.shopName || user.name || "S").trim().charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">
                  {brandKit.shopName ||
                    (lang === "bn" ? "নতুন দোকান সেটআপ করুন" : "Set Up Your Shop")}
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {user.isGuest
                    ? lang === "bn"
                      ? "গেস্ট ইউজার • অ্যাকাউন্ট খুলুন"
                      : "Guest Mode • Save Account"
                    : user.name}
                </p>
              </div>
            </div>

            {user.isGuest ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal("signup");
                }}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-500"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>
                  {lang === "bn"
                    ? "অ্যাকাউন্ট খুলুন / লগইন"
                    : "Sign Up / Log In"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{lang === "bn" ? "লগআউট করুন" : "Log Out"}</span>
              </button>
            )}
          </div>

          <div className="mt-3 sm:hidden">
            <InstallAppButton lang={lang} />
          </div>

          <nav className="mt-5 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition ${
                    active
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{lang === "bn" ? item.labelBn : item.labelEn}</span>
                  </span>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status Box + Discrete Founder Admin Lock */}
        <div className="border-t border-white/10 p-5">
          {freeLaunchMode ? (
            <div className="rounded-2xl bg-gradient-to-br from-emerald-950/80 to-slate-900 p-4 ring-1 ring-emerald-500/30">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                🎉 {lang === "bn" ? "ফ্রি আর্লি অ্যাক্সেস চালু" : "100% Free Mode"}
              </span>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                {lang === "bn"
                  ? "এখন আনলিমিটেড পোস্টার ও অ্যাড কপি সম্পূর্ণ ফ্রিতে তৈরি করুন!"
                  : "Unlimited posters & ad copies unlocked completely free!"}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-rose-950/60 p-4 ring-1 ring-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  {lang === "bn" ? "অবশিষ্ট ক্রেডিট" : "Credits Left"}
                </span>
                <span className="rounded-md bg-rose-500/20 px-2 py-0.5 font-bold text-rose-300 uppercase">
                  {user.plan}
                </span>
              </div>
              <p className="mt-1.5 text-2xl font-extrabold text-white">
                {user.credits}{" "}
                <span className="text-xs font-normal text-slate-400">
                  {lang === "bn" ? "ক্যাম্পেইন" : "campaigns"}
                </span>
              </p>
              <button
                type="button"
                onClick={() => onOpenPayment("pro")}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-500"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>
                  {lang === "bn"
                    ? "bKash / Nagad টপ-আপ"
                    : "Top Up via bKash / Nagad"}
                </span>
              </button>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Created by{" "}
              <strong className="font-semibold text-slate-300">
                Md Mobarak Hossain
              </strong>
            </span>
            <button
              type="button"
              onClick={() => {
                if (isAdminUnlocked) {
                  setActiveTab("founder");
                  setMobileMenuOpen(false);
                } else {
                  setAdminPinModalOpen(true);
                }
              }}
              title="Founder Admin Access"
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-slate-500 transition hover:bg-white/10 hover:text-slate-300"
            >
              <Lock className="h-3 w-3" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Workspace Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="rounded-xl border border-slate-200 p-2 text-slate-700 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{lang === "bn" ? "হোম পেজ" : "Home"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <InstallAppButton lang={lang} compact />
            </div>

            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => onToggleLang("bn")}
                className={`rounded-lg px-2.5 py-1 transition ${
                  lang === "bn"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500"
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => onToggleLang("en")}
                className={`rounded-lg px-2.5 py-1 transition ${
                  lang === "en"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500"
                }`}
              >
                EN
              </button>
            </div>

            {user.isGuest ? (
              <button
                type="button"
                onClick={() => onOpenAuthModal("signup")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>
                  {lang === "bn" ? "অ্যাকাউন্ট খুলুন" : "Save Account"}
                </span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <span>👤 {user.name.split(" ")[0]}</span>
              </span>
            )}
          </div>
        </header>

        {/* Workspace Tab Views */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          {/* TAB 1: AI POSTER & AD STUDIO */}
          {activeTab === "studio" && (
            <div className="grid grid-cols-1 gap-7 xl:grid-cols-12">
              {/* Left Input Form Column */}
              <form
                onSubmit={handleGenerate}
                className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6 xl:col-span-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {lang === "bn"
                        ? "আপনার নিজের পণ্যের পোস্টার ও বিজ্ঞাপন তৈরি করুন"
                        : "Create Your Own Product Poster & Ad Copy"}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {lang === "bn"
                        ? "নিচের ঘরগুলোতে আপনার দোকানের ও পণ্যের তথ্য লিখুন:"
                        : "Fill in your shop and product details below:"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetFormBlank}
                    title="Clear all product fields"
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-100"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{lang === "bn" ? "খালি করুন" : "Clear"}</span>
                  </button>
                </div>

                {/* Inline Step 1: User's Own Shop Info Bar right inside Studio! */}
                <div className="rounded-2xl border border-rose-100 bg-rose-50/45 p-3.5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-rose-700">
                      {lang === "bn"
                        ? "১. আপনার দোকানের নাম ও নম্বর"
                        : "1. Your Shop Name & Phone"}
                    </span>
                    <label className="cursor-pointer rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-50">
                      {brandKit.logoDataUrl
                        ? lang === "bn"
                          ? "✓ লোগো যুক্ত"
                          : "✓ Logo Added"
                        : lang === "bn"
                        ? "+ লোগো দিন"
                        : "+ Shop Logo"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQuickLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <input
                      type="text"
                      required
                      value={brandKit.shopName}
                      onChange={(e) =>
                        handleInlineShopChange("shopName", e.target.value)
                      }
                      placeholder={
                        lang === "bn"
                          ? "দোকান / পেজের নাম লিখুন *"
                          : "Your Shop / Page Name *"
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-rose-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={brandKit.phoneWhatsapp}
                      onChange={(e) =>
                        handleInlineShopChange("phoneWhatsapp", e.target.value)
                      }
                      placeholder={
                        lang === "bn"
                          ? "অর্ডার ফোন / WhatsApp *"
                          : "Order Phone / WhatsApp *"
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Product Photo Uploader */}
                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-slate-800">
                    {lang === "bn"
                      ? "২. আপনার পণ্যের ছবি আপলোড করুন *"
                      : "2. Upload Your Product Photo *"}
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-rose-300 bg-slate-50/70 p-3.5 transition hover:border-rose-500 hover:bg-rose-50/30">
                    {productImageUrl ? (
                      <img
                        src={productImageUrl}
                        alt="Product preview"
                        className="h-14 w-14 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                        <ImagePlus className="h-6 w-6" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-600">
                        {productImageUrl
                          ? lang === "bn"
                            ? "ছবি বদলাতে এখানে ট্যাপ করুন"
                            : "Tap to Change Product Photo"
                          : lang === "bn"
                          ? "গ্যালারি বা ক্যামেরা থেকে পণ্যের ছবি নিন"
                          : "Tap to Upload Photo from Phone / PC"}
                      </span>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        JPG, PNG, WEBP — স্বয়ংক্রিয়ভাবে 1080px HD সাইজ হবে
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {lang === "bn"
                      ? "পণ্যের নাম / শিরোনাম লিখুন *"
                      : "Product Name / Title *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value);
                      setCustomHeadline(e.target.value);
                    }}
                    placeholder={
                      lang === "bn"
                        ? "যেমন: প্রিমিয়াম সুতি থ্রি-পিস / খাঁটি ঘি ৫০০ গ্রাম"
                        : "e.g. Premium Cotton Panjabi / Organic Honey 1kg"
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      {lang === "bn" ? "আগের দাম (৳)" : "Regular Price (৳)"}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={regularPriceInput}
                      onChange={(e) => setRegularPriceInput(e.target.value)}
                      placeholder={lang === "bn" ? "যেমন: 1850" : "e.g. 1850"}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      {lang === "bn" ? "অফার দাম (৳) *" : "Offer Price (৳) *"}
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={offerPriceInput}
                      onChange={(e) => setOfferPriceInput(e.target.value)}
                      placeholder={lang === "bn" ? "যেমন: 1450" : "e.g. 1450"}
                      className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3.5 py-2.5 text-sm font-bold text-rose-700 placeholder:font-normal placeholder:text-slate-400 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {lang === "bn"
                      ? "পণ্যের বিশেষ গুণাগুণ (কমা দিয়ে লিখুন)"
                      : "Product Highlights (comma separated)"}
                  </label>
                  <textarea
                    rows={2}
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder={
                      lang === "bn"
                        ? "যেমন: ১০০% সুতি কাপড়, রঙ গ্যারান্টি, সারা দেশে ক্যাশ অন ডেলিভারি"
                        : "e.g. 100% Pure Quality, Cash on Delivery Nationwide"
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      {lang === "bn" ? "বিজ্ঞাপনের ভাষা" : "Ad Copy Style"}
                    </label>
                    <select
                      value={copyStyle}
                      onChange={(e) =>
                        setCopyStyle(e.target.value as "bn" | "banglish" | "en")
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-rose-500 focus:outline-none"
                    >
                      <option value="bn">খাঁটি বাংলা (সেরা)</option>
                      <option value="banglish">Banglish Mix</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      {lang === "bn" ? "পোস্টারের সাইজ" : "Poster Ratio"}
                    </label>
                    <select
                      value={aspect}
                      onChange={(e) => setAspect(e.target.value as PosterAspect)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-rose-500 focus:outline-none"
                    >
                      <option value="square">1:1 Square (1080×1080)</option>
                      <option value="portrait">4:5 Boost Ad (1080×1350)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={generating}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-rose-600/25 transition hover:bg-rose-700 disabled:opacity-60"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>
                    {generating
                      ? lang === "bn"
                        ? "আপনার পোস্টার ও বিজ্ঞাপন তৈরি হচ্ছে..."
                        : "Generating Your Poster & Ad Copy..."
                      : lang === "bn"
                      ? "পোস্টার ও বাংলা বিজ্ঞাপন তৈরি করুন →"
                      : "Generate My Poster & Ad Copy →"}
                  </span>
                </button>

                {/* Optional quick sample fill helper at bottom for first-time testers */}
                <div className="border-t border-slate-100 pt-3">
                  <p className="mb-2 text-[11px] font-semibold text-slate-400">
                    {lang === "bn"
                      ? "অথবা টেস্ট করে দেখতে ১ ক্লিকে উদাহরণ ভরুন:"
                      : "Or test quickly with a 1-click sample:"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_PRODUCTS.map((sp) => (
                      <button
                        key={sp.labelEn}
                        type="button"
                        onClick={() => {
                          if (!brandKit.shopName) {
                            onBrandUpdated({
                              ...brandKit,
                              shopName: "আমার অনলাইন শপ",
                              phoneWhatsapp: "01712-987654",
                            });
                          }
                          setProductName(sp.productName);
                          setRegularPriceInput(String(sp.regularPrice));
                          setOfferPriceInput(String(sp.offerPrice));
                          setFeatures(sp.features);
                          setProductImageUrl(sp.productImageUrl);
                          setCustomHeadline(sp.productName);
                          setCustomBadge("");
                        }}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                      >
                        ✦ {lang === "bn" ? sp.labelBn : sp.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              {/* Right Live Output Column */}
              <div className="space-y-6 xl:col-span-7">
                {/* Poster Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {lang === "bn"
                          ? "লাইভ HD অফার পোস্টার প্রিভিউ (1080px)"
                          : "Live HD Offer Poster Preview (1080px)"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {lang === "bn"
                          ? "বাম পাশে যা লিখবেন তা সাথে সাথে এখানে বসবে — পছন্দমতো ডিজাইন বেছে ডাউনলোড করুন"
                          : "Updates live as you type — switch templates & download HD PNG"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowQrOnPoster(!showQrOnPoster)}
                        className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                          showQrOnPoster
                            ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        <span>{lang === "bn" ? "QR কোড" : "QR Code"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFbFeedPreview(!fbFeedPreview)}
                        className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                          fbFeedPreview
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {lang === "bn" ? "FB ভিউ" : "FB Preview"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          posterRef.current?.downloadPng(
                            `sellora-${Date.now()}.png`
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
                      >
                        <Download className="h-4 w-4 text-rose-400" />
                        <span>
                          {lang === "bn" ? "HD ডাউনলোড" : "Download PNG"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 6 Template Switcher Pills */}
                  <div className="mb-4 grid grid-cols-3 gap-2">
                    {[
                      {
                        id: "magenta_luxe" as PosterTemplateId,
                        bn: "ম্যাজেন্টা লাক্স",
                        en: "Magenta Luxe",
                      },
                      {
                        id: "festive_emerald" as PosterTemplateId,
                        bn: "ঈদ / উৎসব লাক্স",
                        en: "Festive Gold",
                      },
                      {
                        id: "crimson_flash" as PosterTemplateId,
                        bn: "ধামাকা ফ্ল্যাশ",
                        en: "Flash Red",
                      },
                      {
                        id: "dark_executive" as PosterTemplateId,
                        bn: "ডার্ক প্রিমিয়াম",
                        en: "Dark Studio",
                      },
                      {
                        id: "minimal_boutique" as PosterTemplateId,
                        bn: "মিনিমাল বুটিক",
                        en: "Minimal Boutique",
                      },
                      {
                        id: "flash_split" as PosterTemplateId,
                        bn: "ফ্ল্যাশ স্প্লিট",
                        en: "Flash Split",
                      },
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setTemplateId(tpl.id)}
                        className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                          templateId === tpl.id
                            ? "border-rose-600 bg-rose-50 text-rose-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {lang === "bn" ? tpl.bn : tpl.en}
                      </button>
                    ))}
                  </div>

                  {/* Optional Authentic Facebook Mobile Feed Wrapper */}
                  <div className="mx-auto max-w-lg">
                    {fbFeedPreview && (
                      <div className="rounded-t-2xl border border-b-0 border-slate-200 bg-white p-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                            style={{
                              backgroundColor: displayBrandForPoster.primaryColor,
                            }}
                          >
                            {displayBrandForPoster.shopName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {displayBrandForPoster.shopName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Sponsored • 🌍
                            </p>
                          </div>
                        </div>
                        <p className="mt-2.5 line-clamp-3 whitespace-pre-line text-xs leading-relaxed text-slate-800">
                          {activeCampaign?.adCopies?.[0]?.headline ||
                            effectiveHeadline}
                          {"\n"}
                          {activeCampaign?.adCopies?.[0]?.body || ""}
                        </p>
                      </div>
                    )}

                    <PosterCanvas
                      ref={posterRef}
                      poster={livePosterConfig}
                      brandKit={displayBrandForPoster}
                      regularPrice={regularPriceNum}
                      offerPrice={offerPriceNum}
                      copyStyle={copyStyle}
                      className={fbFeedPreview ? "rounded-t-none" : ""}
                    />

                    {fbFeedPreview && (
                      <div className="flex items-center justify-between rounded-b-2xl border border-t-0 border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-[11px] uppercase text-slate-400">
                            {displayBrandForPoster.pageUrl || "MESSENGER"}
                          </p>
                          <p className="text-xs font-bold text-slate-900">
                            {lang === "bn"
                              ? "ক্যাশ অন ডেলিভারিতে অর্ডার করুন"
                              : "Cash on Delivery Available"}
                          </p>
                        </div>
                        <span className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-800">
                          Send Message
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3 Generated Ad Copy Cards */}
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {lang === "bn"
                      ? "রেডি Facebook বিজ্ঞাপন লেখা (১ ক্লিকে কপি করুন)"
                      : "Ready-to-Post Facebook Ad Copies"}
                  </h3>

                  {!activeCampaign?.adCopies?.length ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                      <Sparkles className="mx-auto h-7 w-7 text-rose-500" />
                      <p className="mt-2 text-sm font-bold text-slate-800">
                        {lang === "bn"
                          ? "বাম পাশে আপনার পণ্যের নাম ও দাম লিখে 'পোস্টার ও বাংলা বিজ্ঞাপন তৈরি করুন' বাটনে চাপ দিন"
                          : "Fill in your product details on the left and press Generate"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {lang === "bn"
                          ? "সাথে সাথে ৩ ধরনের আকর্ষণীয় বাংলা বিজ্ঞাপন লেখা ও মেসেঞ্জার রিপ্লাই এখানে তৈরি হয়ে যাবে!"
                          : "3 custom Facebook ad copies & Messenger closing replies will appear right here."}
                      </p>
                    </div>
                  ) : (
                    activeCampaign.adCopies.map((copy) => {
                      const fullPost = `${copy.headline}\n\n${copy.body}\n\n${copy.ctaLine}`;
                      const isCopied = copiedId === copy.id;
                      return (
                        <div
                          key={copy.id}
                          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs"
                        >
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                              {lang === "bn" ? copy.angleBn : copy.angleEn}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyText(copy.id, fullPost)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 transition hover:bg-slate-900 hover:text-white"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  <span>
                                    {lang === "bn" ? "কপি হয়েছে!" : "Copied!"}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>
                                    {lang === "bn" ? "কপি করুন" : "Copy Post"}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>

                          <p className="font-bold text-slate-900">
                            {copy.headline}
                          </p>
                          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                            {copy.body}
                          </p>
                          <p className="mt-3 rounded-xl bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800">
                            {copy.ctaLine}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
                {/* 30-Second Viral Reels / TikTok Video Script */}
                {activeCampaign?.videoScript?.length ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Clapperboard className="h-5 w-5 text-rose-400" />
                        <h3 className="text-base font-extrabold">
                          {lang === "bn"
                            ? "৩০-সেকেন্ড ভাইরাল Reels ও TikTok ভিডিও স্ক্রিপ্ট"
                            : "30-Second Viral Reels & TikTok Script"}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            "video_script_all",
                            activeCampaign.videoScript!
                              .map(
                                (s) =>
                                  `[${s.timeRange}]\n🎥 দৃশ্য: ${s.visualTip}\n🎙️ ভয়েস: "${s.voiceover}"`
                              )
                              .join("\n\n")
                          )
                        }
                        className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-600"
                      >
                        {copiedId === "video_script_all"
                          ? lang === "bn"
                            ? "কপি হয়েছে!"
                            : "Copied!"
                          : lang === "bn"
                          ? "পুরো স্ক্রিপ্ট কপি"
                          : "Copy Script"}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {activeCampaign.videoScript.map((scene) => (
                        <div
                          key={scene.timeRange}
                          className="rounded-2xl border border-white/10 bg-white/5 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-amber-300">
                              ⏱️ {scene.timeRange}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              🎥 {scene.visualTip}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-100">
                            &ldquo;{scene.voiceover}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* NEW PRO TAB: DIGITAL CASH MEMO & COURIER SLIP */}
          {activeTab === "invoice" && (
            <InvoiceGenerator lang={lang} brandKit={displayBrandForPoster} />
          )}

          {/* NEW PRO TAB: PROFIT & BOOST ROI CALCULATOR */}
          {activeTab === "calculator" && <ProfitCalculator lang={lang} />}

          {/* TAB 2: INBOX & COMMENT CLOSER */}
          {activeTab === "inbox" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                <span className="text-xs font-bold tracking-wider text-rose-600 uppercase">
                  {lang === "bn"
                    ? "লাইভ AI সেলস ক্লোজার"
                    : "Instant Customer Message Closer"}
                </span>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  {lang === "bn"
                    ? "কাস্টমারের যেকোনো প্রশ্ন বা কমেন্ট লিখুন — সাথে সাথে সুন্দর উত্তর পান"
                    : "Paste Any Customer Comment or Inbox Question — Get a Persuasive Reply"}
                </h2>

                <form
                  onSubmit={handleSmartReply}
                  className="mt-4 flex flex-col gap-3 sm:flex-row"
                >
                  <input
                    type="text"
                    value={customerMsg}
                    onChange={(e) => setCustomerMsg(e.target.value)}
                    placeholder="যেমন: ভাইয়া দাম একটু কমান না / চিটাগাংয়ে ডেলিভারি চার্জ কত?"
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loadingReply}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
                  >
                    <Send className="h-4 w-4" />
                    <span>
                      {loadingReply
                        ? lang === "bn"
                          ? "লেখা হচ্ছে..."
                          : "Writing..."
                        : lang === "bn"
                        ? "স্মার্ট রিপ্লাই তৈরি করুন"
                        : "Generate Smart Reply"}
                    </span>
                  </button>
                </form>

                {smartReply && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800">
                        {lang === "bn" ? "প্রস্তুতকৃত উত্তর:" : "Ready Reply:"}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyText("smart_custom", smartReply)}
                        className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-slate-800 shadow-2xs"
                      >
                        {copiedId === "smart_custom"
                          ? lang === "bn"
                            ? "কপি হয়েছে!"
                            : "Copied!"
                          : lang === "bn"
                          ? "কপি করুন"
                          : "Copy"}
                      </button>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
                      {smartReply}
                    </p>
                  </div>
                )}
              </div>

              {activeCampaign?.inboxReplies?.length ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {activeCampaign.inboxReplies.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs"
                    >
                      <div>
                        <div className="mb-2.5 flex items-center justify-between gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                            {item.tag}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyText(item.id, item.reply)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1 text-xs font-bold text-slate-800 transition hover:bg-rose-600 hover:text-white"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span>
                              {copiedId === item.id
                                ? lang === "bn"
                                  ? "কপি হয়েছে!"
                                  : "Copied!"
                                : lang === "bn"
                                ? "কপি"
                                : "Copy"}
                            </span>
                          </button>
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-900">
                          {lang === "bn" ? item.questionBn : item.questionEn}
                        </h3>
                        <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                          {item.reply}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 3: MY SHOP BRAND KIT */}
          {activeTab === "brand" && (
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Wand2 className="h-4 w-4 text-rose-600" />
                  <span>
                    {lang === "bn"
                      ? "ওয়েবসাইট লিংক বা Facebook Bio থেকে অটো Brand Extract"
                      : "Website URL / Facebook Bio Auto-Extractor"}
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
                  <input
                    type="text"
                    value={extractInput}
                    onChange={(e) => setExtractInput(e.target.value)}
                    placeholder="https://yourshop.com অথবা আপনার পেজের বায়ো পেস্ট করুন..."
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleExtractBrand}
                    disabled={extractingBrand}
                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    {extractingBrand
                      ? lang === "bn"
                        ? "এক্সট্রাক্ট হচ্ছে..."
                        : "Extracting..."
                      : lang === "bn"
                      ? "অটো-ফিল করুন"
                      : "Extract"}
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleSaveBrand}
                className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {lang === "bn"
                      ? "আমার দোকানের তথ্য (Brand Kit)"
                      : "My Shop Brand Kit Settings"}
                  </h2>
                  {brandSavedToast && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      ✓ {lang === "bn" ? "সেভ হয়েছে!" : "Saved!"}
                    </span>
                  )}
                </div>

                {/* Shop Logo Upload */}
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl text-xl font-bold text-white"
                    style={{ backgroundColor: draftBrand.primaryColor || "#e11d48" }}
                  >
                    {draftBrand.logoDataUrl ? (
                      <img
                        src={draftBrand.logoDataUrl}
                        alt="Shop logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (draftBrand.shopName || "S").charAt(0)
                    )}
                  </div>
                  <label className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">
                    {lang === "bn"
                      ? "দোকানের লোগো আপলোড করুন"
                      : "Upload Shop Logo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQuickLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      {lang === "bn" ? "দোকান / পেজের নাম *" : "Shop Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={draftBrand.shopName}
                      onChange={(e) =>
                        setDraftBrand({ ...draftBrand, shopName: e.target.value })
                      }
                      placeholder={lang === "bn" ? "আপনার দোকানের নাম লিখুন" : "Enter shop name"}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      {lang === "bn"
                        ? "অর্ডার ফোন / WhatsApp *"
                        : "Order Phone / WhatsApp *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={draftBrand.phoneWhatsapp}
                      onChange={(e) =>
                        setDraftBrand({
                          ...draftBrand,
                          phoneWhatsapp: e.target.value,
                        })
                      }
                      placeholder="017XXXXXXXX"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      {lang === "bn" ? "মূল ব্র্যান্ড কালার" : "Primary Brand Color"}
                    </label>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
                      <input
                        type="color"
                        value={draftBrand.primaryColor}
                        onChange={(e) =>
                          setDraftBrand({
                            ...draftBrand,
                            primaryColor: e.target.value,
                          })
                        }
                        className="h-8 w-10 cursor-pointer border-0 bg-transparent"
                      />
                      <span className="font-mono text-xs text-slate-700">
                        {draftBrand.primaryColor}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      {lang === "bn" ? "হাইলাইট / ব্যাজ কালার" : "Accent Badge Color"}
                    </label>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
                      <input
                        type="color"
                        value={draftBrand.accentColor}
                        onChange={(e) =>
                          setDraftBrand({
                            ...draftBrand,
                            accentColor: e.target.value,
                          })
                        }
                        className="h-8 w-10 cursor-pointer border-0 bg-transparent"
                      />
                      <span className="font-mono text-xs text-slate-700">
                        {draftBrand.accentColor}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      {lang === "bn"
                        ? "ঢাকার ভেতরে ডেলিভারি (৳)"
                        : "Inside Dhaka Delivery (৳)"}
                    </label>
                    <input
                      type="number"
                      value={draftBrand.deliveryInsideDhaka}
                      onChange={(e) =>
                        setDraftBrand({
                          ...draftBrand,
                          deliveryInsideDhaka: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      {lang === "bn"
                        ? "ঢাকার বাইরে ডেলিভারি (৳)"
                        : "Outside Dhaka Delivery (৳)"}
                    </label>
                    <input
                      type="number"
                      value={draftBrand.deliveryOutsideDhaka}
                      onChange={(e) =>
                        setDraftBrand({
                          ...draftBrand,
                          deliveryOutsideDhaka: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {lang === "bn" ? "স্লোগান / ট্যাগলাইন" : "Shop Tagline"}
                  </label>
                  <input
                    type="text"
                    value={draftBrand.tagline}
                    onChange={(e) =>
                      setDraftBrand({ ...draftBrand, tagline: e.target.value })
                    }
                    placeholder={
                      lang === "bn"
                        ? "যেমন: ১০০% খাঁটি পণ্যের বিশ্বস্ত ঠিকানা"
                        : "Trusted quality store"
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingBrand}
                  className="rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-rose-700"
                >
                  {savingBrand
                    ? lang === "bn"
                      ? "সেভ হচ্ছে..."
                      : "Saving..."
                    : lang === "bn"
                    ? "দোকানের তথ্য সেভ করুন"
                    : "Save My Shop Info"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: SAVED CAMPAIGN HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-5">
              <h2 className="text-xl font-extrabold text-slate-900">
                {lang === "bn"
                  ? `আমার সেভ করা পোস্টার ও ক্যাম্পেইন (${campaigns.length})`
                  : `My Saved Campaigns (${campaigns.length})`}
              </h2>

              {campaigns.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <p className="text-sm font-bold text-slate-700">
                    {lang === "bn"
                      ? "আপনি এখনো কোনো পোস্টার তৈরি করেননি।"
                      : "You haven't generated any campaigns yet."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("studio")}
                    className="mt-4 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700"
                  >
                    {lang === "bn"
                      ? "প্রথম পোস্টার তৈরি করুন →"
                      : "Create Your First Poster →"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {campaigns.map((cmp) => (
                    <div
                      key={cmp.id}
                      className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xs"
                    >
                      {cmp.posterConfig.productImageUrl ? (
                        <img
                          src={cmp.posterConfig.productImageUrl}
                          alt={cmp.productName}
                          className="h-44 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-44 w-full items-center justify-center bg-slate-100 text-xs font-bold text-slate-400">
                          No Photo
                        </div>
                      )}
                      <div className="p-5">
                        <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                          ৳{cmp.offerPrice} ({cmp.posterConfig.badgeText})
                        </span>
                        <h3 className="mt-2 line-clamp-1 font-bold text-slate-900">
                          {cmp.productName}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {cmp.adCopies?.[0]?.body}
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCampaign(cmp);
                              setProductName(cmp.productName);
                              setRegularPriceInput(String(cmp.regularPrice));
                              setOfferPriceInput(String(cmp.offerPrice));
                              setFeatures(cmp.features);
                              setProductImageUrl(
                                cmp.posterConfig.productImageUrl || ""
                              );
                              setTemplateId(cmp.posterConfig.templateId);
                              setCustomBadge(cmp.posterConfig.badgeText);
                              setCustomHeadline(cmp.posterConfig.headline);
                              setActiveTab("studio");
                            }}
                            className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                          >
                            {lang === "bn" ? "স্টুডিওতে খুলুন" : "Load in Studio"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCampaign(cmp.id)}
                            aria-label="Delete campaign"
                            className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PLANS & BKASH / NAGAD BILLING */}
          {activeTab === "billing" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {(["starter", "pro", "agency"] as PlanTier[]).map((tier) => {
                  const info = PLAN_CATALOG[tier];
                  const isPro = tier === "pro";
                  return (
                    <div
                      key={tier}
                      className={`rounded-3xl border p-6 ${
                        isPro
                          ? "border-rose-600 bg-slate-900 text-white shadow-lg"
                          : "border-slate-200 bg-white text-slate-900"
                      }`}
                    >
                      <h3 className="text-lg font-extrabold">
                        {lang === "bn" ? info.nameBn : info.nameEn}
                      </h3>
                      <p className="mt-2 text-3xl font-extrabold">
                        ৳{info.priceBdt}
                        <span className="text-xs font-normal opacity-75">
                          {" "}
                          / {lang === "bn" ? "মাস" : "month"}
                        </span>
                      </p>
                      <p
                        className={`mt-2 text-xs font-bold ${
                          isPro ? "text-rose-300" : "text-rose-600"
                        }`}
                      >
                        +{info.credits}{" "}
                        {lang === "bn"
                          ? "টি পূর্ণাঙ্গ AI ক্যাম্পেইন ক্রেডিট"
                          : "Full AI Campaign Credits"}
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenPayment(tier)}
                        className="mt-6 w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-500"
                      >
                        {lang === "bn"
                          ? "bKash / Nagad / Rocket দিয়ে নিন"
                          : "Pay via bKash / Nagad / Rocket"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: PRIVATE FOUNDER ADMIN PANEL (Protected by Secret Admin PIN!) */}
          {activeTab === "founder" && isAdminUnlocked && (
            <div className="mx-auto max-w-5xl space-y-6">
              {/* 1-Click Master Switch: Free Launch Mode <-> Paid SaaS Mode */}
              <div className="flex flex-col justify-between gap-4 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 sm:flex-row sm:items-center">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-0.5 text-[11px] font-bold text-white">
                    {freeLaunchMode
                      ? "🟢 বর্তমান মোড: ১০০% ফ্রি লঞ্চ মোড চালু"
                      : "💳 বর্তমান মোড: পেইড সাবস্ক্রিপশন (BDT) চালু"}
                  </span>
                  <h3 className="mt-2 text-lg font-extrabold text-slate-900">
                    {freeLaunchMode
                      ? "এখন সব ইউজারের জন্য পেমেন্ট বন্ধ ও আনলিমিটেড ফ্রি!"
                      : "এখন ক্রেডিট লিমিট ও bKash/Nagad পেমেন্ট সিস্টেম সক্রিয় আছে"}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    শুধু আপনি (Md Mobarak Hossain) পিন দিয়ে এই প্যানেলটি দেখতে পাচ্ছেন। সাধারণ ইউজাররা এটি দেখতে পায় না।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await fetch("/api/settings", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        adminPin: verifiedAdminPin,
                        freeLaunchMode: !freeLaunchMode,
                      }),
                    });
                    await onRefreshState();
                  }}
                  className="shrink-0 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-rose-600"
                >
                  {freeLaunchMode
                    ? "পরে পেইড মোড চালু করুন →"
                    : "ফ্রি আনলিমিটেড মোডে ফিরুন"}
                </button>
              </div>

              {/* Registered Entrepreneurs Directory */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-rose-600" />
                    <h3 className="text-base font-extrabold text-slate-900">
                      রেজিস্টার্ড উদ্যোক্তা তালিকা ({registeredUsers.length})
                    </h3>
                  </div>
                </div>
                {registeredUsers.length === 0 ? (
                  <p className="mt-3 text-xs text-slate-500">
                    নতুন ইউজাররা অ্যাকাউন্ট খুললেই তাঁদের নাম, দোকান ও নম্বর এখানে দেখতে পাবেন।
                  </p>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 uppercase">
                          <th className="py-2">নাম</th>
                          <th className="py-2">দোকানের নাম</th>
                          <th className="py-2">মোবাইল / ইমেইল</th>
                          <th className="py-2">পোস্টার সংখ্যা</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {registeredUsers.map((u) => (
                          <tr key={u.id}>
                            <td className="py-2.5 font-bold text-slate-900">
                              {u.name}
                            </td>
                            <td className="py-2.5 font-semibold text-rose-600">
                              {u.shopName}
                            </td>
                            <td className="py-2.5 font-mono text-slate-700">
                              {u.identifier}
                            </td>
                            <td className="py-2.5 font-bold">
                              {u.campaignsCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* VIP Early User Waitlist Leads */}
              {waitlist.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <h3 className="text-base font-extrabold text-slate-900">
                    VIP আর্লি ইউজার লিড তালিকা ({waitlist.length})
                  </h3>
                  <div className="mt-3 space-y-2 text-xs">
                    {waitlist.map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5"
                      >
                        <span className="font-bold text-slate-800">
                          {w.shopName}
                        </span>
                        <span className="font-mono font-semibold text-rose-600">
                          {w.contact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive MRR Calculator */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                <span className="text-xs font-bold tracking-wider text-rose-600 uppercase">
                  মাসিক আয় (MRR) ও নিট লাভ ক্যালকুলেটর
                </span>
                <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Starter Plan (৳499) ইউজার সংখ্যা:</span>
                        <span className="text-rose-600">{simStarterUsers} জন</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={300}
                        step={5}
                        value={simStarterUsers}
                        onChange={(e) => setSimStarterUsers(Number(e.target.value))}
                        className="mt-2 w-full accent-rose-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Pro Business (৳999) ইউজার সংখ্যা:</span>
                        <span className="text-rose-600">{simProUsers} জন</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        step={5}
                        value={simProUsers}
                        onChange={(e) => setSimProUsers(Number(e.target.value))}
                        className="mt-2 w-full accent-rose-600"
                      />
                    </div>
                  </div>

                  {(() => {
                    const grossMrr = simStarterUsers * 499 + simProUsers * 999;
                    const estApiCost = simStarterUsers * 45 + simProUsers * 110;
                    const netProfit = Math.max(0, grossMrr - estApiCost);
                    return (
                      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-950 p-4 text-white">
                        <div>
                          <p className="text-[11px] text-slate-400">মাসিক মোট আয় (MRR)</p>
                          <p className="mt-1 text-xl font-extrabold text-white">
                            ৳{grossMrr.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400">বার্ষিক রান-রেট (ARR)</p>
                          <p className="mt-1 text-xl font-extrabold text-rose-300">
                            ৳{(grossMrr * 12).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400">আনুমানিক AI খরচ</p>
                          <p className="mt-1 text-sm font-bold text-slate-300">
                            ~৳{estApiCost.toLocaleString("en-IN")}/মাস
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-emerald-400">আপনার মাসিক নিট লাভ</p>
                          <p className="mt-1 text-xl font-extrabold text-emerald-400">
                            ৳{netProfit.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Pending & Recent Customer TrxID Approval Manager */}
              {payments.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
                  <h3 className="text-base font-extrabold text-slate-900">
                    কাস্টমার bKash / Nagad পেমেন্ট যাচাই প্যানেল
                  </h3>
                  <div className="mt-4 space-y-2.5">
                    {payments.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-900">
                            {p.trxId}
                          </span>{" "}
                          •{" "}
                          <span className="font-bold uppercase text-rose-600">
                            {p.method}
                          </span>{" "}
                          ({p.senderNumber}) • <strong>৳{p.amountBdt}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          {p.status === "pending" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleReviewPayment(p.id, "approve")}
                                className="rounded-xl bg-emerald-600 px-3 py-1.5 font-bold text-white"
                              >
                                Approve ✓
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReviewPayment(p.id, "reject")}
                                className="rounded-xl bg-slate-200 px-3 py-1.5 font-bold text-slate-700"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-bold uppercase text-emerald-800">
                              {p.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cloud Keys, Admin PIN & Personal bKash Configuration */}
              <form
                onSubmit={handleSaveFounderSettings}
                className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-rose-600 uppercase">
                      Founder Security, Cloud & Payment Keys
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      পিন, AI API, Supabase ও bKash সেটিংস
                    </h2>
                  </div>
                  {settingsSavedToast && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      ✓ সংরক্ষিত হয়েছে!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      নতুন অ্যাডমিন পিন দিন (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      value={newAdminPin}
                      onChange={(e) => setNewAdminPin(e.target.value)}
                      placeholder="বদলাতে চাইলে নতুন পিন লিখুন"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      আপনার bKash নম্বর
                    </label>
                    <input
                      type="text"
                      value={merchantBkash}
                      onChange={(e) => setMerchantBkash(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      আপনার Nagad নম্বর
                    </label>
                    <input
                      type="text"
                      value={merchantNagad}
                      onChange={(e) => setMerchantNagad(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      OpenRouter API Key{" "}
                      {settingsPreview.hasOpenRouter && (
                        <span className="text-emerald-600">(Connected ✓)</span>
                      )}
                    </label>
                    <input
                      type="password"
                      value={openRouterKey}
                      onChange={(e) => setOpenRouterKey(e.target.value)}
                      placeholder="sk-or-v1-..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Supabase Project URL{" "}
                      {settingsPreview.hasSupabase && (
                        <span className="text-emerald-600">(Connected ✓)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Supabase Service Key
                    </label>
                    <input
                      type="password"
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      পেমেন্ট অনুমোদন মোড
                    </label>
                    <select
                      value={approvalMode}
                      onChange={(e) =>
                        setApprovalMode(e.target.value as "auto" | "manual")
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-800"
                    >
                      <option value="auto">অটো-ভেরিফাই (Instant Credit)</option>
                      <option value="manual">ম্যানুয়াল SMS চেক (Personal bKash)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="rounded-2xl bg-rose-600 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
                >
                  {savingSettings
                    ? "Saving..."
                    : "সব সেটিংস সংরক্ষণ করুন"}
                </button>
              </form>

              <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-slate-200">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    Supabase Cloud Table SQL (`supabase/schema.sql`)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText("sql_schema", SUPABASE_SQL_SNIPPET)}
                    className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"
                  >
                    {copiedId === "sql_schema" ? "Copied ✓" : "Copy SQL"}
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-2xl bg-black/50 p-4 font-mono text-xs text-rose-200">
                  {SUPABASE_SQL_SNIPPET}
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Secret Founder Admin PIN Dialog */}
      {adminPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setAdminPinModalOpen(false);
                setAdminPinError("");
              }}
              className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-rose-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  ফাউন্ডার অ্যাডমিন লগইন
                </h3>
                <p className="text-xs text-slate-500">
                  শুধুমাত্র Md Mobarak Hossain-এর জন্য সংরক্ষিত
                </p>
              </div>
            </div>

            {adminPinError && (
              <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">
                ⚠️ {adminPinError}
              </p>
            )}

            <form onSubmit={handleVerifyAdminPin} className="mt-4 space-y-3">
              <input
                type="password"
                required
                autoFocus
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                placeholder="গোপন অ্যাডমিন পিন লিখুন"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center font-mono text-base font-bold tracking-widest text-slate-900 focus:border-rose-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 py-3 text-xs font-extrabold text-white transition hover:bg-rose-600"
              >
                অ্যাডমিন প্যানেল খুলুন →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
