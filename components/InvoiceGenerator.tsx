"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { BrandKit, Language } from "@/lib/types";
import { formatBdt } from "@/lib/ai-engine";
import { Check, Copy, Download, Plus, ReceiptText, Trash2 } from "lucide-react";

interface InvoiceItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export function InvoiceGenerator({
  lang,
  brandKit,
  prefillItem,
}: {
  lang: Language;
  brandKit: BrandKit;
  prefillItem?: { name: string; price: number } | null;
}) {
  const [invoiceNo] = useState(
    () => `INV-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryZone, setDeliveryZone] = useState<"inside" | "outside" | "free">(
    "inside"
  );
  const [discountAmount, setDiscountAmount] = useState<string>("0");
  const [orderNote, setOrderNote] = useState<string>("");
  const [invoiceTheme, setInvoiceTheme] = useState<string>(
    brandKit.primaryColor || "#e11d48"
  );
  const [advancePaid, setAdvancePaid] = useState<string>("0");
  const [items, setItems] = useState<InvoiceItem[]>(() =>
    prefillItem && prefillItem.name
      ? [{ id: "it_1", name: prefillItem.name, qty: 1, price: prefillItem.price || 0 }]
      : [{ id: "it_1", name: "", qty: 1, price: 0 }]
  );
  const [copiedCourier, setCopiedCourier] = useState(false);

  useEffect(() => {
    if (prefillItem && prefillItem.name) {
      setItems((prev) => {
        if (prev.length === 1 && !prev[0].name.trim()) {
          return [{ id: "it_1", name: prefillItem.name, qty: 1, price: prefillItem.price || 0 }];
        }
        if (prev[0]?.name === prefillItem.name) return prev;
        return [{ id: "it_1", name: prefillItem.name, qty: 1, price: prefillItem.price || 0 }, ...prev.filter((p) => p.name.trim())];
      });
    }
  }, [prefillItem]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const deliveryCharge =
    deliveryZone === "free"
      ? 0
      : deliveryZone === "inside"
      ? Number(brandKit.deliveryInsideDhaka ?? 70)
      : Number(brandKit.deliveryOutsideDhaka ?? 130);

  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.qty || 0) * Number(it.price || 0),
    0
  );
  const discountNum = Math.max(0, Number(discountAmount) || 0);
  const advanceNum = Math.max(0, Number(advancePaid) || 0);
  const totalBill = Math.max(0, subtotal - discountNum) + deliveryCharge;
  const codDue = Math.max(0, totalBill - advanceNum);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: `it_${Date.now()}`, name: "", qty: 1, price: 0 },
    ]);
  };

  const updateItem = (
    id: string,
    field: "name" | "qty" | "price",
    val: string
  ) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              [field]: field === "name" ? val : Math.max(0, Number(val) || 0),
            }
          : it
      )
    );
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  useEffect(() => {
    let cancelled = false;
    const renderMemo = async () => {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {
          // ignore
        }
      }
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = 1000;
      const H = Math.max(1080, 760 + items.length * 68);
      canvas.width = W;
      canvas.height = H;

      const font = `"Hind Siliguri", "Plus Jakarta Sans", sans-serif`;
      const primary = invoiceTheme || brandKit.primaryColor || "#e11d48";
      const shopTitle = brandKit.shopName?.trim() || "আপনার অনলাইন শপ";
      const shopPhone = brandKit.phoneWhatsapp?.trim() || "01XXXXXXXXX";
      const isEn = lang === "en";

      // Clean white invoice paper background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // Top Brand Header Banner
      ctx.fillStyle = primary === "#0f172a" ? "#090d1a" : "#0f172a";
      ctx.fillRect(0, 0, W, 190);
      ctx.fillStyle = primary;
      ctx.fillRect(0, 180, W, 10);

      // Shop Name & Contact Left
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 42px ${font}`;
      ctx.fillText(shopTitle.slice(0, 28), 56, 86);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = `500 22px ${font}`;
      ctx.fillText(
        `${isEn ? "Helpline / WhatsApp:" : "হেল্পলাইন / WhatsApp:"} ${shopPhone}`,
        56,
        128
      );
      ctx.fillStyle = "#94a3b8";
      ctx.font = `500 19px ${font}`;
      ctx.fillText(
        (brandKit.tagline || "বিশ্বস্ত অনলাইন শপ • সারা দেশে হোম ডেলিভারি").slice(0, 50),
        56,
        160
      );

      // Invoice Badge Right
      ctx.textAlign = "right";
      ctx.fillStyle = "#fde047";
      ctx.font = `700 34px ${font}`;
      ctx.fillText(isEn ? "CASH MEMO / INVOICE" : "ডিজিটাল ক্যাশ মেমো", W - 56, 84);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = `600 21px ${font}`;
      ctx.fillText(`#${invoiceNo}`, W - 56, 122);
      ctx.fillStyle = "#94a3b8";
      ctx.font = `500 19px ${font}`;
      ctx.fillText(
        new Date().toLocaleDateString(isEn ? "en-GB" : "bn-BD"),
        W - 56,
        154
      );
      ctx.textAlign = "left";

      // Customer Details Box
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(56, 224, W - 112, 168, 22);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = primary;
      ctx.font = `700 21px ${font}`;
      ctx.fillText(
        isEn ? "CUSTOMER DELIVERY DETAILS" : "কাস্টমারের নাম ও ডেলিভারি ঠিকানা",
        84,
        264
      );

      ctx.fillStyle = "#0f172a";
      ctx.font = `700 28px ${font}`;
      ctx.fillText(
        customerName.trim() || (isEn ? "Customer Name" : "কাস্টমারের নাম"),
        84,
        306
      );

      ctx.textAlign = "right";
      ctx.fillStyle = "#0f172a";
      ctx.font = `700 26px ${font}`;
      ctx.fillText(
        `📞 ${customerPhone.trim() || "01XXXXXXXXX"}`,
        W - 84,
        306
      );
      ctx.textAlign = "left";

      ctx.fillStyle = "#475569";
      ctx.font = `500 22px ${font}`;
      ctx.fillText(
        `📍 ${(
          customerAddress.trim() ||
          (isEn ? "Full Delivery Address" : "কাস্টমারের সম্পূর্ণ ঠিকানা")
        ).slice(0, 62)}${orderNote.trim() ? `  •  📝 ${orderNote.trim().slice(0, 28)}` : ""}`,
        84,
        352
      );

      // Table Header
      const tableY = 426;
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.roundRect(56, tableY, W - 112, 58, 14);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = `700 21px ${font}`;
      ctx.fillText(isEn ? "Item Description" : "পণ্যের বিবরণ", 82, tableY + 37);
      ctx.textAlign = "center";
      ctx.fillText(isEn ? "Qty" : "সংখ্যা", 620, tableY + 37);
      ctx.textAlign = "right";
      ctx.fillText(isEn ? "Rate" : "দর", 775, tableY + 37);
      ctx.fillText(isEn ? "Total" : "মোট টাকা", W - 82, tableY + 37);
      ctx.textAlign = "left";

      // Table Rows
      let rowY = tableY + 66;
      items.forEach((it, idx) => {
        if (idx % 2 === 1) {
          ctx.fillStyle = "#f8fafc";
          ctx.fillRect(56, rowY, W - 112, 62);
        }
        ctx.fillStyle = "#0f172a";
        ctx.font = `600 23px ${font}`;
        const label =
          it.name.trim() ||
          (isEn ? `Product Item #${idx + 1}` : `পণ্য নং #${idx + 1}`);
        ctx.fillText(`${idx + 1}. ${label.slice(0, 34)}`, 82, rowY + 40);

        ctx.textAlign = "center";
        ctx.fillText(String(it.qty || 1), 620, rowY + 40);

        ctx.textAlign = "right";
        ctx.fillText(
          formatBdt(it.price, isEn ? "en" : "bn"),
          775,
          rowY + 40
        );
        ctx.font = `700 23px ${font}`;
        ctx.fillText(
          formatBdt((it.qty || 0) * (it.price || 0), isEn ? "en" : "bn"),
          W - 82,
          rowY + 40
        );
        ctx.textAlign = "left";

        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(56, rowY + 62);
        ctx.lineTo(W - 56, rowY + 62);
        ctx.stroke();

        rowY += 64;
      });

      // Summary Totals + QR Code Box at Bottom
      const sumY = rowY + 34;

      // QR Code on Bottom Left
      try {
        const cleanDigits = shopPhone.replace(/\D/g, "");
        const waTarget = cleanDigits
          ? `https://wa.me/88${cleanDigits.replace(/^88/, "")}`
          : "https://sellorabd.vercel.app";
        const qrDataUrl = await QRCode.toDataURL(waTarget, {
          width: 150,
          margin: 1,
          color: { dark: "#0f172a", light: "#ffffff" },
        });
        const qrImg = new Image();
        await new Promise<void>((res) => {
          qrImg.onload = () => res();
          qrImg.onerror = () => res();
          qrImg.src = qrDataUrl;
        });
        ctx.drawImage(qrImg, 64, sumY, 138, 138);
        ctx.fillStyle = "#64748b";
        ctx.font = `600 17px ${font}`;
        ctx.fillText(
          isEn ? "Scan for Support / Order" : "স্ক্যান করে যোগাযোগ করুন",
          64,
          sumY + 162
        );
      } catch {
        // ignore qr error
      }

      // Summary Lines on Bottom Right
      const rightLabelX = 520;
      const rightValX = W - 76;

      ctx.font = `600 23px ${font}`;
      ctx.fillStyle = "#475569";
      ctx.fillText(isEn ? "Subtotal:" : "পণ্যের মোট মূল্য:", rightLabelX, sumY + 30);
      ctx.textAlign = "right";
      ctx.fillStyle = "#0f172a";
      ctx.fillText(formatBdt(subtotal, isEn ? "en" : "bn"), rightValX, sumY + 30);

      ctx.textAlign = "left";
      ctx.fillStyle = "#475569";
      ctx.fillText(isEn ? "Delivery Charge:" : "ডেলিভারি চার্জ:", rightLabelX, sumY + 68);
      ctx.textAlign = "right";
      ctx.fillStyle = "#0f172a";
      ctx.fillText(
        formatBdt(deliveryCharge, isEn ? "en" : "bn"),
        rightValX,
        sumY + 68
      );

      ctx.textAlign = "left";
      ctx.fillStyle = "#059669";
      ctx.fillText(
        isEn ? "Advance / Discount (-):" : "অগ্রিম / ছাড় বাদে (-):",
        rightLabelX,
        sumY + 106
      );
      ctx.textAlign = "right";
      ctx.fillText(
        formatBdt(advanceNum + discountNum, isEn ? "en" : "bn"),
        rightValX,
        sumY + 106
      );
      ctx.textAlign = "left";

      // Payment Stamp Seal above QR
      ctx.save();
      const stampText =
        codDue === 0 && totalBill > 0
          ? "✓ FULL PAID"
          : advanceNum > 0
          ? "✓ ADVANCE CONFIRMED"
          : "CASH ON DELIVERY";
      ctx.strokeStyle = codDue === 0 && totalBill > 0 ? "#059669" : primary;
      ctx.fillStyle = codDue === 0 && totalBill > 0 ? "#059669" : primary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(230, sumY + 34, 232, 64, 14);
      ctx.stroke();
      ctx.font = `800 20px ${font}`;
      ctx.textAlign = "center";
      ctx.fillText(stampText, 346, sumY + 73);
      ctx.textAlign = "left";
      ctx.restore();

      // Highlighted COD Due Banner
      const dueBoxY = sumY + 128;
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.roundRect(496, dueBoxY, W - 552, 82, 20);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = `700 24px ${font}`;
      ctx.fillText(
        isEn ? "COD Due Amount:" : "পরিশোধযোগ্য (COD):",
        522,
        dueBoxY + 50
      );
      ctx.textAlign = "right";
      ctx.font = `700 36px ${font}`;
      ctx.fillText(
        formatBdt(codDue, isEn ? "en" : "bn"),
        W - 80,
        dueBoxY + 53
      );
      ctx.textAlign = "left";

      // Footer thank you note
      ctx.fillStyle = "#64748b";
      ctx.font = `600 20px ${font}`;
      ctx.textAlign = "center";
      ctx.fillText(
        `${shopTitle}-এ অর্ডার করার জন্য আন্তরিক ধন্যবাদ! • ডেলিভারি ম্যানের সামনে পণ্য চেক করে নিন।`,
        W / 2,
        H - 36
      );
      ctx.textAlign = "left";
    };

    renderMemo();
    return () => {
      cancelled = true;
    };
  }, [
    brandKit,
    customerAddress,
    customerName,
    customerPhone,
    deliveryCharge,
    discountNum,
    invoiceTheme,
    orderNote,
    totalBill,
    advanceNum,
    items,
    invoiceNo,
    lang,
    subtotal,
    codDue,
  ]);

  const handleDownloadInvoice = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `cash-memo-${customerPhone || invoiceNo}.png`;
    a.href = canvas.toDataURL("image/png", 1.0);
    a.click();
  };

  const handleCopyCourierSlip = () => {
    const itemSummary = items
      .map((i) => `${i.name || "Product"} x${i.qty}`)
      .join(", ");
    const slip = `📦 অর্ডার স্লিপ (#${invoiceNo})
👤 নাম: ${customerName || "—"}
📞 মোবাইল: ${customerPhone || "—"}
📍 ঠিকানা: ${customerAddress || "—"}
🛍️ পণ্য: ${itemSummary}
💰 কুরিয়ার কালেকশন (COD Amount): ৳${codDue}`;
    navigator.clipboard.writeText(slip);
    setCopiedCourier(true);
    setTimeout(() => setCopiedCourier(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-7 xl:grid-cols-12">
      {/* Left Form */}
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6 xl:col-span-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {lang === "bn"
                ? "ডিজিটাল ক্যাশ মেমো ও কুরিয়ার স্লিপ"
                : "Branded Cash Memo & Parcel Slip"}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === "bn"
                ? "মেসেঞ্জার/WhatsApp-এ কাস্টমারকে পাঠালে অর্ডার ক্যানসেল অর্ধেক কমে যায়!"
                : "Send branded digital invoices on Messenger to build instant customer trust."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              {lang === "bn" ? "কাস্টমারের নাম *" : "Customer Name *"}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={lang === "bn" ? "যেমন: নুসরাত জাহান" : "Customer Name"}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              {lang === "bn" ? "কাস্টমারের মোবাইল *" : "Customer Phone *"}
            </label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">
            {lang === "bn"
              ? "ডেলিভারি ঠিকানা (বাসা, থানা ও জেলা)"
              : "Full Delivery Address"}
          </label>
          <input
            type="text"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            placeholder={
              lang === "bn"
                ? "যেমন: বাসা ১২, রোড ৫, ধানমন্ডি, ঢাকা"
                : "House, Road, Area, District"
            }
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900"
          />
        </div>

        {/* Itemized Products */}
        <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-800">
              {lang === "bn" ? "অর্ডারকৃত পণ্যের তালিকা" : "Ordered Items"}
            </span>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700"
            >
              <Plus className="h-3 w-3" />
              <span>{lang === "bn" ? "পণ্য যোগ" : "Add Item"}</span>
            </button>
          </div>

          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 items-center gap-1.5">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(item.id, "name", e.target.value)}
                placeholder={
                  lang === "bn" ? `পণ্য #${index + 1}-এর নাম` : "Item name"
                }
                className="col-span-6 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900"
              />
              <input
                type="number"
                min={1}
                value={item.qty}
                onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                placeholder="সংখ্যা"
                className="col-span-2 rounded-lg border border-slate-200 bg-white px-2 py-2 text-center text-xs font-bold text-slate-900"
              />
              <input
                type="number"
                min={0}
                value={item.price || ""}
                onChange={(e) => updateItem(item.id, "price", e.target.value)}
                placeholder="দাম ৳"
                className="col-span-3 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-rose-700"
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="col-span-1 flex justify-center text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              {lang === "bn" ? "ডেলিভারি এরিয়া" : "Delivery Area"}
            </label>
            <select
              value={deliveryZone}
              onChange={(e) =>
                setDeliveryZone(e.target.value as "inside" | "outside" | "free")
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800"
            >
              <option value="inside">
                ঢাকার ভেতরে (৳{brandKit.deliveryInsideDhaka ?? 70})
              </option>
              <option value="outside">
                ঢাকার বাইরে (৳{brandKit.deliveryOutsideDhaka ?? 130})
              </option>
              <option value="free">ফ্রি ডেলিভারি (৳0)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              {lang === "bn" ? "অগ্রিম জমা (bKash/Nagad ৳)" : "Advance Paid (৳)"}
            </label>
            <input
              type="number"
              min={0}
              value={advancePaid}
              onChange={(e) => setAdvancePaid(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-emerald-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              {lang === "bn" ? "স্পেশাল ছাড় (৳)" : "Discount (৳)"}
            </label>
            <input
              type="number"
              min={0}
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-rose-700"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">
              {lang === "bn" ? "সাইজ / কালার নোট" : "Size / Order Note"}
            </label>
            <input
              type="text"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder={lang === "bn" ? "যেমন: লাল, L সাইজ" : "e.g. Red, Size L"}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800"
            />
          </div>
        </div>

        {/* 4 Branded Invoice Color Swatches */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-2.5">
          <span className="text-xs font-bold text-slate-700">
            {lang === "bn" ? "মেমোর ব্র্যান্ড রঙ:" : "Memo Theme Color:"}
          </span>
          <div className="flex items-center gap-2">
            {[
              { color: "#e11d48", label: "Rose" },
              { color: "#059669", label: "Emerald" },
              { color: "#1d4ed8", label: "Royal" },
              { color: "#0f172a", label: "Dark" },
            ].map((sw) => (
              <button
                key={sw.color}
                type="button"
                onClick={() => setInvoiceTheme(sw.color)}
                className={`h-6 w-6 rounded-full ring-2 transition ${
                  invoiceTheme === sw.color
                    ? "scale-110 ring-slate-900"
                    : "ring-white"
                }`}
                style={{ backgroundColor: sw.color }}
                title={sw.label}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 pt-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleDownloadInvoice}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-rose-700"
          >
            <Download className="h-4 w-4" />
            <span>
              {lang === "bn" ? "ক্যাশ মেমো PNG ডাউনলোড" : "Download Invoice PNG"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleCopyCourierSlip}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-slate-800"
          >
            {copiedCourier ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>{lang === "bn" ? "কপি হয়েছে!" : "Copied!"}</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-rose-400" />
                <span>
                  {lang === "bn"
                    ? "কুরিয়ার বুকিং টেক্সট কপি"
                    : "Copy Courier Booking Text"}
                </span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            const digits = customerPhone.replace(/\D/g, "");
            const waMsg = encodeURIComponent(
              `আসসালামু আলাইকুম ${customerName || "স্যার/ম্যাম"}! আপনার অর্ডার কনফার্ম হয়েছে 🎉\n🧾 মেমো নং: #${invoiceNo}\n🛍️ পণ্য: ${items
                .map((i) => `${i.name || "পণ্য"} x${i.qty}`)
                .join(", ")}\n💰 পরিশোধযোগ্য (COD): ৳${codDue}\n— ${
                brandKit.shopName || "আমাদের অনলাইন শপ"
              }`
            );
            window.open(
              digits.length >= 10
                ? `https://wa.me/${digits.startsWith("88") ? digits : `88${digits}`}?text=${waMsg}`
                : `https://wa.me/?text=${waMsg}`,
              "_blank"
            );
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-extrabold text-emerald-800 transition hover:bg-emerald-100"
        >
          <span>
            {lang === "bn"
              ? "📲 ১ ক্লিকে কাস্টমারের WhatsApp-এ বিল পাঠান"
              : "📲 Send Order Confirmation on WhatsApp"}
          </span>
        </button>
      </div>

      {/* Right Live HD Invoice Preview */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6 xl:col-span-7">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-extrabold text-slate-900">
            {lang === "bn"
              ? "লাইভ ডিজিটাল ক্যাশ মেমো প্রিভিউ"
              : "Live Branded Invoice Preview"}
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
            COD Due: ৳{codDue.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-slate-200 shadow-md">
          <canvas ref={canvasRef} className="block h-auto w-full" />
        </div>
      </div>
    </div>
  );
}
