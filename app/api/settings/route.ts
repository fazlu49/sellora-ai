import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await readDb();

    const expectedPin =
      db.settings.founderAdminPin || process.env.FOUNDER_ADMIN_PIN || "492026";
    if (String(body.adminPin || "").trim() !== expectedPin) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: সঠিক অ্যাডমিন পিন প্রয়োজন।" },
        { status: 401 }
      );
    }

    if (typeof body.newAdminPin === "string" && body.newAdminPin.trim().length >= 4) {
      db.settings.founderAdminPin = body.newAdminPin.trim();
    }
    if (typeof body.freeLaunchMode === "boolean") {
      db.settings.freeLaunchMode = body.freeLaunchMode;
    }
    if (typeof body.openRouterApiKey === "string") {
      db.settings.openRouterApiKey = body.openRouterApiKey.trim();
    }
    if (typeof body.openAiApiKey === "string") {
      db.settings.openAiApiKey = body.openAiApiKey.trim();
    }
    if (typeof body.aiModel === "string" && body.aiModel.trim()) {
      db.settings.aiModel = body.aiModel.trim();
    }
    if (typeof body.supabaseUrl === "string") {
      db.settings.supabaseUrl = body.supabaseUrl.trim();
    }
    if (typeof body.supabaseKey === "string") {
      db.settings.supabaseKey = body.supabaseKey.trim();
    }
    if (body.paymentApprovalMode === "auto" || body.paymentApprovalMode === "manual") {
      db.settings.paymentApprovalMode = body.paymentApprovalMode;
    }
    if (typeof body.merchantBkash === "string" && body.merchantBkash.trim()) {
      db.settings.merchantBkash = body.merchantBkash.trim();
    }
    if (typeof body.merchantNagad === "string" && body.merchantNagad.trim()) {
      db.settings.merchantNagad = body.merchantNagad.trim();
    }
    if (typeof body.uddoktaPayApiKey === "string") {
      db.settings.uddoktaPayApiKey = body.uddoktaPayApiKey.trim();
    }

    await writeDb(db);
    return NextResponse.json({
      ok: true,
      activeAdminPin: db.settings.founderAdminPin,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 400 }
    );
  }
}
