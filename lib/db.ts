import crypto from "crypto";
import fs from "fs";
import path from "path";
import { DatabaseSchema, PLAN_CATALOG } from "./types";

export { PLAN_CATALOG };

export function normalizeIdentifier(raw: string): string {
  const trimmed = String(raw || "").trim().toLowerCase();
  if (trimmed.includes("@")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length === 13) {
    return digits.slice(2);
  }
  return digits || trimmed;
}

export function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(`sellora_salt_2026:${password}`)
    .digest("hex");
}

const IS_CLOUD = Boolean(process.env.VERCEL || process.env.LAMBDA_TASK_ROOT);
const DB_DIR = IS_CLOUD ? "/tmp" : path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "sellora-db-cache.json");

export const DEFAULT_DB: DatabaseSchema = {
  user: {
    id: "guest_session",
    name: "",
    email: "",
    isGuest: true,
    plan: "free",
    credits: 5,
    preferredLang: "bn",
    onboarded: false,
    createdAt: new Date().toISOString(),
  },
  brandKit: {
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
  },
  accounts: [],
  campaigns: [],
  payments: [],
  waitlist: [],
  settings: {
    freeLaunchMode: true,
    founderAdminPin: process.env.FOUNDER_ADMIN_PIN || "492026",
    geminiApiKey: process.env.GEMINI_API_KEY || "",
    openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
    openAiApiKey: process.env.OPENAI_API_KEY || "",
    aiModel: "google/gemini-2.5-flash",
    supabaseUrl:
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      deriveSupabaseUrlFromJwt(
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.SUPABASE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          ""
      ),
    supabaseKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "",
    paymentApprovalMode: "auto",
    merchantBkash: "01700-889911",
    merchantNagad: "01800-889922",
    uddoktaPayApiKey: process.env.UDDOKTAPAY_API_KEY || "",
    uddoktaPayBaseUrl: "https://sandbox.uddoktapay.com/api/checkout-v2",
  },
};

function deriveSupabaseUrlFromJwt(key: string): string {
  try {
    const parts = key.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(
        Buffer.from(parts[1], "base64url").toString("utf-8")
      );
      if (payload?.ref && typeof payload.ref === "string") {
        return `https://${payload.ref}.supabase.co`;
      }
    }
  } catch {
    // Ignore non-JWT publishable/secret keys
  }
  return "";
}

function getSupabaseCreds(fallbackDb?: DatabaseSchema) {
  const rawKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    fallbackDb?.settings?.supabaseKey ||
    ""
  ).trim();

  if (!rawKey || rawKey === "[ENV_PROTECTED]") return null;

  const url = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    fallbackDb?.settings?.supabaseUrl ||
    deriveSupabaseUrlFromJwt(rawKey) ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");

  if (!url) return null;
  return { url, key: rawKey };
}

function readLocalCache(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      return structuredClone(DEFAULT_DB);
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
    return {
      ...DEFAULT_DB,
      ...parsed,
      user: { ...DEFAULT_DB.user, ...(parsed.user || {}) },
      brandKit: { ...DEFAULT_DB.brandKit, ...(parsed.brandKit || {}) },
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      campaigns: Array.isArray(parsed.campaigns) ? parsed.campaigns : [],
      payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      waitlist: Array.isArray(parsed.waitlist) ? parsed.waitlist : [],
      settings: {
        ...DEFAULT_DB.settings,
        ...(parsed.settings || {}),
        supabaseUrl:
          process.env.SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL ||
          parsed.settings?.supabaseUrl ||
          "",
        supabaseKey:
          process.env.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.SUPABASE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          parsed.settings?.supabaseKey ||
          "",
      },
    };
  } catch {
    return structuredClone(DEFAULT_DB);
  }
}

function writeLocalCache(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Ignore transient fs cache errors on serverless runtimes
  }
}

export async function readDb(): Promise<DatabaseSchema> {
  const local = readLocalCache();
  const creds = getSupabaseCreds(local);

  if (creds) {
    try {
      const res = await fetch(
        `${creds.url}/rest/v1/app_kv_store?key=eq.sellora_primary_state&select=payload&limit=1`,
        {
          method: "GET",
          headers: {
            apikey: creds.key,
            Authorization: `Bearer ${creds.key}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      if (res.ok) {
        const rows = (await res.json()) as Array<{
          payload?: Partial<DatabaseSchema>;
        }>;
        const cloudPayload = rows?.[0]?.payload;
        if (cloudPayload && typeof cloudPayload === "object") {
          const merged: DatabaseSchema = {
            ...DEFAULT_DB,
            ...cloudPayload,
            user: { ...DEFAULT_DB.user, ...(cloudPayload.user || {}) },
            brandKit: {
              ...DEFAULT_DB.brandKit,
              ...(cloudPayload.brandKit || {}),
            },
            accounts: Array.isArray(cloudPayload.accounts)
              ? cloudPayload.accounts
              : [],
            campaigns: Array.isArray(cloudPayload.campaigns)
              ? cloudPayload.campaigns
              : [],
            payments: Array.isArray(cloudPayload.payments)
              ? cloudPayload.payments
              : [],
            waitlist: Array.isArray(cloudPayload.waitlist)
              ? cloudPayload.waitlist
              : [],
            settings: {
              ...DEFAULT_DB.settings,
              ...(cloudPayload.settings || {}),
              supabaseUrl: creds.url,
              supabaseKey: creds.key,
            },
          };
          writeLocalCache(merged);
          return merged;
        }
      }
    } catch {
      // Fallback to local cache on transient network issue
    }
  }

  return local;
}

export async function writeDb(data: DatabaseSchema): Promise<DatabaseSchema> {
  writeLocalCache(data);

  const creds = getSupabaseCreds(data);
  if (creds) {
    try {
      const sanitizedForCloud: DatabaseSchema = {
        ...data,
        settings: {
          ...data.settings,
          supabaseUrl: creds.url,
          supabaseKey: "[ENV_PROTECTED]",
        },
      };

      await fetch(`${creds.url}/rest/v1/app_kv_store`, {
        method: "POST",
        headers: {
          apikey: creds.key,
          Authorization: `Bearer ${creds.key}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({
          key: "sellora_primary_state",
          payload: sanitizedForCloud,
          updated_at: new Date().toISOString(),
        }),
        cache: "no-store",
      });
    } catch {
      // Local cache already saved
    }
  }

  return data;
}
