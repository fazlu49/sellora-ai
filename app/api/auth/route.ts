import { NextResponse } from "next/server";
import { hashPassword, normalizeIdentifier, readDb, writeDb } from "@/lib/db";
import { AccountRecord, BrandKit, UserProfile } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = readDb();
    db.accounts = db.accounts || [];

    // 1. Founder Secret PIN Verification
    if (body.action === "verify_admin") {
      const expected =
        db.settings.founderAdminPin || process.env.FOUNDER_ADMIN_PIN || "492026";
      const provided = String(body.pin || "").trim();
      if (provided !== expected) {
        return NextResponse.json(
          { ok: false, error: "ভুল অ্যাডমিন পিন! সঠিক পিন দিন।" },
          { status: 401 }
        );
      }
      const usersSummary = db.accounts.map((acc) => ({
        id: acc.id,
        name: acc.user.name,
        identifier: acc.identifier,
        shopName: acc.brandKit.shopName || "—",
        phoneWhatsapp: acc.brandKit.phoneWhatsapp || "—",
        campaignsCount: acc.campaigns?.length || 0,
        createdAt: acc.user.createdAt,
      }));
      return NextResponse.json({
        ok: true,
        isAdmin: true,
        usersSummary,
      });
    }

    // 2. Register New User Account
    if (body.action === "signup") {
      const name = String(body.name || "").trim();
      const rawIdentifier = String(body.identifier || "").trim();
      const identifier = normalizeIdentifier(rawIdentifier);
      const password = String(body.password || "");

      if (!name || !identifier || password.trim().length < 4) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "অনুগ্রহ করে আপনার নাম, মোবাইল/ইমেইল এবং কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড দিন।",
          },
          { status: 400 }
        );
      }

      const existing = db.accounts.find((a) => a.identifier === identifier);
      if (existing) {
        return NextResponse.json(
          {
            ok: false,
            code: "ALREADY_EXISTS",
            error:
              "এই মোবাইল/ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা আছে! অনুগ্রহ করে 'লগইন করুন' ট্যাবে যান।",
          },
          { status: 409 }
        );
      }

      const incomingBrand = (body.brandKit || {}) as Partial<BrandKit>;
      const userBrand: BrandKit = {
        shopName: String(incomingBrand.shopName || "").trim(),
        category: incomingBrand.category || "general",
        tagline: String(incomingBrand.tagline || "").trim(),
        primaryColor: incomingBrand.primaryColor || "#e11d48",
        accentColor: incomingBrand.accentColor || "#f59e0b",
        phoneWhatsapp: String(incomingBrand.phoneWhatsapp || rawIdentifier).trim(),
        pageUrl: String(incomingBrand.pageUrl || "").trim(),
        deliveryInsideDhaka: Number(incomingBrand.deliveryInsideDhaka ?? 70),
        deliveryOutsideDhaka: Number(incomingBrand.deliveryOutsideDhaka ?? 130),
        paymentPolicy:
          incomingBrand.paymentPolicy ||
          "পণ্য হাতে পেয়ে দেখে পেমেন্ট — সারা দেশে হোম ডেলিভারি",
        logoDataUrl: incomingBrand.logoDataUrl || "",
      };

      const newUser: UserProfile = {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name,
        email: rawIdentifier,
        isGuest: false,
        plan: "free",
        credits: 5,
        preferredLang: body.lang === "en" ? "en" : "bn",
        onboarded: true,
        createdAt: new Date().toISOString(),
      };

      const record: AccountRecord = {
        id: newUser.id,
        identifier,
        passwordHash: hashPassword(password),
        user: newUser,
        brandKit: userBrand,
        campaigns: [],
      };

      db.accounts.unshift(record);
      writeDb(db);

      return NextResponse.json({
        ok: true,
        passwordHash: record.passwordHash,
        user: record.user,
        brandKit: record.brandKit,
        campaigns: record.campaigns,
      });
    }

    // 3. Login Existing Account
    if (body.action === "login") {
      const identifier = normalizeIdentifier(String(body.identifier || ""));
      const password = String(body.password || "");
      const pwHash = hashPassword(password);

      const found = db.accounts.find((a) => a.identifier === identifier);
      if (found) {
        if (found.passwordHash !== pwHash) {
          return NextResponse.json(
            { ok: false, error: "পাসওয়ার্ড মেলেনি! আবার সঠিক পাসওয়ার্ড দিন।" },
            { status: 401 }
          );
        }
        return NextResponse.json({
          ok: true,
          passwordHash: found.passwordHash,
          user: found.user,
          brandKit: found.brandKit,
          campaigns: found.campaigns || [],
        });
      }

      // Also return pwHash check token so client vault fallback works seamlessly across cold lambdas
      return NextResponse.json(
        {
          ok: false,
          code: "NOT_FOUND_ON_INSTANCE",
          candidateHash: pwHash,
          error:
            "এই মোবাইল/ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি। নতুন হলে 'নতুন অ্যাকাউন্ট খুলুন' চাপুন।",
        },
        { status: 404 }
      );
    }

    // 4. Sync Client Account State Back to Server Instance (keeps Admin user count accurate!)
    if (body.action === "sync_account" && body.account?.id) {
      const incoming = body.account as AccountRecord;
      const idx = db.accounts.findIndex((a) => a.id === incoming.id);
      if (idx >= 0) {
        db.accounts[idx] = {
          ...db.accounts[idx],
          brandKit: incoming.brandKit || db.accounts[idx].brandKit,
          campaigns: incoming.campaigns || db.accounts[idx].campaigns,
        };
      } else if (incoming.identifier && incoming.passwordHash) {
        db.accounts.unshift(incoming);
      }
      writeDb(db);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
