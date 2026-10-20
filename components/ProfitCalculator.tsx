"use client";

import React, { useState } from "react";
import { Calculator, TrendingUp, TriangleAlert } from "lucide-react";
import { Language } from "@/lib/types";

export function ProfitCalculator({ lang }: { lang: Language }) {
  const [buyCost, setBuyCost] = useState(750);
  const [sellPrice, setSellPrice] = useState(1390);
  const [packagingCost, setPackagingCost] = useState(25);
  const [totalOrders, setTotalOrders] = useState(50);
  const [adCostUsdPerOrder, setAdCostUsdPerOrder] = useState(1.1);
  const [usdRateBdt, setUsdRateBdt] = useState(126);
  const [returnRatePct, setReturnRatePct] = useState(8);

  const returnedOrders = Math.round((totalOrders * returnRatePct) / 100);
  const deliveredOrders = Math.max(0, totalOrders - returnedOrders);

  const totalRevenue = deliveredOrders * sellPrice;
  const totalProductCost = deliveredOrders * buyCost;
  const totalPackagingCost = totalOrders * packagingCost;
  const totalAdUsd = totalOrders * adCostUsdPerOrder;
  const totalAdBdt = Math.round(totalAdUsd * usdRateBdt);
  // Average courier return charge penalty in BD (~৳90 per returned parcel)
  const returnCourierLoss = returnedOrders * 90;

  const netProfit =
    totalRevenue -
    totalProductCost -
    totalPackagingCost -
    totalAdBdt -
    returnCourierLoss;
  const profitPerDelivered =
    deliveredOrders > 0 ? Math.round(netProfit / deliveredOrders) : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {lang === "bn"
                ? "F-Commerce আসল লাভ ও Facebook Boost ক্যালকুলেটর"
                : "F-Commerce True Net Profit & Meta Ads ROI Calculator"}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === "bn"
                ? "ডলার বুস্ট খরচ, প্যাকেজিং ও পার্সেল রিটার্ন বাদ দেওয়ার পর আপনার পকেটে আসল কত টাকা লাভ থাকবে তা আগে থেকেই জেনে নিন!"
                : "Calculate your exact pocket profit after USD ad spend, packaging, and courier return losses."}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Inputs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                {lang === "bn"
                  ? "পণ্যের কেনা দাম (প্রতি পিস ৳)"
                  : "Product Buying Cost (৳)"}
              </label>
              <input
                type="number"
                value={buyCost}
                onChange={(e) => setBuyCost(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                {lang === "bn"
                  ? "বিক্রয় অফার দাম (প্রতি পিস ৳)"
                  : "Selling Offer Price (৳)"}
              </label>
              <input
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3.5 py-2.5 text-sm font-bold text-rose-700"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                {lang === "bn"
                  ? "প্যাকেজিং খরচ (বক্স/পলি প্রতি অর্ডার ৳)"
                  : "Packaging Cost / Order (৳)"}
              </label>
              <input
                type="number"
                value={packagingCost}
                onChange={(e) => setPackagingCost(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                {lang === "bn" ? "মোট অর্ডার সংখ্যা (টার্গেট)" : "Total Orders"}
              </label>
              <input
                type="number"
                value={totalOrders}
                onChange={(e) => setTotalOrders(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                {lang === "bn"
                  ? "প্রতি অর্ডারে গড় বুস্ট খরচ ($ USD)"
                  : "Ad Spend per Order ($ USD)"}
              </label>
              <input
                type="number"
                step="0.1"
                value={adCostUsdPerOrder}
                onChange={(e) => setAdCostUsdPerOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                {lang === "bn"
                  ? "ব্যাংক/কার্ড ডলার রেট (৳)"
                  : "USD Rate in BDT (৳)"}
              </label>
              <input
                type="number"
                value={usdRateBdt}
                onChange={(e) => setUsdRateBdt(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>
                  {lang === "bn"
                    ? "আনুমানিক কুরিয়ার পার্সেল রিটার্ন রেট (%):"
                    : "Estimated Courier Return Rate (%):"}
                </span>
                <span className="text-rose-600">
                  {returnRatePct}% ({returnedOrders}টি রিটার্ন)
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={35}
                value={returnRatePct}
                onChange={(e) => setReturnRatePct(Number(e.target.value))}
                className="mt-2 w-full accent-rose-600"
              />
            </div>
          </div>

          {/* Live Profit Result Card */}
          <div className="flex flex-col justify-between rounded-3xl bg-slate-950 p-6 text-white lg:col-span-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>সফল ডেলিভারি ({deliveredOrders}টি বিক্রি):</span>
                <span className="font-bold text-white">
                  ৳{totalRevenue.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>মোট পণ্যের কেনা খরচ:</span>
                <span>- ৳{totalProductCost.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  মোট Facebook Boost (${totalAdUsd.toFixed(1)}):
                </span>
                <span className="text-rose-300">
                  - ৳{totalAdBdt.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>প্যাকেজিং ও রিটার্ন চার্জ লস:</span>
                <span>
                  - ৳{(totalPackagingCost + returnCourierLoss).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="my-5 border-t border-white/15 pt-4">
              <p className="text-xs font-bold text-slate-400 uppercase">
                {lang === "bn"
                  ? "সব খরচ বাদে আপনার পকেটে নিট লাভ"
                  : "Your True Net Pocket Profit"}
              </p>
              <p
                className={`mt-1 text-3xl font-extrabold ${
                  netProfit >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                ৳{netProfit.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs text-slate-300">
                প্রতি সফল ডেলিভারিতে নিট লাভ:{" "}
                <strong className="text-amber-300">
                  ৳{profitPerDelivered.toLocaleString("en-IN")}
                </strong>
              </p>
            </div>

            {netProfit > 0 ? (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/15 p-3 text-xs font-bold text-emerald-300">
                <TrendingUp className="h-4 w-4 shrink-0" />
                <span>
                  দারুণ মার্জিন! এই দামে নিশ্চিন্তে বুস্ট ক্যাম্পেইন স্কেল করতে পারেন।
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl bg-rose-500/20 p-3 text-xs font-bold text-rose-300">
                <TriangleAlert className="h-4 w-4 shrink-0" />
                <span>
                  সতর্কতা: এই দামে বুস্ট করলে লস হবে! বিক্রয় মূল্য বাড়ান অথবা ২ পিস কম্বো অফার দিন।
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
