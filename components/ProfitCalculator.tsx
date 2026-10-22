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

  // Recommended selling price for healthy ৳300 net profit per delivered parcel
  const totalFixedPerDelivered =
    deliveredOrders > 0
      ? buyCost +
        Math.round(
          (totalPackagingCost + totalAdBdt + returnCourierLoss) /
            deliveredOrders
        )
      : buyCost + 250;
  const recommendedPrice = Math.ceil((totalFixedPerDelivered + 300) / 10) * 10;
  const [copiedReport, setCopiedReport] = useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {lang === "bn"
                  ? "প্রো লাভ, রিটার্ন লস ও Facebook Boost ক্যালকুলেটর"
                  : "Pro Net Profit, Return Loss & Meta Ads Calculator"}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === "bn"
                  ? "ডলার বুস্ট খরচ, প্যাকেজিং ও পার্সেল রিটার্ন বাদে আসল নিট লাভ ও সঠিক বিক্রয়মূল্য বের করুন!"
                  : "Calculate pocket profit & ideal selling price after ad spend and returns."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { bn: "👗 ফ্যাশন", buy: 750, sell: 1450, pkg: 30, ad: 1.1, ret: 10 },
              { bn: "🍯 ফুড", buy: 520, sell: 990, pkg: 45, ad: 0.9, ret: 5 },
              { bn: "⌚ গ্যাজেট", buy: 1050, sell: 1890, pkg: 35, ad: 1.3, ret: 12 },
              { bn: "💄 কসমেটিকস", buy: 480, sell: 950, pkg: 25, ad: 1.0, ret: 7 },
            ].map((p) => (
              <button
                key={p.bn}
                type="button"
                onClick={() => {
                  setBuyCost(p.buy);
                  setSellPrice(p.sell);
                  setPackagingCost(p.pkg);
                  setAdCostUsdPerOrder(p.ad);
                  setReturnRatePct(p.ret);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
              >
                {p.bn}
              </button>
            ))}
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
              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
                💡 অন্তত <strong>৳৩০০/পিস</strong> নিট লাভ রাখতে প্রস্তাবিত দাম:{" "}
                <button
                  type="button"
                  onClick={() => setSellPrice(recommendedPrice)}
                  className="ml-1 rounded-md bg-amber-400 px-2 py-0.5 text-[11px] font-black text-slate-950 hover:bg-amber-300"
                >
                  ৳{recommendedPrice} বসান
                </button>
              </div>
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
                  সতর্কতা: এই দামে বুস্ট করলে লস হবে! উপরের প্রস্তাবিত দামটি ব্যবহার করুন।
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(
                  `📊 লাভ রিপোর্ট (${totalOrders} অর্ডার)\nবিক্রয়মূল্য: ৳${sellPrice} | কেনা: ৳${buyCost}\nবুস্ট খরচ: ৳${totalAdBdt} | নিট লাভ: ৳${netProfit} (৳${profitPerDelivered}/পিস)`
                );
                setCopiedReport(true);
                setTimeout(() => setCopiedReport(false), 1800);
              }}
              className="mt-3 w-full rounded-xl bg-white/10 py-2.5 text-xs font-bold text-white transition hover:bg-rose-600"
            >
              {copiedReport ? "✓ রিপোর্ট কপি হয়েছে!" : "📋 পুরো হিসাব রিপোর্ট কপি করুন"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
