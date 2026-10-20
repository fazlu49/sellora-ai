import {
  AdCopyVariant,
  BrandKit,
  Campaign,
  InboxReplyItem,
  PosterAspect,
  PosterTemplateId,
  RuntimeSettings,
} from "./types";

export interface GenerateInput {
  productName: string;
  regularPrice: number;
  offerPrice: number;
  features: string;
  copyStyle: "bn" | "banglish" | "en";
  productImageUrl: string;
  templateId: PosterTemplateId;
  aspect: PosterAspect;
  brandKit: BrandKit;
}

export function toBanglaDigits(input: number | string): string {
  const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(input).replace(/\d/g, (d) => map[Number(d)]);
}

export function formatBdt(amount: number, lang: "bn" | "en" = "bn"): string {
  const formatted = Number(amount || 0).toLocaleString("en-IN");
  return lang === "bn" ? `৳${toBanglaDigits(formatted)}` : `৳${formatted}`;
}

export function calculateDiscountPercent(regular: number, offer: number): number {
  if (!regular || regular <= offer || offer <= 0) return 0;
  return Math.round(((regular - offer) / regular) * 100);
}

function parseHighlights(features: string, copyStyle: "bn" | "banglish" | "en"): string[] {
  const cleaned = features
    .split(/[,\n।;|]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  if (cleaned.length >= 3) {
    return cleaned.slice(0, 3);
  }

  if (copyStyle === "en") {
    return [
      ...cleaned,
      "100% Authentic Quality Guaranteed",
      "Fast Nationwide Cash on Delivery",
      "Easy Return After Checking Product",
    ].slice(0, 3);
  }

  return [
    ...cleaned,
    "১০০% প্রিমিয়াম কোয়ালিটি গ্যারান্টি",
    "পণ্য হাতে পেয়ে দেখে পেমেন্ট সুবিধা",
    "সারা দেশে দ্রুত হোম ডেলিভারি",
  ].slice(0, 3);
}

export function buildSmartCampaign(input: GenerateInput): Campaign {
  const {
    productName,
    regularPrice,
    offerPrice,
    features,
    copyStyle,
    productImageUrl,
    templateId,
    aspect,
    brandKit,
  } = input;

  const discount = calculateDiscountPercent(regularPrice, offerPrice);
  const saveAmount = Math.max(0, regularPrice - offerPrice);
  const highlights = parseHighlights(features, copyStyle);

  const isEn = copyStyle === "en";
  const isBanglish = copyStyle === "banglish";

  const priceOfferBn = formatBdt(offerPrice, "bn");
  const priceRegBn = formatBdt(regularPrice, "bn");
  const saveBn = formatBdt(saveAmount, "bn");

  const badgeText =
    discount > 0
      ? isEn
        ? `FLAT ${discount}% OFF`
        : `${toBanglaDigits(discount)}% বিশেষ ছাড়`
      : isEn
      ? "LIMITED OFFER"
      : "সীমিত সময়ের অফার";

  const headline = productName.trim();
  const subline = isEn
    ? `Save ৳${saveAmount.toLocaleString("en-IN")} Today • ${brandKit.paymentPolicy}`
    : saveAmount > 0
    ? `আজ অর্ডারে সাশ্রয় করুন ${saveBn} • স্টক সীমিত!`
    : `${brandKit.tagline || "সেরা মানের নিশ্চয়তায় অর্ডার করুন আজই"}`;

  const ctaText = isEn
    ? `Order Now: ${brandKit.phoneWhatsapp}`
    : `অর্ডার করতে ইনবক্স করুন: ${brandKit.phoneWhatsapp}`;

  let adCopies: AdCopyVariant[] = [];

  if (isEn) {
    adCopies = [
      {
        id: "offer_hook",
        angleBn: "১. সরাসরি অফার ও আর্জেন্সি হুক (Boost Best Seller)",
        angleEn: "1. Direct Offer & Scarcity Hook (Best for Conversion Ads)",
        headline: `${productName} — Now Only ৳${offerPrice.toLocaleString("en-IN")} (${discount > 0 ? `${discount}% OFF!` : "Special Price!"})`,
        body: `Looking for original quality without overpaying?\n\nIntroducing ${productName} from ${brandKit.shopName}!\n\nWhy customers love it:\n✅ ${highlights[0]}\n✅ ${highlights[1]}\n✅ ${highlights[2]}\n\n💰 Regular Price: ৳${regularPrice.toLocaleString("en-IN")}\n🔥 Offer Price: ৳${offerPrice.toLocaleString("en-IN")} (Limited Stock Only!)\n\n🚚 Delivery: Inside Dhaka ৳${brandKit.deliveryInsideDhaka} | Outside Dhaka ৳${brandKit.deliveryOutsideDhaka}\n📦 ${brandKit.paymentPolicy}`,
        ctaLine: `👉 Tap "Send Message" or WhatsApp ${brandKit.phoneWhatsapp} to book yours now!`,
      },
      {
        id: "trust_hook",
        angleBn: "২. বিশ্বাস ও কোয়ালিটি গ্যারান্টি হুক",
        angleEn: "2. Customer Trust & Zero-Risk COD Angle",
        headline: `Worried about online product quality? Check first, pay later!`,
        body: `Many shoppers hesitate to order online because photos and real products don't match.\n\nAt ${brandKit.shopName}, what you see is 100% what you receive with our ${productName}.\n\n✨ Top Highlights:\n• ${highlights.join("\n• ")}\n\n🎯 Today's Special Offer: Only ৳${offerPrice.toLocaleString("en-IN")}${saveAmount > 0 ? ` (Save ৳${saveAmount.toLocaleString("en-IN")}!)` : ""}\n📍 All Bangladesh Home Delivery via Steadfast / Pathao Courier.`,
        ctaLine: `💬 Comment "PRICE" or Inbox us with your Name, Address & Phone Number!`,
      },
      {
        id: "story_hook",
        angleBn: "৩. স্টোরিটেলিং ও রিপিট কাস্টমার অ্যাঙ্গেল",
        angleEn: "3. Best-Seller Social Proof & Storytelling Hook",
        headline: `Our most requested restock of the month is finally live!`,
        body: `Last week, dozens of messages came into ${brandKit.shopName} asking when ${productName} would restock.\n\nGood news — fresh stock just arrived, and for the first 30 orders we're keeping the discounted price at just ৳${offerPrice.toLocaleString("en-IN")}!\n\n✔ ${highlights[0]}\n✔ ${highlights[1]}\n✔ ${highlights[2]}`,
        ctaLine: `📲 Call/WhatsApp ${brandKit.phoneWhatsapp} or click "Order Now" before stock runs out!`,
      },
    ];
  } else if (isBanglish) {
    adCopies = [
      {
        id: "offer_hook",
        angleBn: "১. বাংলিশ হাই-কনভার্টিং বুস্ট কপি",
        angleEn: "1. Banglish High-Converting Boost Copy",
        headline: `${productName} — Ekhon matro ৳${offerPrice} (${discount > 0 ? `${discount}% OFF!` : "Special Offer!"}) 🔥`,
        body: `Online-e picture dekhe order kore thokar bhoy pacchen? ${brandKit.shopName} niye esheche 100% premium quality "${productName}"!\n\nKeno niben amader theke?\n✅ ${highlights[0]}\n✅ ${highlights[1]}\n✅ ${highlights[2]}\n\n💸 Regular Price: ৳${regularPrice}\n🔥 Offer Price: Matro ৳${offerPrice}!\n\n🚚 Delivery Charge: Dhaka ৳${brandKit.deliveryInsideDhaka} | Outside Dhaka ৳${brandKit.deliveryOutsideDhaka}\n📦 ${brandKit.paymentPolicy}`,
        ctaLine: `👉 Stock shesh howar agei Inbox korun othoba WhatsApp korun: ${brandKit.phoneWhatsapp}`,
      },
      {
        id: "trust_hook",
        angleBn: "২. ট্রাস্ট ও ক্যাশ-অন-ডেলিভারি হুক",
        angleEn: "2. Trust & Cash-on-Delivery Angle",
        headline: `Product haate peye dekhe tarpor taka porishodh korun! ✨`,
        body: `${brandKit.shopName}-er sobcheye demanding "${productName}" ekhon restock hoyeche!\n\n• ${highlights.join("\n• ")}\n\n🎯 Ajker Special Offer Price: ৳${offerPrice} (Save ৳${saveAmount})\n⚡ Sara Bangladesh-e 48-72 ghontay fast home delivery!`,
        ctaLine: `💬 Order confirm korte apnar Naam, Thikana o Phone Number likhe Inbox korun!`,
      },
      {
        id: "story_hook",
        angleBn: "৩. কাস্টমার ডিমান্ড ও ফ্ল্যাশ ডিল কপি",
        angleEn: "3. Flash Deal & Urgency Hook",
        headline: `Prothom ৩০ jon customer-er jonno ধামাকা ${discount > 0 ? `${discount}%` : "Special"} Discount!`,
        body: `Apnাদের অসংখ্য রিকোয়েস্টের পর "${productName}" আবারও চলে এসেছে আমাদের স্টকে!\n\n✅ ${highlights[0]}\n✅ ${highlights[1]}\n✅ ${highlights[2]}\n\n💰 Offer Price: ৳${offerPrice} মাত্র!`,
        ctaLine: `📲 Direct Call / WhatsApp: ${brandKit.phoneWhatsapp} — Inbox button-e click korun ekhoni!`,
      },
    ];
  } else {
    adCopies = [
      {
        id: "offer_hook",
        angleBn: "১. সরাসরি অফার ও আর্জেন্সি হুক (Boost-এর জন্য সেরা)",
        angleEn: "1. Direct Offer & Urgency Hook (Best for Boost)",
        headline: `${productName} — এখন মাত্র ${priceOfferBn} (${discount > 0 ? `${toBanglaDigits(discount)}% ছাড়!` : "বিশেষ অফার!"})`,
        body: `ছবির সাথে বাস্তবের মিল না থাকার ভয়ে অনলাইনে অর্ডার করতে দ্বিধা করছেন?\n\n${brandKit.shopName} নিয়ে এসেছে ১০০% যাচাইকৃত প্রিমিয়াম মানের ${productName}!\n\nকেন এটি আপনার সেরা পছন্দ হবে?\n✅ ${highlights[0]}\n✅ ${highlights[1]}\n✅ ${highlights[2]}\n\n💰 রেগুলার প্রাইস: ${priceRegBn}\n🔥 আজকের অফার প্রাইস: মাত্র ${priceOfferBn}${saveAmount > 0 ? ` (সাশ্রয় ${saveBn}!)` : ""}\n\n🚚 ডেলিভারি চার্জ: ঢাকার ভেতরে ৳${toBanglaDigits(brandKit.deliveryInsideDhaka)} | ঢাকার বাইরে ৳${toBanglaDigits(brandKit.deliveryOutsideDhaka)}\n📦 ${brandKit.paymentPolicy}`,
        ctaLine: `👉 স্টক শেষ হওয়ার আগেই "Send Message" বাটনে ক্লিক করুন অথবা WhatsApp করুন: ${brandKit.phoneWhatsapp}`,
      },
      {
        id: "trust_hook",
        angleBn: "২. বিশ্বাস ও কোয়ালিটি গ্যারান্টি অ্যাঙ্গেল",
        angleEn: "2. Customer Trust & Zero-Risk COD Angle",
        headline: `আগে পণ্য হাতে পেয়ে কোয়ালিটি দেখুন, পছন্দ হলেই পেমেন্ট করুন!`,
        body: `সস্তা ও নকল পণ্যে সয়লাব বাজারে ${brandKit.shopName} সবসময় কথা নয়, কাজে বিশ্বাসী।\n\nআমাদের নতুন ${productName} ইতিমধ্যেই শত শত কাস্টমারের মন জয় করেছে:\n• ${highlights[0]}\n• ${highlights[1]}\n• ${highlights[2]}\n\n🎯 সীমিত স্টকের অফার মূল্য: ${priceOfferBn} (আগের দাম ${priceRegBn})\n⚡ কুরিয়ার ম্যানের সামনেই চেক করে রিসিভ করার সম্পূর্ণ সুবিধা!`,
        ctaLine: `💬 অর্ডার কনফার্ম করতে আপনার নাম, পূর্ণ ঠিকানা ও মোবাইল নম্বর লিখে এখনই ইনবক্স করুন!`,
      },
      {
        id: "story_hook",
        angleBn: "৩. রিস্টক অ্যালার্ট ও স্টোরিটেলিং পোস্ট",
        angleEn: "3. Restock Alert & Social Proof Angle",
        headline: `আপনাদের সবচেয়ে বেশি রিকোয়েস্ট করা "${productName}" আবারও স্টকে!`,
        body: `গত সপ্তাহে অনেকেই ইনবক্সে জিজ্ঞেস করেছিলেন কবে আবার রিস্টক হবে।\n\nসুখবর! নতুন ব্যাচ চলে এসেছে এবং প্রথম ৩০ জন অর্ডারকারীর জন্য থাকছে ${priceOfferBn} স্পেশাল প্রাইস!\n\n✨ বিশেষত্ব:\n✔ ${highlights[0]}\n✔ ${highlights[1]}\n✔ ${highlights[2]}\n\n📍 ঢাকায় ২৪-৪৮ ঘণ্টায় এবং সারা দেশে ২-৩ দিনে হোম ডেলিভারি।`,
        ctaLine: `📲 সরাসরি অর্ডার বা যেকোনো প্রশ্নে কল/WhatsApp করুন: ${brandKit.phoneWhatsapp}`,
      },
    ];
  }

  const inboxReplies: InboxReplyItem[] = [
    {
      id: "price_query",
      questionBn: 'কাস্টমার যখন লেখে: "দাম কত? / Price please"',
      questionEn: 'When customer asks: "Price please / Dam koto?"',
      tag: "কমেন্ট ও ইনবক্স",
      reply: `আসসালামু আলাইকুম! ধন্যবাদ ${brandKit.shopName}-এ মেসেজ দেওয়ার জন্য।\n\nআমাদের ${productName}-এর রেগুলার প্রাইস ${priceRegBn}, তবে বর্তমান অফারে পাচ্ছেন মাত্র ${priceOfferBn}!\n\n✅ ${highlights[0]}\n🚚 ডেলিভারি চার্জ: ঢাকার ভেতরে ৳${toBanglaDigits(brandKit.deliveryInsideDhaka)}, ঢাকার বাইরে ৳${toBanglaDigits(brandKit.deliveryOutsideDhaka)}।\n\nঅর্ডারটি কনফার্ম করতে আপনার নাম, সম্পূর্ণ ঠিকানা ও মোবাইল নম্বর দিন প্লিজ!`,
    },
    {
      id: "quality_doubt",
      questionBn: 'কাস্টমার যখন বলে: "ছবির মতো অরিজিনাল হবে তো?"',
      questionEn: 'When customer asks: "Will it match the photo?"',
      tag: "ট্রাস্ট বিল্ডিং",
      reply: `জি ১০০% নিশ্চিন্ত থাকুন! আমরা ঠিক যেটা ছবিতে দেখাচ্ছি হুবহু সেটিই পাবেন।\n\nসবচেয়ে বড় কথা—${brandKit.paymentPolicy}। ডেলিভারি ম্যানের সামনে প্যাকেট খুলে দেখে পছন্দ না হলে সাথে সাথে রিটার্ন করতে পারবেন। অর্ডার বুক করে রাখবো কি?`,
    },
    {
      id: "discount_bargain",
      questionBn: 'কাস্টমার যখন দাম কমাতে চায়: "একটু কম রাখা যাবে না?"',
      questionEn: 'When customer bargains: "Can you reduce the price?"',
      tag: "দামাদামি হ্যান্ডলিং",
      reply: `আপু/ভাইয়া, এটার রেগুলার প্রাইস ${priceRegBn} ছিল—অফার উপলক্ষে আমরা ইতিমধ্যেই ${saveAmount > 0 ? `${saveBn} ছাড় দিয়ে ` : ""}মাত্র ${priceOfferBn} নির্ধারণ করেছি, যাতে সবাই সেরা মানের পণ্যটি নিতে পারেন।\n\nতবে আপনি একসাথে ২টি অর্ডার করলে আমরা ডেলিভারি চার্জ সম্পূর্ণ ফ্রি করে দেবো! আপনার ঠিকানাটি পাঠিয়ে দিন, আজই ডিসপ্যাচ করে দিচ্ছি।`,
    },
    {
      id: "advance_cod",
      questionBn: 'ঢাকার বাইরের অর্ডারে: "ডেলিভারি চার্জ আগে বিকাশ করবো কেন?"',
      questionEn: 'Outside Dhaka COD: "Why advance delivery charge via bKash?"',
      tag: "COD কনভার্শন",
      reply: `খুব সুন্দর প্রশ্ন করেছেন! মূল পণ্যের টাকা (${priceOfferBn}) আপনি পণ্য হাতে পেয়ে ডেলিভারি ম্যানকেই দেবেন।\n\nশুধু ঢাকার বাইরে কুরিয়ার বুকিং নিশ্চিত করার জন্য ডেলিভারি চার্জ ৳${toBanglaDigits(brandKit.deliveryOutsideDhaka)} আমাদের বিকাশ/নগদ নম্বরে (${brandKit.phoneWhatsapp}) সেন্ড মানি করে শেষ ৪ ডিজিট জানালেই আপনার পার্সেল আজই বুক হয়ে যাবে ইনশাআল্লাহ!`,
    },
    {
      id: "order_confirm",
      questionBn: "অর্ডার কনফার্মেশন ও ইনভয়েস মেসেজ",
      questionEn: "Order Confirmation Summary Message",
      tag: "কনফার্মেশন",
      reply: `আলহামদুলিল্লাহ, আপনার অর্ডারটি কনফার্ম করা হয়েছে! 🎉\n\n🛍️ পণ্য: ${productName}\n💰 পণ্যের মূল্য: ${priceOfferBn}\n🚚 ডেলিভারি চার্জ: ঢাকা ৳${toBanglaDigits(brandKit.deliveryInsideDhaka)} / ঢাকার বাইরে ৳${toBanglaDigits(brandKit.deliveryOutsideDhaka)}\n📞 হেল্পলাইন/WhatsApp: ${brandKit.phoneWhatsapp}\n\nআগামী ২৪-৭২ ঘণ্টার মধ্যে ডেলিভারি ম্যান কল দিয়ে পার্সেল পৌঁছে দেবেন। ${brandKit.shopName}-এর সাথে থাকার জন্য ধন্যবাদ!`,
    },
    {
      id: "comment_short",
      questionBn: "পোস্টের নিচে কমেন্ট রিপ্লাই (FB Reach বাড়ানোর কৌশল)",
      questionEn: "Public Comment Reply (Boosts Organic Reach)",
      tag: "পাবলিক কমেন্ট",
      reply: `ধন্যবাদ আপনার আগ্রহের জন্য! 💝 অফার প্রাইস ও বিস্তারিত ছবি আপনার ইনবক্সে পাঠিয়ে দেওয়া হয়েছে—অনুগ্রহ করে মেসেঞ্জার রিকোয়েস্ট চেক করুন অথবা সরাসরি WhatsApp করুন: ${brandKit.phoneWhatsapp}`,
    },
  ];

  return {
    id: `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    productName: headline,
    regularPrice,
    offerPrice,
    features,
    copyStyle,
    posterConfig: {
      templateId,
      aspect,
      badgeText,
      headline,
      subline,
      highlights,
      ctaText,
      productImageUrl: productImageUrl || "/samples/kurti.png",
    },
    adCopies,
    inboxReplies,
    sourceEngine: "smart_engine",
    createdAt: new Date().toISOString(),
  };
}

export async function generateCampaignWithAiOrFallback(
  input: GenerateInput,
  settings: RuntimeSettings
): Promise<Campaign> {
  const base = buildSmartCampaign(input);
  const apiKey = settings.openRouterApiKey?.trim() || settings.openAiApiKey?.trim();
  if (!apiKey) {
    return base;
  }

  const isOpenRouter = Boolean(settings.openRouterApiKey?.trim());
  const endpoint = isOpenRouter
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";
  const model = isOpenRouter
    ? settings.aiModel || "openai/gpt-4o-mini"
    : "gpt-4o-mini";

  try {
    const prompt = `You are Bangladesh's top F-Commerce Facebook Ads strategist. Create marketing assets for:
Shop: ${input.brandKit.shopName} (${input.brandKit.tagline})
Phone/WhatsApp: ${input.brandKit.phoneWhatsapp}
Delivery: Inside Dhaka ৳${input.brandKit.deliveryInsideDhaka}, Outside Dhaka ৳${input.brandKit.deliveryOutsideDhaka}
Policy: ${input.brandKit.paymentPolicy}
Product: ${input.productName}
Regular Price: ৳${input.regularPrice}, Offer Price: ৳${input.offerPrice}
Features: ${input.features}
Output Language Style: ${input.copyStyle === "bn" ? "Natural persuasive Bengali script" : input.copyStyle === "banglish" ? "Natural Bangladeshi Banglish" : "Persuasive English"}

Return strictly valid JSON matching:
{
  "subline": "short punchy subline under 55 chars",
  "highlights": ["point 1", "point 2", "point 3"],
  "adCopies": [
    { "id": "offer_hook", "angleBn": "১. সরাসরি অফার ও আর্জেন্সি হুক", "angleEn": "1. Offer & Urgency Hook", "headline": "...", "body": "...", "ctaLine": "..." },
    { "id": "trust_hook", "angleBn": "২. বিশ্বাস ও কোয়ালিটি হুক", "angleEn": "2. Trust & COD Angle", "headline": "...", "body": "...", "ctaLine": "..." },
    { "id": "story_hook", "angleBn": "৩. স্টোরিটেলিং হুক", "angleEn": "3. Social Proof Hook", "headline": "...", "body": "...", "ctaLine": "..." }
  ]
}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!res.ok) return base;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return base;
    const parsed = JSON.parse(content);

    return {
      ...base,
      posterConfig: {
        ...base.posterConfig,
        subline: parsed.subline || base.posterConfig.subline,
        highlights:
          Array.isArray(parsed.highlights) && parsed.highlights.length >= 3
            ? parsed.highlights.slice(0, 3)
            : base.posterConfig.highlights,
      },
      adCopies:
        Array.isArray(parsed.adCopies) && parsed.adCopies.length >= 3
          ? parsed.adCopies
          : base.adCopies,
      sourceEngine: "cloud_ai",
    };
  } catch {
    return base;
  }
}

export function generateInstantCustomerReply(
  customerMessage: string,
  campaign: Campaign,
  brandKit: BrandKit
): string {
  const msg = customerMessage.toLowerCase();
  const offerBn = formatBdt(campaign.offerPrice, "bn");
  const regBn = formatBdt(campaign.regularPrice, "bn");

  if (
    msg.includes("কম") ||
    msg.includes("discount") ||
    msg.includes("koma") ||
    msg.includes("রাখা যাবে") ||
    msg.includes("last")
  ) {
    return `আসসালামু আলাইকুম! রেগুলার প্রাইস ${regBn} থেকে ছাড় দিয়ে এখন অফারে মাত্র ${offerBn} রাখা হয়েছে—তাই সিঙ্গেল পিসে আর কমানো সম্ভব হচ্ছে না। তবে ২টি একসাথে নিলে ডেলিভারি চার্জ ফ্রি করে দিতে পারবো! আপনার নাম ও ঠিকানাটি দেবেন কি?`;
  }

  if (
    msg.includes("দিন") ||
    msg.includes("কবে") ||
    msg.includes("delivery") ||
    msg.includes("ডেলিভারি") ||
    msg.includes("কত দিন") ||
    msg.includes("চিটা") ||
    msg.includes("ঢাকা")
  ) {
    return `জি, ঢাকার ভেতরে ২৪-৪৮ ঘণ্টায় (চার্জ ৳${toBanglaDigits(brandKit.deliveryInsideDhaka)}) এবং ঢাকার বাইরে দেশের যেকোনো জেলায় ২-৩ কার্যদিবসে (চার্জ ৳${toBanglaDigits(brandKit.deliveryOutsideDhaka)}) Steadfast / Pathao কুরিয়ারে হোম ডেলিভারি পাবেন। অর্ডার কনফার্ম করতে আপনার নাম, পূর্ণ ঠিকানা ও মোবাইল নম্বর পাঠিয়ে দিন!`;
  }

  if (
    msg.includes("নকল") ||
    msg.includes("অরিজিনাল") ||
    msg.includes("গ্যারান্টি") ||
    msg.includes("রিটার্ন") ||
    msg.includes("return") ||
    msg.includes("original")
  ) {
    return `১০০% নিশ্চিন্ত থাকুন! ${brandKit.shopName} থেকে আপনি ডেলিভারি ম্যানের সামনে প্যাকেট খুলে পণ্য চেক করে তারপর টাকা পরিশোধ করতে পারবেন। ছবির সাথে মিল না থাকলে ১ টাকাও পণ্যের দাম দিতে হবে না!`;
  }

  return `আসসালামু আলাইকুম! আপনার মেসেজের জন্য ধন্যবাদ। আমাদের ${campaign.productName} এখন স্পেশাল অফারে পাচ্ছেন মাত্র ${offerBn}!\n\n✅ ${campaign.posterConfig.highlights[0]}\n📦 ${brandKit.paymentPolicy} (ঢাকা ৳${toBanglaDigits(brandKit.deliveryInsideDhaka)} / ঢাকার বাইরে ৳${toBanglaDigits(brandKit.deliveryOutsideDhaka)})\n\nঅর্ডারটি বুক করতে আপনার নাম, ঠিকানা ও সচল মোবাইল নম্বর লিখে দিন, অথবা সরাসরি WhatsApp করুন: ${brandKit.phoneWhatsapp}`;
}
