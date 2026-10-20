import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { BrandKit } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "extract") {
      const rawInput = String(body.source || "").trim();
      if (!rawInput) {
        return NextResponse.json(
          { ok: false, error: "ওয়েবসাইট লিংক বা পেজের বিবরণ লিখুন" },
          { status: 400 }
        );
      }

      const extracted: Partial<BrandKit> = {};

      if (/^https?:\/\//i.test(rawInput) || /^[a-z0-9-]+\.[a-z]{2,}/i.test(rawInput)) {
        const url = /^https?:\/\//i.test(rawInput) ? rawInput : `https://${rawInput}`;
        extracted.pageUrl = url;
        try {
          const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 SelloraBrandBot/1.0" },
            signal: AbortSignal.timeout(6000),
          });
          const html = await res.text();
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const descMatch = html.match(
            /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
          );
          const themeMatch = html.match(
            /<meta[^>]*name=["']theme-color["'][^>]*content=["'](#[0-9a-fA-F]{6})["']/i
          );
          const phoneMatch = html.match(/(?:\+?88)?01[3-9]\d[- ]?\d{6,7}/);

          if (titleMatch?.[1]) {
            extracted.shopName = titleMatch[1]
              .split(/[|\-–—]/)[0]
              .trim()
              .slice(0, 42);
          }
          if (descMatch?.[1]) {
            extracted.tagline = descMatch[1].trim().slice(0, 80);
          }
          if (themeMatch?.[1]) {
            extracted.primaryColor = themeMatch[1];
          }
          if (phoneMatch?.[0]) {
            extracted.phoneWhatsapp = phoneMatch[0];
          }
        } catch {
          const hostName = url
            .replace(/^https?:\/\/(www\.)?/i, "")
            .split("/")[0]
            .split(".")[0];
          extracted.shopName =
            hostName.charAt(0).toUpperCase() + hostName.slice(1) + " BD";
        }
      } else {
        const lines = rawInput
          .split(/\n+/)
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines[0]) extracted.shopName = lines[0].slice(0, 42);
        if (lines[1]) extracted.tagline = lines[1].slice(0, 80);
        const phoneMatch = rawInput.match(/(?:\+?88)?01[3-9]\d[- ]?\d{6,7}/);
        if (phoneMatch?.[0]) extracted.phoneWhatsapp = phoneMatch[0];
      }

      const lower = rawInput.toLowerCase();
      if (/মধু|ঘি|food|organic|খাবার|আচার|তেল/.test(lower)) {
        extracted.category = "food";
        extracted.primaryColor = extracted.primaryColor || "#d97706";
      } else if (/watch|gadget|tech|earbud|গ্যাজেট|মোবাইল|ইলেকট্রনিক/.test(lower)) {
        extracted.category = "gadget";
        extracted.primaryColor = extracted.primaryColor || "#0f172a";
      } else if (/skin|beauty|cosmetic|স্কিন|বিউটি|সিরাম/.test(lower)) {
        extracted.category = "cosmetics";
        extracted.primaryColor = extracted.primaryColor || "#db2777";
      } else {
        extracted.category = "fashion";
        extracted.primaryColor = extracted.primaryColor || "#e11d48";
      }

      return NextResponse.json({ ok: true, extracted });
    }

    const db = await readDb();
    const updatedBrand: BrandKit = {
      shopName: String(body.brandKit?.shopName || ""),
      category: body.brandKit?.category || "general",
      tagline: String(body.brandKit?.tagline || ""),
      primaryColor: body.brandKit?.primaryColor || "#e11d48",
      accentColor: body.brandKit?.accentColor || "#f59e0b",
      phoneWhatsapp: String(body.brandKit?.phoneWhatsapp || ""),
      pageUrl: String(body.brandKit?.pageUrl || ""),
      deliveryInsideDhaka: Number(body.brandKit?.deliveryInsideDhaka ?? 70),
      deliveryOutsideDhaka: Number(body.brandKit?.deliveryOutsideDhaka ?? 130),
      paymentPolicy:
        body.brandKit?.paymentPolicy ||
        "পণ্য হাতে পেয়ে দেখে পেমেন্ট — সারা দেশে হোম ডেলিভারি",
      logoDataUrl: body.brandKit?.logoDataUrl || "",
    };

    if (body.userId && Array.isArray(db.accounts)) {
      const acc = db.accounts.find((a) => a.id === body.userId);
      if (acc) {
        acc.brandKit = updatedBrand;
        await writeDb(db);
      }
    }

    return NextResponse.json({ ok: true, brandKit: updatedBrand });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 400 }
    );
  }
}
