"use client";

import React, { useState } from "react";
import { Language, PLAN_CATALOG, PlanTier } from "@/lib/types";
import { CheckCircle2, ShieldCheck, X, Zap } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  lang: Language;
  selectedPlan: PlanTier;
  onClose: () => void;
  onSuccess: (plan: PlanTier, method: "bkash" | "nagad" | "rocket", senderNumber: string, trxId: string) => Promise<void>;
}

const METHODS: Array<{
  id: "bkash" | "nagad" | "rocket";
  labelBn: string;
  labelEn: string;
  color: string;
  merchantNo: string;
}> = [
  {
    id: "bkash",
    labelBn: "বিকাশ (bKash)",
    labelEn: "bKash",
    color: "#E2136E",
    merchantNo: "01700-889911",
  },
  {
    id: "nagad",
    labelBn: "নগদ (Nagad)",
    labelEn: "Nagad",
    color: "#F7941D",
    merchantNo: "01800-889922",
  },
  {
    id: "rocket",
    labelBn: "রকেট (Rocket)",
    labelEn: "Rocket",
    color: "#8C3494",
    merchantNo: "01900-889933-4",
  },
];

export function PaymentModal({
  open,
  lang,
  selectedPlan,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [method, setMethod] = useState<"bkash" | "nagad" | "rocket">("bkash");
  const [senderNumber, setSenderNumber] = useState("01715-345678");
  const [trxId, setTrxId] = useState("BK98X72Q4M");
  const [verifying, setVerifying] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const plan = PLAN_CATALOG[selectedPlan] || PLAN_CATALOG.starter;
  const activeMethod = METHODS.find((m) => m.id === method) || METHODS[0];

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      await onSuccess(selectedPlan, method, senderNumber, trxId);
      setDone(true);
      setTimeout(() => {
        setDone(false);
        onClose();
      }, 1100);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header Bar */}
        <div
          className="flex items-center justify-between px-6 py-5 text-white transition-colors"
          style={{ backgroundColor: activeMethod.color }}
        >
          <div>
            <span className="text-xs font-semibold tracking-wider text-white/85 uppercase">
              UddoktaPay Instant Checkout
            </span>
            <h3 className="text-xl font-bold">
              {lang === "bn" ? plan.nameBn : plan.nameEn} — ৳{plan.priceBdt}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment modal"
            className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">
              {lang === "bn"
                ? "পেমেন্ট সফলভাবে ভেরিফাই হয়েছে!"
                : "Payment Verified Instantly!"}
            </h4>
            <p className="mt-1 text-sm text-slate-600">
              +{plan.credits} {lang === "bn" ? "টি AI ক্রেডিট আপনার অ্যাকাউন্টে যোগ হয়েছে।" : "AI Credits added to your account."}
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="space-y-5 p-6">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                {lang === "bn" ? "পেমেন্ট মাধ্যম বেছে নিন" : "Select MFS Wallet"}
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setMethod(m.id);
                      setTrxId(
                        `${m.id.slice(0, 2).toUpperCase()}${Math.random()
                          .toString(36)
                          .substring(2, 8)
                          .toUpperCase()}`
                      );
                    }}
                    className={`rounded-xl border px-3 py-2.5 text-center text-xs font-bold transition ${
                      method === m.id
                        ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {lang === "bn" ? m.labelBn : m.labelEn}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">
                  {lang === "bn" ? "মার্চেন্ট / পার্সোনাল নম্বর:" : "Send Money / Payment Number:"}
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {activeMethod.merchantNo}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-slate-500">
                  {lang === "bn" ? "মোট পরিমাণ:" : "Amount Payable:"}
                </span>
                <span className="font-bold text-rose-600">
                  ৳{plan.priceBdt} (+{plan.credits} {lang === "bn" ? "ক্রেডিট" : "Credits"})
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  {lang === "bn" ? "আপনার যে নম্বর থেকে টাকা পাঠিয়েছেন" : "Sender Mobile Number"}
                </label>
                <input
                  type="text"
                  required
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    {lang === "bn" ? "Transaction ID (TrxID)" : "Transaction ID (TrxID)"}
                  </label>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                    {lang === "bn" ? "টেস্ট স্যান্ডবক্স চালু" : "Sandbox Ready"}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-base font-bold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
              style={{ backgroundColor: activeMethod.color }}
            >
              <Zap className="h-4 w-4" />
              {verifying
                ? lang === "bn"
                  ? "TrxID যাচাই হচ্ছে..."
                  : "Verifying TrxID..."
                : lang === "bn"
                ? `পেমেন্ট ভেরিফাই ও +${plan.credits} ক্রেডিট নিন`
                : `Verify Payment & Unlock +${plan.credits} Credits`}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>
                {lang === "bn"
                  ? "UddoktaPay / SSLCommerz অটো-ভেরিফিকেশন আর্কিটেকচার"
                  : "Powered by UddoktaPay / SSLCommerz Webhook Architecture"}
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
