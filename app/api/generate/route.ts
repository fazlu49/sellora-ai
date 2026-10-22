import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import {
  analyzeProductImageWithAi,
  generateCampaignWithAiOrFallback,
  generateInstantCustomerReplyWithAi,
} from "@/lib/ai-engine";
import { BrandKit, Campaign } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await readDb();

    if (body.action === "vision_autofill") {
      const result = await analyzeProductImageWithAi(
        String(body.productImageUrl || ""),
        String(body.hintText || ""),
        db.settings
      );
      return NextResponse.json({ ok: true, ...result });
    }

    // Always prefer the caller's own shop BrandKit so every entrepreneur's output is 100% personalized
    const activeBrand: BrandKit = {
      shopName: String(body.brandKit?.shopName || "আমার অনলাইন শপ").trim() || "আমার অনলাইন শপ",
      category: body.brandKit?.category || "general",
      tagline: String(body.brandKit?.tagline || ""),
      primaryColor: body.brandKit?.primaryColor || "#e11d48",
      accentColor: body.brandKit?.accentColor || "#f59e0b",
      phoneWhatsapp: String(body.brandKit?.phoneWhatsapp || "ইনবক্স করুন").trim() || "ইনবক্স করুন",
      pageUrl: String(body.brandKit?.pageUrl || ""),
      deliveryInsideDhaka: Number(body.brandKit?.deliveryInsideDhaka ?? 70),
      deliveryOutsideDhaka: Number(body.brandKit?.deliveryOutsideDhaka ?? 130),
      paymentPolicy:
        body.brandKit?.paymentPolicy ||
        "পণ্য হাতে পেয়ে দেখে পেমেন্ট — সারা দেশে হোম ডেলিভারি",
      logoDataUrl: body.brandKit?.logoDataUrl || "",
    };

    if (body.action === "smart_reply") {
      const fallbackCampaign: Campaign = body.targetCampaign || {
        id: "tmp",
        productName: String(body.productName || "আমাদের পণ্য"),
        regularPrice: Number(body.regularPrice || 1500),
        offerPrice: Number(body.offerPrice || 1200),
        features: String(body.features || "প্রিমিয়াম কোয়ালিটি"),
        copyStyle: "bn",
        posterConfig: {
          templateId: "magenta_luxe",
          aspect: "square",
          badgeText: "বিশেষ ছাড়",
          headline: String(body.productName || "আমাদের পণ্য"),
          subline: "",
          highlights: [],
          ctaText: "",
          productImageUrl: "/samples/kurti.png",
        },
        adCopies: [],
        inboxReplies: [],
        sourceEngine: "smart_engine",
        createdAt: new Date().toISOString(),
      };
      const reply = await generateInstantCustomerReplyWithAi(
        String(body.customerMessage || ""),
        fallbackCampaign,
        activeBrand,
        db.settings
      );
      return NextResponse.json({ ok: true, reply });
    }

    const isFreeMode = db.settings.freeLaunchMode !== false;

    const userId = String(body.userId || "");
    const account = db.accounts?.find((a) => a.id === userId);

    if (!isFreeMode) {
      const availableCredits = account ? account.user.credits : Number(body.userCredits ?? 5);
      if (availableCredits <= 0) {
        return NextResponse.json(
          {
            ok: false,
            code: "INSUFFICIENT_CREDITS",
            error:
              "আপনার ফ্রি ক্রেডিট শেষ হয়ে গেছে! নতুন ক্যাম্পেইন তৈরি করতে প্ল্যান আপগ্রেড করুন।",
          },
          { status: 402 }
        );
      }
    }

    const campaign = await generateCampaignWithAiOrFallback(
      {
        productName: String(body.productName || "প্রিমিয়াম পণ্য").trim(),
        regularPrice: Number(body.regularPrice || body.offerPrice || 1000),
        offerPrice: Number(body.offerPrice || body.regularPrice || 1000),
        features: String(body.features || "প্রিমিয়াম মানের অরিজিনাল পণ্য, সারা দেশে ক্যাশ অন ডেলিভারি"),
        copyStyle: body.copyStyle || "bn",
        productImageUrl: String(body.productImageUrl || "/samples/kurti.png"),
        templateId: body.templateId || "magenta_luxe",
        aspect: body.aspect || "square",
        brandKit: activeBrand,
      },
      db.settings
    );

    if (account) {
      if (!isFreeMode) {
        account.user.credits = Math.max(0, account.user.credits - 1);
      }
      account.brandKit = activeBrand;
      account.campaigns = [campaign, ...(account.campaigns || [])].slice(0, 30);
      await writeDb(db);
    }

    return NextResponse.json({
      ok: true,
      campaign,
      user: account?.user || null,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
