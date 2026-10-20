import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function GET() {
  const db = await readDb();
  const freeLaunchMode = db.settings.freeLaunchMode !== false;

  return NextResponse.json({
    freeLaunchMode,
    payments: db.payments || [],
    waitlist: db.waitlist || [],
    totalAccountsCount: db.accounts?.length || 0,
    hasLiveAiKey: Boolean(
      db.settings.openRouterApiKey?.trim() || db.settings.openAiApiKey?.trim()
    ),
    settingsPreview: {
      freeLaunchMode,
      hasOpenRouter: Boolean(db.settings.openRouterApiKey?.trim()),
      hasOpenAi: Boolean(db.settings.openAiApiKey?.trim()),
      hasSupabase: Boolean(
        db.settings.supabaseUrl?.trim() && db.settings.supabaseKey?.trim()
      ),
      aiModel: db.settings.aiModel,
      paymentApprovalMode: db.settings.paymentApprovalMode || "auto",
      merchantBkash: db.settings.merchantBkash || "01700-889911",
      merchantNagad: db.settings.merchantNagad || "01800-889922",
      hasUddoktaPay: Boolean(db.settings.uddoktaPayApiKey?.trim()),
      uddoktaPayBaseUrl: db.settings.uddoktaPayBaseUrl,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await readDb();

    if (body.action === "join_waitlist") {
      const contact = String(body.contact || "").trim();
      const shopName = String(body.shopName || "").trim() || "F-Commerce Shop";
      if (!contact) {
        return NextResponse.json(
          { ok: false, error: "নম্বর বা ইমেইল লিখুন" },
          { status: 400 }
        );
      }
      const entry = {
        id: `wl_${Date.now()}`,
        shopName,
        contact,
        createdAt: new Date().toISOString(),
      };
      db.waitlist = [entry, ...(db.waitlist || [])];
      await writeDb(db);
      return NextResponse.json({ ok: true, waitlist: db.waitlist });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 400 }
    );
  }
}
