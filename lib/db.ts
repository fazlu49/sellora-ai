import fs from "fs";
import path from "path";
import crypto from "crypto";
import { DatabaseSchema, PLAN_CATALOG } from "./types";
import { getSupabaseAdmin } from "./supabase";

export { PLAN_CATALOG };

const DATA_DIR = path.join(process.cwd(), "data");
const PRIMARY_DB_PATH = path.join(DATA_DIR, "db.json");
const FALLBACK_DB_PATH = "/tmp/sellora-ai-db.json";

export function hashPassword(raw: string): string {
  return crypto
    .createHash("sha256")
    .update(`sellora_v2_salt::${raw.trim()}`)
    .digest("hex");
}

export function normalizeIdentifier(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "");
}

function createSeedDatabase(): DatabaseSchema {
  const blankBrand = {
    shopName: "",
    category: "general" as const,
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

  return {
    user: {
      id: "guest_session",
      name: "নতুন উদ্যোক্তা",
      email: "",
      isGuest: true,
      plan: "free",
      credits: 5,
      preferredLang: "bn",
      onboarded: false,
      createdAt: new Date().toISOString(),
    },
    brandKit: blankBrand,
    campaigns: [],
    accounts: [],
    payments: [],
    waitlist: [],
    settings: {
      freeLaunchMode: true,
      founderAdminPin: process.env.FOUNDER_ADMIN_PIN || "492026",
      openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
      openAiApiKey: process.env.OPENAI_API_KEY || "",
      aiModel: process.env.AI_MODEL || "openai/gpt-4o-mini",
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      paymentApprovalMode: "auto",
      merchantBkash: "01700-889911",
      merchantNagad: "01800-889922",
      uddoktaPayApiKey: process.env.UDDOKTAPAY_API_KEY || "",
      uddoktaPayBaseUrl:
        process.env.UDDOKTAPAY_BASE_URL ||
        "https://sandbox.uddoktapay.com/api/checkout-v2",
    },
  };
}

function resolveDbPath(): string {
  if (process.env.VERCEL) {
    return FALLBACK_DB_PATH;
  }
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return PRIMARY_DB_PATH;
  } catch {
    return FALLBACK_DB_PATH;
  }
}

export function readDb(): DatabaseSchema {
  const dbPath = resolveDbPath();
  try {
    if (!fs.existsSync(dbPath)) {
      const seed = createSeedDatabase();
      fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2), "utf-8");
      return seed;
    }
    const raw = fs.readFileSync(dbPath, "utf-8");
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!Array.isArray(parsed.accounts)) parsed.accounts = [];
    if (!parsed.settings.founderAdminPin) {
      parsed.settings.founderAdminPin =
        process.env.FOUNDER_ADMIN_PIN || "492026";
    }
    return parsed;
  } catch {
    return createSeedDatabase();
  }
}

export function writeDb(data: DatabaseSchema): DatabaseSchema {
  const dbPath = resolveDbPath();
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write db:", err);
  }

  const sb = getSupabaseAdmin(
    data.settings.supabaseUrl,
    data.settings.supabaseKey
  );
  if (sb) {
    sb.from("app_kv_store")
      .upsert({
        key: "sellora_primary_state",
        payload: data,
        updated_at: new Date().toISOString(),
      })
      .then(() => {});
  }

  return data;
}
