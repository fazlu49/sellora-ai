export type Language = "bn" | "en";

export type PlanTier = "free" | "starter" | "pro" | "agency";

export const PLAN_CATALOG: Record<
  PlanTier,
  {
    nameBn: string;
    nameEn: string;
    priceBdt: number;
    credits: number;
    badgeBn?: string;
    badgeEn?: string;
  }
> = {
  free: {
    nameBn: "ফ্রি ট্রায়াল",
    nameEn: "Free Trial",
    priceBdt: 0,
    credits: 5,
  },
  starter: {
    nameBn: "স্টার্টার প্যাক",
    nameEn: "Starter Plan",
    priceBdt: 499,
    credits: 60,
    badgeBn: "শুরুর জন্য সেরা",
    badgeEn: "Great to Start",
  },
  pro: {
    nameBn: "প্রো বিজনেস",
    nameEn: "Pro Business",
    priceBdt: 999,
    credits: 200,
    badgeBn: "সবচেয়ে জনপ্রিয়",
    badgeEn: "Most Popular",
  },
  agency: {
    nameBn: "এজেন্সি প্যাক",
    nameEn: "Agency Pack",
    priceBdt: 2499,
    credits: 600,
    badgeBn: "মাল্টি-পেজ",
    badgeEn: "5 Brand Kits",
  },
};

export type PosterTemplateId =
  | "magenta_luxe"
  | "dark_executive"
  | "minimal_boutique"
  | "flash_split"
  | "festive_emerald"
  | "crimson_flash"
  | "royal_navy"
  | "sunset_coral";

export type PosterAspect = "square" | "portrait" | "story";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isGuest?: boolean;
  plan: PlanTier;
  credits: number;
  preferredLang: Language;
  onboarded: boolean;
  createdAt: string;
}

export interface BrandKit {
  shopName: string;
  category: "fashion" | "food" | "gadget" | "cosmetics" | "general";
  tagline: string;
  primaryColor: string;
  accentColor: string;
  phoneWhatsapp: string;
  pageUrl: string;
  deliveryInsideDhaka: number;
  deliveryOutsideDhaka: number;
  paymentPolicy: string;
  logoDataUrl?: string;
}

export interface AccountRecord {
  id: string;
  identifier: string; // email or BD phone normalized
  passwordHash: string;
  user: UserProfile;
  brandKit: BrandKit;
  campaigns: Campaign[];
}

export interface RegisteredUserSummary {
  id: string;
  name: string;
  identifier: string;
  shopName: string;
  phoneWhatsapp: string;
  campaignsCount: number;
  createdAt: string;
}

export interface AdCopyVariant {
  id: string;
  angleBn: string;
  angleEn: string;
  headline: string;
  body: string;
  ctaLine: string;
}

export interface InboxReplyItem {
  id: string;
  questionBn: string;
  questionEn: string;
  tag: string;
  reply: string;
}

export interface PosterConfig {
  templateId: PosterTemplateId;
  aspect: PosterAspect;
  badgeText: string;
  headline: string;
  subline: string;
  highlights: string[];
  ctaText: string;
  productImageUrl: string;
  showQr?: boolean;
  enhancePhoto?: boolean;
  photoFit?: "contain" | "cover";
  photoScale?: number;
  photoOffsetY?: number;
  hidePrice?: boolean;
  freeDelivery?: boolean;
  codBadge?: boolean;
  customPrimaryColor?: string;
  customAccentColor?: string;
}

export interface VideoScriptScene {
  timeRange: string;
  visualTip: string;
  voiceover: string;
}

export interface Campaign {
  id: string;
  productName: string;
  regularPrice: number;
  offerPrice: number;
  features: string;
  copyStyle: "bn" | "banglish" | "en";
  posterConfig: PosterConfig;
  adCopies: AdCopyVariant[];
  inboxReplies: InboxReplyItem[];
  videoScript?: VideoScriptScene[];
  sourceEngine: "cloud_ai" | "smart_engine";
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  plan: PlanTier;
  creditsAdded: number;
  amountBdt: number;
  method: "bkash" | "nagad" | "rocket";
  senderNumber: string;
  trxId: string;
  status: "completed" | "pending" | "rejected";
  createdAt: string;
}

export interface WaitlistLead {
  id: string;
  shopName: string;
  contact: string;
  createdAt: string;
}

export interface RuntimeSettings {
  freeLaunchMode?: boolean;
  founderAdminPin?: string;
  geminiApiKey?: string;
  openRouterApiKey: string;
  openAiApiKey: string;
  aiModel: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  paymentApprovalMode?: "auto" | "manual";
  merchantBkash?: string;
  merchantNagad?: string;
  uddoktaPayApiKey: string;
  uddoktaPayBaseUrl: string;
}

export interface DatabaseSchema {
  user: UserProfile;
  brandKit: BrandKit;
  campaigns: Campaign[];
  accounts?: AccountRecord[];
  payments: PaymentRecord[];
  waitlist?: WaitlistLead[];
  settings: RuntimeSettings;
}
