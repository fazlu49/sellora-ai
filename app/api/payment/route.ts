import { NextResponse } from "next/server";
import { PLAN_CATALOG, readDb, writeDb } from "@/lib/db";
import { PlanTier } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = readDb();

    // Admin action: approve or reject a pending personal MFS payment
    if (body.action === "review_payment" && body.paymentId) {
      const target = db.payments.find((p) => p.id === body.paymentId);
      if (target && target.status === "pending") {
        if (body.decision === "approve") {
          target.status = "completed";
          db.user.plan = target.plan;
          db.user.credits += target.creditsAdded;
        } else {
          target.status = "rejected";
        }
        writeDb(db);
      }
      return NextResponse.json({
        ok: true,
        user: db.user,
        payments: db.payments,
      });
    }

    const plan = (body.plan as PlanTier) || "starter";
    const planInfo = PLAN_CATALOG[plan] || PLAN_CATALOG.starter;
    const method = (body.method as "bkash" | "nagad" | "rocket") || "bkash";
    const senderNumber = String(body.senderNumber || "01711-000000").trim();
    const trxId =
      String(body.trxId || "").trim() ||
      `TRX${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    if (body.mode === "live_gateway" && db.settings.uddoktaPayApiKey?.trim()) {
      const origin = req.headers.get("origin") || "http://localhost:3000";
      const gatewayRes = await fetch(db.settings.uddoktaPayBaseUrl, {
        method: "POST",
        headers: {
          "RT-UDDOKTAPAY-API-KEY": db.settings.uddoktaPayApiKey.trim(),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          full_name: db.user.name,
          email: db.user.email,
          amount: String(planInfo.priceBdt),
          metadata: { plan, user_id: db.user.id },
          redirect_url: `${origin}/?payment=success&plan=${plan}`,
          cancel_url: `${origin}/?payment=cancelled`,
        }),
      });
      const gatewayJson = await gatewayRes.json();
      if (gatewayJson?.payment_url) {
        return NextResponse.json({
          ok: true,
          redirectUrl: gatewayJson.payment_url,
        });
      }
    }

    const isManualQueue = db.settings.paymentApprovalMode === "manual";

    if (!isManualQueue) {
      db.user.plan = plan;
      db.user.credits += planInfo.credits;
    }

    const record = {
      id: `pay_${Date.now()}`,
      plan,
      creditsAdded: planInfo.credits,
      amountBdt: planInfo.priceBdt,
      method,
      senderNumber,
      trxId,
      status: isManualQueue ? ("pending" as const) : ("completed" as const),
      createdAt: new Date().toISOString(),
    };

    db.payments = [record, ...db.payments];
    writeDb(db);

    return NextResponse.json({
      ok: true,
      pendingReview: isManualQueue,
      user: db.user,
      payment: record,
      payments: db.payments,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 400 }
    );
  }
}
