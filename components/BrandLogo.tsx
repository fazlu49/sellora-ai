import React from "react";

interface BrandLogoProps {
  darkBg?: boolean;
  compact?: boolean;
  lang?: "bn" | "en";
}

export function BrandLogo({
  darkBg = false,
  compact = false,
  lang = "bn",
}: BrandLogoProps) {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 via-pink-600 to-rose-500 shadow-sm shadow-rose-600/25">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M15.5 6.5C15.5 5.11929 13.933 4 12 4C10.067 4 8.5 5.11929 8.5 6.5C8.5 9.2 15.5 9.2 15.5 12.5C15.5 14.433 13.933 16 12 16C10.067 16 8.5 14.8807 8.5 13.5"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M18.5 4.5L19.2 6.3L21 7L19.2 7.7L18.5 9.5L17.8 7.7L16 7L17.8 6.3L18.5 4.5Z"
            fill="#FDE047"
          />
          <path
            d="M6.5 19.5H17.5"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-lg font-extrabold tracking-tight ${
                darkBg ? "text-white" : "text-slate-900"
              }`}
            >
              Sellora
            </span>
            <span className="rounded-md bg-rose-600/15 px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-rose-500">
              AI
            </span>
          </div>
          <span
            className={`mt-0.5 text-[11px] font-medium ${
              darkBg ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {lang === "bn" ? "সেলোরা এআই স্টুডিও" : "F-Commerce Studio"}
          </span>
        </div>
      )}
    </div>
  );
}
