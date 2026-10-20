"use client";

import React, { useCallback, useEffect, useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { DashboardApp } from "@/components/DashboardApp";
import { AuthModalTab, OnboardingModal } from "@/components/OnboardingModal";
import { PaymentModal } from "@/components/PaymentModal";
import {
  AccountRecord,
  BrandKit,
  Campaign,
  Language,
  PaymentRecord,
  PlanTier,
  UserProfile,
  WaitlistLead,
} from "@/lib/types";

const VAULT_STORAGE_KEY = "sellora_accounts_vault_v2";
const ACTIVE_SESSION_KEY = "sellora_active_user_id_v2";
const GUEST_WORKSPACE_KEY = "sellora_guest_workspace_v2";
const LANG_KEY = "sellora_lang_v2";

function createBlankBrand(): BrandKit {
  return {
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
}

function createGuestUser(lang: Language = "bn"): UserProfile {
  return {
    id: "guest_local",
    name: lang === "bn" ? "গেস্ট উদ্যোক্তা" : "Guest Seller",
    email: "",
    isGuest: true,
    plan: "free",
    credits: 5,
    preferredLang: lang,
    onboarded: false,
    createdAt: new Date().toISOString(),
  };
}

function readLocalVault(): AccountRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AccountRecord[]) : [];
  } catch {
    return [];
  }
}

function writeLocalVault(list: AccountRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore storage quota overflow
  }
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [lang, setLang] = useState<Language>("bn");
  const [freeLaunchMode, setFreeLaunchMode] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<AuthModalTab>("signup");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>("pro");

  const [user, setUser] = useState<UserProfile>(() => createGuestUser("bn"));
  const [brandKit, setBrandKit] = useState<BrandKit>(() => createBlankBrand());
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistLead[]>([]);
  const [hasLiveAiKey, setHasLiveAiKey] = useState(false);
  const [settingsPreview, setSettingsPreview] = useState({
    hasOpenRouter: false,
    hasOpenAi: false,
    hasSupabase: false,
    aiModel: "openai/gpt-4o-mini",
    paymentApprovalMode: "auto" as "auto" | "manual",
    merchantBkash: "01700-889911",
    merchantNagad: "01800-889922",
    hasUddoktaPay: false,
    uddoktaPayBaseUrl: "",
  });

  // Load server platform state + restore personal user session cleanly from browser storage
  const loadState = useCallback(async () => {
    try {
      const savedLang =
        typeof window !== "undefined"
          ? (localStorage.getItem(LANG_KEY) as Language | null)
          : null;
      const initialLang: Language = savedLang === "en" ? "en" : "bn";
      setLang(initialLang);

      // Restore personal account or isolated guest session
      if (typeof window !== "undefined") {
        const activeId = localStorage.getItem(ACTIVE_SESSION_KEY);
        const vault = readLocalVault();
        const savedAccount = activeId
          ? vault.find((a) => a.id === activeId)
          : undefined;

        if (savedAccount) {
          setUser(savedAccount.user);
          setBrandKit(savedAccount.brandKit);
          setCampaigns(savedAccount.campaigns || []);
          // Quietly sync back to server so Admin user directory stays up to date across cold starts
          fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "sync_account", account: savedAccount }),
          }).catch(() => {});
        } else {
          const guestRaw = localStorage.getItem(GUEST_WORKSPACE_KEY);
          if (guestRaw) {
            const parsed = JSON.parse(guestRaw) as {
              brandKit?: BrandKit;
              campaigns?: Campaign[];
              credits?: number;
            };
            const guestUser = createGuestUser(initialLang);
            if (typeof parsed.credits === "number") {
              guestUser.credits = parsed.credits;
            }
            setUser(guestUser);
            setBrandKit(parsed.brandKit || createBlankBrand());
            setCampaigns(parsed.campaigns || []);
          } else {
            setUser(createGuestUser(initialLang));
            setBrandKit(createBlankBrand());
            setCampaigns([]);
          }
        }
      }

      const res = await fetch("/api/state", { cache: "no-store" });
      const json = await res.json();
      setFreeLaunchMode(json.freeLaunchMode !== false);
      setPayments(json.payments || []);
      setWaitlist(json.waitlist || []);
      setHasLiveAiKey(Boolean(json.hasLiveAiKey));
      if (json.settingsPreview) setSettingsPreview(json.settingsPreview);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  // Persist current user's BrandKit + Campaigns isolated per account OR guest session
  const persistCurrentWorkspace = useCallback(
    (nextUser: UserProfile, nextBrand: BrandKit, nextCampaigns: Campaign[]) => {
      if (typeof window === "undefined") return;
      if (nextUser.isGuest) {
        try {
          localStorage.setItem(
            GUEST_WORKSPACE_KEY,
            JSON.stringify({
              brandKit: nextBrand,
              campaigns: nextCampaigns,
              credits: nextUser.credits,
            })
          );
        } catch {
          // ignore
        }
      } else {
        const vault = readLocalVault();
        const idx = vault.findIndex((a) => a.id === nextUser.id);
        if (idx >= 0) {
          const updatedRecord: AccountRecord = {
            ...vault[idx],
            user: nextUser,
            brandKit: nextBrand,
            campaigns: nextCampaigns,
          };
          vault[idx] = updatedRecord;
          writeLocalVault(vault);
          fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "sync_account",
              account: updatedRecord,
            }),
          }).catch(() => {});
        }
      }
    },
    []
  );

  const handleToggleLang = (next: Language) => {
    setLang(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANG_KEY, next);
    }
  };

  const handleSignup = async (payload: {
    name: string;
    identifier: string;
    password: string;
    brandKit: BrandKit;
  }): Promise<string | null> => {
    const normalized = payload.identifier.trim().toLowerCase().replace(/\s+/g, "");
    const vault = readLocalVault();
    if (vault.some((a) => a.identifier === normalized)) {
      return lang === "bn"
        ? "এই মোবাইল/ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা আছে! 'লগইন করুন' ট্যাবে যান।"
        : "An account already exists with this mobile/email! Please Log In.";
    }

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "signup",
        name: payload.name,
        identifier: payload.identifier,
        password: payload.password,
        brandKit: payload.brandKit,
        lang,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      return json.error || "অ্যাকাউন্ট খোলা যায়নি, আবার চেষ্টা করুন।";
    }

    // Carry over any campaigns created during Guest Mode seamlessly into the new Account!
    const mergedCampaigns = user.isGuest && campaigns.length > 0 ? campaigns : [];
    const newRecord: AccountRecord = {
      id: json.user.id,
      identifier: normalized,
      passwordHash: json.passwordHash,
      user: json.user,
      brandKit: json.brandKit,
      campaigns: mergedCampaigns,
    };

    writeLocalVault([newRecord, ...vault]);
    localStorage.setItem(ACTIVE_SESSION_KEY, newRecord.id);

    setUser(newRecord.user);
    setBrandKit(newRecord.brandKit);
    setCampaigns(mergedCampaigns);
    setAuthModalOpen(false);
    setView("dashboard");
    return null;
  };

  const handleLogin = async (payload: {
    identifier: string;
    password: string;
  }): Promise<string | null> => {
    const normalized = payload.identifier.trim().toLowerCase().replace(/\s+/g, "");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        identifier: payload.identifier,
        password: payload.password,
      }),
    });
    const json = await res.json();

    if (res.ok && json.ok) {
      const vault = readLocalVault();
      const localMatch = vault.find((a) => a.identifier === normalized);
      const mergedCampaigns =
        json.campaigns?.length > 0
          ? json.campaigns
          : localMatch?.campaigns || [];
      const mergedBrand = localMatch?.brandKit?.logoDataUrl
        ? { ...json.brandKit, logoDataUrl: localMatch.brandKit.logoDataUrl }
        : json.brandKit;

      const record: AccountRecord = {
        id: json.user.id,
        identifier: normalized,
        passwordHash: json.passwordHash,
        user: json.user,
        brandKit: mergedBrand,
        campaigns: mergedCampaigns,
      };
      const others = vault.filter((a) => a.identifier !== normalized);
      writeLocalVault([record, ...others]);
      localStorage.setItem(ACTIVE_SESSION_KEY, record.id);

      setUser(record.user);
      setBrandKit(record.brandKit);
      setCampaigns(record.campaigns);
      setAuthModalOpen(false);
      setView("dashboard");
      return null;
    }

    // Check browser local vault across serverless cold starts
    if (json.code === "NOT_FOUND_ON_INSTANCE" && json.candidateHash) {
      const vault = readLocalVault();
      const localFound = vault.find((a) => a.identifier === normalized);
      if (localFound) {
        if (localFound.passwordHash !== json.candidateHash) {
          return lang === "bn"
            ? "পাসওয়ার্ড মেলেনি! আবার সঠিক পাসওয়ার্ড দিন।"
            : "Incorrect password! Please try again.";
        }
        localStorage.setItem(ACTIVE_SESSION_KEY, localFound.id);
        fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "sync_account", account: localFound }),
        }).catch(() => {});
        setUser(localFound.user);
        setBrandKit(localFound.brandKit);
        setCampaigns(localFound.campaigns || []);
        setAuthModalOpen(false);
        setView("dashboard");
        return null;
      }
    }

    return json.error || "অ্যাকাউন্ট পাওয়া যায়নি।";
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
    const freshGuest = createGuestUser(lang);
    const freshBrand = createBlankBrand();
    setUser(freshGuest);
    setBrandKit(freshBrand);
    setCampaigns([]);
    setView("landing");
  };

  const handlePaymentSuccess = async (
    plan: PlanTier,
    method: "bkash" | "nagad" | "rocket",
    senderNumber: string,
    trxId: string
  ) => {
    const res = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, method, senderNumber, trxId }),
    });
    const json = await res.json();
    if (json.ok) {
      const updatedUser = { ...user, plan: json.user.plan, credits: json.user.credits };
      setUser(updatedUser);
      setPayments(json.payments);
      persistCurrentWorkspace(updatedUser, brandKit, campaigns);
      setView("dashboard");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
          <p className="text-sm font-bold text-slate-600">
            Sellora AI লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {view === "landing" ? (
        <LandingPage
          lang={lang}
          freeLaunchMode={freeLaunchMode}
          onToggleLang={handleToggleLang}
          onStartFree={() => {
            setAuthModalTab("signup");
            setAuthModalOpen(true);
          }}
          onLoginClick={() => {
            setAuthModalTab("login");
            setAuthModalOpen(true);
          }}
          onOpenDashboard={() => setView("dashboard")}
          onSelectPaidPlan={(plan) => {
            setSelectedPlan(plan);
            setPaymentOpen(true);
          }}
          brandKit={brandKit}
        />
      ) : (
        <DashboardApp
          lang={lang}
          freeLaunchMode={freeLaunchMode}
          onToggleLang={handleToggleLang}
          user={user}
          brandKit={brandKit}
          campaigns={campaigns}
          payments={payments}
          waitlist={waitlist}
          hasLiveAiKey={hasLiveAiKey}
          settingsPreview={settingsPreview}
          onBackToLanding={() => setView("landing")}
          onOpenAuthModal={(tab) => {
            setAuthModalTab(tab);
            setAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onOpenPayment={(plan) => {
            setSelectedPlan(plan);
            setPaymentOpen(true);
          }}
          onRefreshState={loadState}
          onCampaignGenerated={(campaign, updatedCredits) => {
            const nextUser =
              typeof updatedCredits === "number"
                ? { ...user, credits: updatedCredits }
                : user;
            const nextCampaigns = [campaign, ...campaigns].slice(0, 30);
            setUser(nextUser);
            setCampaigns(nextCampaigns);
            persistCurrentWorkspace(nextUser, brandKit, nextCampaigns);
          }}
          onBrandUpdated={(kit) => {
            setBrandKit(kit);
            persistCurrentWorkspace(user, kit, campaigns);
          }}
          onCampaignsUpdated={(list) => {
            setCampaigns(list);
            persistCurrentWorkspace(user, brandKit, list);
          }}
        />
      )}

      <OnboardingModal
        open={authModalOpen}
        initialTab={authModalTab}
        lang={lang}
        freeLaunchMode={freeLaunchMode}
        initialBrand={brandKit}
        onClose={() => setAuthModalOpen(false)}
        onSignup={handleSignup}
        onLogin={handleLogin}
        onContinueAsGuest={() => {
          setAuthModalOpen(false);
          setView("dashboard");
        }}
      />

      <PaymentModal
        open={paymentOpen}
        lang={lang}
        selectedPlan={selectedPlan}
        onClose={() => setPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
