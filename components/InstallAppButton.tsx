"use client";

import React, { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { Language } from "@/lib/types";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppButton({
  lang,
  compact = false,
}: {
  lang: Language;
  compact?: boolean;
}) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
      return;
    }
    setGuideOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={
          compact
            ? "inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-700 transition hover:bg-rose-100"
            : "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
        }
      >
        <Smartphone className="h-3.5 w-3.5 text-rose-400" />
        <span>{lang === "bn" ? "অ্যাপ ইনস্টল" : "Install App"}</span>
      </button>

      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setGuideOpen(false)}
              className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600 text-white">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {lang === "bn"
                    ? "ফোনে অ্যাপ হিসেবে ইনস্টল করুন"
                    : "Install Sellora AI on Your Phone"}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === "bn"
                    ? "Play Store ছাড়াই মাত্র ২ ক্লিকে হোমস্ক্রিনে রাখুন"
                    : "Add directly to your Home Screen in 2 taps"}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
              <p>
                <strong>১. Android (Chrome):</strong> ব্রাউজারের একদম উপরে ডান কোণায়{" "}
                <strong className="rounded bg-slate-200 px-1.5 py-0.5">⋮</strong>{" "}
                (তিন ডট মেনু)-তে চাপ দিন →{" "}
                <strong className="text-rose-600">
                  &ldquo;Add to Home screen&rdquo; / &ldquo;Install app&rdquo;
                </strong>{" "}
                চাপুন!
              </p>
              <p>
                <strong>২. iPhone (Safari):</strong> নিচের{" "}
                <strong className="rounded bg-slate-200 px-1.5 py-0.5">Share</strong>{" "}
                বাটনে চাপ দিন →{" "}
                <strong className="text-rose-600">
                  &ldquo;Add to Home Screen&rdquo;
                </strong>{" "}
                চাপুন!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setGuideOpen(false)}
              className="mt-4 w-full rounded-xl bg-rose-600 py-2.5 text-xs font-extrabold text-white hover:bg-rose-700"
            >
              {lang === "bn" ? "বুঝতে পেরেছি ✓" : "Got It ✓"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
