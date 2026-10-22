"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import QRCode from "qrcode";
import { BrandKit, PosterConfig, PosterTemplateId } from "@/lib/types";
import { formatBdt } from "@/lib/ai-engine";

export interface PosterCanvasHandle {
  downloadPng: (fileName?: string) => void;
  downloadJpg?: (fileName?: string) => void;
}

interface PosterCanvasProps {
  poster: PosterConfig;
  brandKit: BrandKit;
  regularPrice: number;
  offerPrice: number;
  copyStyle?: "bn" | "banglish" | "en";
  className?: string;
}

interface ThemePalette {
  bgTop: string;
  bgMid: string;
  bgBot: string;
  glowA: string;
  glowB: string;
  accent: string;
  accentText: string;
  ctaBg: string;
  ctaText: string;
  textMain: string;
  textMuted: string;
  stageBorder: string;
  pillBg: string;
  pillBorder: string;
  priceBg: string;
  priceText: string;
  isLight?: boolean;
}

const PALETTES: Record<PosterTemplateId, ThemePalette> = {
  magenta_luxe: {
    bgTop: "#2b0518",
    bgMid: "#4a0929",
    bgBot: "#15030e",
    glowA: "rgba(244, 63, 94, 0.45)",
    glowB: "rgba(217, 70, 239, 0.30)",
    accent: "#fbbf24",
    accentText: "#1f0812",
    ctaBg: "#e11d48",
    ctaText: "#ffffff",
    textMain: "#ffffff",
    textMuted: "#fbcfe8",
    stageBorder: "rgba(255, 255, 255, 0.35)",
    pillBg: "rgba(255, 255, 255, 0.12)",
    pillBorder: "rgba(255, 255, 255, 0.24)",
    priceBg: "#0f172a",
    priceText: "#ffffff",
  },
  festive_emerald: {
    bgTop: "#03261b",
    bgMid: "#064e3b",
    bgBot: "#021811",
    glowA: "rgba(16, 185, 129, 0.40)",
    glowB: "rgba(245, 158, 11, 0.32)",
    accent: "#fbbf24",
    accentText: "#052e16",
    ctaBg: "#f59e0b",
    ctaText: "#052e16",
    textMain: "#ffffff",
    textMuted: "#a7f3d0",
    stageBorder: "rgba(251, 191, 36, 0.55)",
    pillBg: "rgba(255, 255, 255, 0.11)",
    pillBorder: "rgba(251, 191, 36, 0.34)",
    priceBg: "#042f2e",
    priceText: "#fef08a",
  },
  crimson_flash: {
    bgTop: "#450a0a",
    bgMid: "#991b1b",
    bgBot: "#290505",
    glowA: "rgba(249, 115, 22, 0.50)",
    glowB: "rgba(250, 204, 21, 0.35)",
    accent: "#fde047",
    accentText: "#450a0a",
    ctaBg: "#facc15",
    ctaText: "#18181b",
    textMain: "#ffffff",
    textMuted: "#fed7aa",
    stageBorder: "rgba(253, 224, 71, 0.55)",
    pillBg: "rgba(0, 0, 0, 0.28)",
    pillBorder: "rgba(253, 224, 71, 0.35)",
    priceBg: "#18181b",
    priceText: "#fde047",
  },
  dark_executive: {
    bgTop: "#050816",
    bgMid: "#0f172a",
    bgBot: "#030712",
    glowA: "rgba(56, 189, 248, 0.34)",
    glowB: "rgba(244, 63, 94, 0.28)",
    accent: "#38bdf8",
    accentText: "#020617",
    ctaBg: "#e11d48",
    ctaText: "#ffffff",
    textMain: "#f8fafc",
    textMuted: "#94a3b8",
    stageBorder: "rgba(56, 189, 248, 0.45)",
    pillBg: "rgba(255, 255, 255, 0.08)",
    pillBorder: "rgba(148, 163, 184, 0.26)",
    priceBg: "#e11d48",
    priceText: "#ffffff",
  },
  minimal_boutique: {
    bgTop: "#fdf8f3",
    bgMid: "#f6ece2",
    bgBot: "#efe1d1",
    glowA: "rgba(225, 29, 72, 0.10)",
    glowB: "rgba(217, 119, 6, 0.12)",
    accent: "#9f1239",
    accentText: "#ffffff",
    ctaBg: "#1c1917",
    ctaText: "#fafaf9",
    textMain: "#1c1917",
    textMuted: "#57534e",
    stageBorder: "rgba(159, 18, 57, 0.25)",
    pillBg: "rgba(255, 255, 255, 0.82)",
    pillBorder: "rgba(120, 113, 108, 0.25)",
    priceBg: "#9f1239",
    priceText: "#ffffff",
    isLight: true,
  },
  flash_split: {
    bgTop: "#0f172a",
    bgMid: "#1e1b4b",
    bgBot: "#090d1a",
    glowA: "rgba(244, 63, 94, 0.42)",
    glowB: "rgba(99, 102, 241, 0.35)",
    accent: "#fbbf24",
    accentText: "#0f172a",
    ctaBg: "#e11d48",
    ctaText: "#ffffff",
    textMain: "#ffffff",
    textMuted: "#cbd5e1",
    stageBorder: "rgba(255, 255, 255, 0.32)",
    pillBg: "rgba(255, 255, 255, 0.10)",
    pillBorder: "rgba(255, 255, 255, 0.22)",
    priceBg: "#fbbf24",
    priceText: "#0f172a",
  },
  royal_navy: {
    bgTop: "#071330",
    bgMid: "#0f295c",
    bgBot: "#050d21",
    glowA: "rgba(251, 191, 36, 0.32)",
    glowB: "rgba(59, 130, 246, 0.38)",
    accent: "#fbbf24",
    accentText: "#071330",
    ctaBg: "#fbbf24",
    ctaText: "#071330",
    textMain: "#ffffff",
    textMuted: "#bfdbfe",
    stageBorder: "rgba(251, 191, 36, 0.50)",
    pillBg: "rgba(255, 255, 255, 0.10)",
    pillBorder: "rgba(251, 191, 36, 0.30)",
    priceBg: "#0f172a",
    priceText: "#fde047",
  },
  sunset_coral: {
    bgTop: "#3b0764",
    bgMid: "#be123c",
    bgBot: "#1e1b4b",
    glowA: "rgba(251, 146, 60, 0.45)",
    glowB: "rgba(232, 121, 249, 0.35)",
    accent: "#fde047",
    accentText: "#3b0764",
    ctaBg: "#ffffff",
    ctaText: "#9f1239",
    textMain: "#ffffff",
    textMuted: "#ffe4e6",
    stageBorder: "rgba(255, 255, 255, 0.42)",
    pillBg: "rgba(255, 255, 255, 0.14)",
    pillBorder: "rgba(255, 255, 255, 0.30)",
    priceBg: "#18181b",
    priceText: "#fde047",
  },
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 2
): string[] {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
      if (lines.length === maxLines - 1) {
        for (let j = i + 1; j < words.length; j++) {
          const rest = `${current} ${words[j]}`;
          if (ctx.measureText(rest + "…").width <= maxWidth) {
            current = rest;
          } else {
            current = current + "…";
            break;
          }
        }
        break;
      }
    }
  }
  lines.push(current);
  return lines.slice(0, maxLines);
}

function drawStudioProductStage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
  options: {
    radius: number;
    borderColor: string;
    enhance: boolean;
    fitMode: "contain" | "cover";
    scale: number;
    offsetY: number;
    isLight?: boolean;
    placeholderText: string;
  }
) {
  ctx.save();
  // Outer drop shadow around stage pedestal
  ctx.shadowColor = "rgba(0, 0, 0, 0.36)";
  ctx.shadowBlur = 38;
  ctx.shadowOffsetY = 16;
  roundRect(ctx, x, y, w, h, options.radius);
  ctx.fillStyle = options.isLight ? "#ffffff" : "#f8fafc";
  ctx.fill();
  ctx.shadowColor = "transparent";

  roundRect(ctx, x, y, w, h, options.radius);
  ctx.clip();

  if (!img) {
    // Sleek studio placeholder stage
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, "#fdf2f8");
    grad.addColorStop(1, "#f1f5f9");
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);

    // Subtle studio rings
    ctx.strokeStyle = "rgba(225, 29, 72, 0.14)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2 - 14, Math.min(w, h) * 0.26, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#e11d48";
    ctx.font = "800 32px 'Hind Siliguri', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📸 পণ্যের ছবি আপলোড করুন", x + w / 2, y + h / 2 - 4);
    ctx.fillStyle = "#64748b";
    ctx.font = "600 22px 'Hind Siliguri', sans-serif";
    ctx.fillText(options.placeholderText, x + w / 2, y + h / 2 + 36);
    ctx.textAlign = "left";
  } else if (options.fitMode === "cover") {
    const imgRatio = img.width / img.height;
    const boxRatio = w / h;
    let drawW = w;
    let drawH = h;
    if (imgRatio > boxRatio) {
      drawH = h;
      drawW = h * imgRatio;
    } else {
      drawW = w;
      drawH = w / imgRatio;
    }
    drawW *= options.scale;
    drawH *= options.scale;
    const dx = x + (w - drawW) / 2;
    const dy = y + (h - drawH) / 2 + options.offsetY;
    ctx.filter = options.enhance
      ? "contrast(1.07) saturate(1.13) brightness(1.03)"
      : "none";
    ctx.drawImage(img, dx, dy, drawW, drawH);
    ctx.filter = "none";
  } else {
    // SMART CONTAIN STUDIO STAGE: Rich edge-to-edge color-matched blurred studio backdrop + 100% uncropped product!
    const bgScale = Math.max(w / img.width, h / img.height) * 1.15;
    const bgW = img.width * bgScale;
    const bgH = img.height * bgScale;
    ctx.save();
    ctx.filter = "blur(24px) saturate(1.22) brightness(0.92)";
    ctx.globalAlpha = 0.94;
    ctx.drawImage(img, x + (w - bgW) / 2, y + (h - bgH) / 2, bgW, bgH);
    ctx.restore();

    // Subtle soft studio vignette for contrast
    const spot = ctx.createRadialGradient(
      x + w / 2,
      y + h / 2,
      30,
      x + w / 2,
      y + h / 2,
      Math.max(w, h) * 0.72
    );
    spot.addColorStop(0, "rgba(255,255,255,0.18)");
    spot.addColorStop(1, "rgba(15,23,42,0.16)");
    ctx.fillStyle = spot;
    ctx.fillRect(x, y, w, h);

    // Draw full uncropped product cleanly inside stage
    const pad = 12;
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;
    const fitRatio = Math.min(innerW / img.width, innerH / img.height) * options.scale;
    const drawW = img.width * fitRatio;
    const drawH = img.height * fitRatio;
    const dx = x + (w - drawW) / 2;
    const dy = y + (h - drawH) / 2 + options.offsetY;

    ctx.save();
    ctx.shadowColor = "rgba(15, 23, 42, 0.34)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 10;
    ctx.filter = options.enhance
      ? "contrast(1.07) saturate(1.13) brightness(1.03)"
      : "none";
    roundRect(ctx, dx, dy, drawW, drawH, 20);
    ctx.clip();
    ctx.drawImage(img, dx, dy, drawW, drawH);
    ctx.restore();
  }

  ctx.restore();

  // Stage double rim border
  ctx.save();
  roundRect(ctx, x, y, w, h, options.radius);
  ctx.lineWidth = 4;
  ctx.strokeStyle = options.borderColor;
  ctx.stroke();
  ctx.restore();
}

export const PosterCanvas = forwardRef<PosterCanvasHandle, PosterCanvasProps>(
  function PosterCanvas(
    {
      poster,
      brandKit,
      regularPrice,
      offerPrice,
      copyStyle = "bn",
      className = "",
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
    const [loadedLogo, setLoadedLogo] = useState<HTMLImageElement | null>(null);
    const [qrImg, setQrImg] = useState<HTMLImageElement | null>(null);

    useImperativeHandle(ref, () => ({
      downloadPng: (fileName = "sellora-pro-poster.png") => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = fileName;
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();
      },
      downloadJpg: (fileName = "sellora-pro-poster.jpg") => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = fileName;
        link.href = canvas.toDataURL("image/jpeg", 0.96);
        link.click();
      },
    }));

    useEffect(() => {
      if (!poster.productImageUrl) {
        setLoadedImg(null);
        return;
      }
      let active = true;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (active) setLoadedImg(img);
      };
      img.onerror = () => {
        if (active) setLoadedImg(null);
      };
      img.src = poster.productImageUrl;
      return () => {
        active = false;
      };
    }, [poster.productImageUrl]);

    useEffect(() => {
      if (!brandKit.logoDataUrl) {
        setLoadedLogo(null);
        return;
      }
      let active = true;
      const logo = new Image();
      logo.crossOrigin = "anonymous";
      logo.onload = () => {
        if (active) setLoadedLogo(logo);
      };
      logo.onerror = () => {
        if (active) setLoadedLogo(null);
      };
      logo.src = brandKit.logoDataUrl;
      return () => {
        active = false;
      };
    }, [brandKit.logoDataUrl]);

    useEffect(() => {
      if (poster.showQr === false) {
        setQrImg(null);
        return;
      }
      let active = true;
      const rawDigits = (brandKit.phoneWhatsapp || "").replace(/\D/g, "");
      const waTarget =
        rawDigits.length >= 10
          ? `https://wa.me/${rawDigits.startsWith("88") ? rawDigits : `88${rawDigits}`}`
          : brandKit.pageUrl?.trim()
          ? brandKit.pageUrl.startsWith("http")
            ? brandKit.pageUrl
            : `https://${brandKit.pageUrl}`
          : "https://sellorabd.vercel.app";

      QRCode.toDataURL(waTarget, {
        width: 220,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
      })
        .then((url) => {
          if (!active) return;
          const q = new Image();
          q.onload = () => {
            if (active) setQrImg(q);
          };
          q.src = url;
        })
        .catch(() => {
          if (active) setQrImg(null);
        });
      return () => {
        active = false;
      };
    }, [poster.showQr, brandKit.phoneWhatsapp, brandKit.pageUrl]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = 1080;
      const H =
        poster.aspect === "story"
          ? 1920
          : poster.aspect === "portrait"
          ? 1350
          : 1080;
      canvas.width = W;
      canvas.height = H;

      const basePalette = PALETTES[poster.templateId] || PALETTES.magenta_luxe;
      const palette: ThemePalette = {
        ...basePalette,
        ...(poster.customPrimaryColor
          ? { ctaBg: poster.customPrimaryColor, ctaText: "#ffffff" }
          : {}),
        ...(poster.customAccentColor
          ? { accent: poster.customAccentColor }
          : {}),
      };

      const numLang = copyStyle === "en" ? "en" : "bn";
      const offerFormatted = offerPrice > 0 ? formatBdt(offerPrice, numLang) : "";
      const regFormatted =
        regularPrice > offerPrice && offerPrice > 0
          ? formatBdt(regularPrice, numLang)
          : "";
      const savingsFormatted =
        regularPrice > offerPrice && offerPrice > 0
          ? formatBdt(regularPrice - offerPrice, numLang)
          : "";

      // 1. Rich Multi-Stop Commercial Studio Background
      const bgGrad = ctx.createLinearGradient(0, 0, W * 0.4, H);
      bgGrad.addColorStop(0, palette.bgTop);
      bgGrad.addColorStop(0.52, palette.bgMid);
      bgGrad.addColorStop(1, palette.bgBot);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Ambient Studio Glow Halos
      const glow1 = ctx.createRadialGradient(W * 0.82, H * 0.16, 20, W * 0.82, H * 0.16, 520);
      glow1.addColorStop(0, palette.glowA);
      glow1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, W, H);

      const glow2 = ctx.createRadialGradient(W * 0.16, H * 0.78, 20, W * 0.16, H * 0.78, 560);
      glow2.addColorStop(0, palette.glowB);
      glow2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, W, H);

      // Subtle Diagonal Geometric Luxury Ribbons
      ctx.save();
      ctx.strokeStyle = palette.isLight
        ? "rgba(159, 18, 57, 0.06)"
        : "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 2;
      for (let i = -H; i < W + H; i += 140) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i - H * 0.35, H);
        ctx.stroke();
      }
      ctx.restore();

      // Luxury Inner Metallic Border Frame (22px inset)
      ctx.save();
      roundRect(ctx, 22, 22, W - 44, H - 44, 34);
      ctx.lineWidth = 2;
      ctx.strokeStyle = palette.isLight
        ? "rgba(159, 18, 57, 0.16)"
        : "rgba(255, 255, 255, 0.14)";
      ctx.stroke();
      ctx.restore();

      // =========================================================================
      // SPECIAL MAGAZINE SPLIT LAYOUT ("flash_split") FOR SQUARE / PORTRAIT
      // =========================================================================
      if (poster.templateId === "flash_split" && poster.aspect !== "story") {
        const padX = 56;
        const leftW = 455;
        const rightX = 540;
        const rightW = W - rightX - 52;
        const stageY = 66;
        const stageH = H - 230;

        // Brand Header Left
        if (loadedLogo) {
          ctx.save();
          roundRect(ctx, padX, 66, 68, 68, 18);
          ctx.clip();
          ctx.drawImage(loadedLogo, padX, 66, 68, 68);
          ctx.restore();
        } else {
          roundRect(ctx, padX, 66, 68, 68, 18);
          ctx.fillStyle = palette.ctaBg;
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "800 34px 'Hind Siliguri', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText((brandKit.shopName || "S").charAt(0).toUpperCase(), padX + 34, 111);
          ctx.textAlign = "left";
        }

        ctx.fillStyle = palette.textMain;
        ctx.font = "800 30px 'Hind Siliguri', sans-serif";
        ctx.fillText((brandKit.shopName || "আমার অনলাইন শপ").slice(0, 22), padX + 84, 99);
        ctx.fillStyle = palette.textMuted;
        ctx.font = "500 20px 'Hind Siliguri', sans-serif";
        ctx.fillText((brandKit.tagline || "বিশ্বস্ত অনলাইন শপ").slice(0, 28), padX + 84, 127);

        // Offer Ribbon Pill
        ctx.font = "800 24px 'Hind Siliguri', sans-serif";
        const bTxt = `🔥 ${poster.badgeText || "বিশেষ অফার"}`;
        const bW = Math.min(leftW, ctx.measureText(bTxt).width + 44);
        roundRect(ctx, padX, 168, bW, 50, 25);
        ctx.fillStyle = palette.accent;
        ctx.fill();
        ctx.fillStyle = palette.accentText;
        ctx.fillText(bTxt, padX + 22, 201);

        // Big Left Headline
        ctx.fillStyle = palette.textMain;
        ctx.font = "800 50px 'Hind Siliguri', sans-serif";
        const hLines = wrapLines(ctx, poster.headline, leftW, 3);
        let curY = 282;
        hLines.forEach((ln) => {
          ctx.fillText(ln, padX, curY);
          curY += 60;
        });

        ctx.fillStyle = palette.textMuted;
        ctx.font = "600 24px 'Hind Siliguri', sans-serif";
        const subLines = wrapLines(ctx, poster.subline, leftW, 2);
        subLines.forEach((ln) => {
          ctx.fillText(ln, padX, curY + 8);
          curY += 34;
        });

        // Bullet Highlights Stack
        curY += 22;
        const bullets = (poster.highlights || []).slice(0, 3);
        bullets.forEach((b) => {
          roundRect(ctx, padX, curY, leftW, 52, 16);
          ctx.fillStyle = palette.pillBg;
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = palette.pillBorder;
          ctx.stroke();
          ctx.fillStyle = palette.accent;
          ctx.font = "800 24px 'Hind Siliguri', sans-serif";
          ctx.fillText("✦", padX + 18, curY + 34);
          ctx.fillStyle = palette.textMain;
          ctx.font = "600 22px 'Hind Siliguri', sans-serif";
          ctx.fillText(b.slice(0, 30), padX + 48, curY + 34);
          curY += 64;
        });

        // Price Card on Left
        curY += 12;
        roundRect(ctx, padX, curY, leftW, 126, 24);
        ctx.fillStyle = palette.priceBg;
        ctx.fill();
        if (poster.hidePrice) {
          ctx.fillStyle = palette.priceText;
          ctx.font = "800 30px 'Hind Siliguri', sans-serif";
          ctx.fillText("💬 স্পেশাল অফার প্রাইস", padX + 26, curY + 54);
          ctx.font = "700 24px 'Hind Siliguri', sans-serif";
          ctx.fillText("জানতে এখনই ইনবক্স বা কমেন্ট করুন!", padX + 26, curY + 94);
        } else {
          if (regFormatted) {
            ctx.fillStyle = palette.priceText;
            ctx.globalAlpha = 0.72;
            ctx.font = "700 24px 'Hind Siliguri', sans-serif";
            const rLabel = `রেগুলার: ${regFormatted}`;
            ctx.fillText(rLabel, padX + 26, curY + 42);
            const rw = ctx.measureText(rLabel).width;
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(padX + 24, curY + 34);
            ctx.lineTo(padX + 28 + rw, curY + 34);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
          ctx.fillStyle = palette.priceText;
          ctx.font = "900 56px 'Hind Siliguri', sans-serif";
          ctx.fillText(offerFormatted || "অফার চলছে", padX + 24, curY + 104);
        }

        // Right Tall Product Stage (Magazine Cover Fill by Default!)
        drawStudioProductStage(ctx, loadedImg, rightX, stageY, rightW, stageH, {
          radius: 34,
          borderColor: palette.stageBorder,
          enhance: poster.enhancePhoto !== false,
          fitMode: "cover",
          scale: poster.photoScale || 1,
          offsetY: poster.photoOffsetY || 0,
          isLight: palette.isLight,
          placeholderText: "ডান পাশে পুরো ছবি ম্যাগাজিন কভারের মতো বসবে",
        });

        // Bottom Full Bar + QR
        const barY = H - 134;
        const hasQr = Boolean(qrImg && poster.showQr !== false);
        const ctaW = hasQr ? W - 112 - 128 : W - 112;
        roundRect(ctx, 56, barY, ctaW, 92, 24);
        ctx.fillStyle = palette.ctaBg;
        ctx.fill();
        ctx.fillStyle = palette.ctaText;
        ctx.font = "800 31px 'Hind Siliguri', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(poster.ctaText, 56 + ctaW / 2, barY + 43);
        ctx.font = "600 20px 'Hind Siliguri', sans-serif";
        const subPolicy = poster.freeDelivery
          ? "🎉 সারা দেশে সম্পূর্ণ ফ্রি হোম ডেলিভারি • হাতে পেয়ে পেমেন্ট!"
          : brandKit.paymentPolicy || "পণ্য হাতে পেয়ে দেখে পেমেন্ট — সারা দেশে হোম ডেলিভারি";
        ctx.fillText(subPolicy.slice(0, 56), 56 + ctaW / 2, barY + 73);
        ctx.textAlign = "left";

        if (hasQr && qrImg) {
          const qx = W - 56 - 108;
          roundRect(ctx, qx, barY - 6, 108, 104, 20);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.drawImage(qrImg, qx + 12, barY + 2, 84, 84);
        }
        return;
      }

      // =========================================================================
      // SIGNATURE COMMERCIAL AGENCY SPOTLIGHT LAYOUT (ALL RATIOS: 1:1, 4:5, 9:16)
      // =========================================================================
      const padX = 58;
      const contentW = W - padX * 2;
      const topY = poster.aspect === "story" ? 78 : 52;

      // 1. Brand Logo + Shop Name (Top Left) & Star Offer Pill (Top Right)
      if (loadedLogo) {
        ctx.save();
        roundRect(ctx, padX, topY, 72, 72, 20);
        ctx.clip();
        ctx.drawImage(loadedLogo, padX, topY, 72, 72);
        ctx.restore();
        roundRect(ctx, padX, topY, 72, 72, 20);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = palette.accent;
        ctx.stroke();
      } else {
        roundRect(ctx, padX, topY, 72, 72, 20);
        ctx.fillStyle = palette.ctaBg;
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "800 36px 'Hind Siliguri', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          (brandKit.shopName || "S").charAt(0).toUpperCase(),
          padX + 36,
          topY + 48
        );
        ctx.textAlign = "left";
      }

      ctx.fillStyle = palette.textMain;
      ctx.font = "800 32px 'Hind Siliguri', sans-serif";
      ctx.fillText(
        (brandKit.shopName || "আপনার অনলাইন শপ").slice(0, 26),
        padX + 90,
        topY + 35
      );
      ctx.fillStyle = palette.textMuted;
      ctx.font = "600 20px 'Hind Siliguri', sans-serif";
      ctx.fillText(
        (brandKit.tagline || "১০০% বিশ্বস্ত অনলাইন স্টোর").slice(0, 34),
        padX + 90,
        topY + 63
      );

      // Top-Right Offer Ribbon Pill
      ctx.font = "800 25px 'Hind Siliguri', sans-serif";
      const badgeLabel = `✦ ${poster.badgeText || "বিশেষ অফার"}`;
      const badgeW = Math.min(390, ctx.measureText(badgeLabel).width + 48);
      const badgeX = W - padX - badgeW;
      roundRect(ctx, badgeX, topY + 8, badgeW, 56, 28);
      ctx.fillStyle = palette.accent;
      ctx.fill();
      ctx.fillStyle = palette.accentText;
      ctx.textAlign = "center";
      ctx.fillText(badgeLabel, badgeX + badgeW / 2, topY + 45);
      ctx.textAlign = "left";

      // 2. Hero Product Title & Punchy Subline
      const headFontSize = poster.aspect === "story" ? 58 : 48;
      ctx.fillStyle = palette.textMain;
      ctx.font = `800 ${headFontSize}px 'Hind Siliguri', sans-serif`;
      const titleLines = wrapLines(ctx, poster.headline, contentW, 2);
      let cursorY = topY + (poster.aspect === "story" ? 142 : 124);
      titleLines.forEach((ln) => {
        ctx.fillText(ln, padX, cursorY);
        cursorY += headFontSize + 10;
      });

      ctx.fillStyle = palette.textMuted;
      ctx.font = "600 25px 'Hind Siliguri', sans-serif";
      ctx.fillText((poster.subline || "").slice(0, 62), padX, cursorY + 2);

      // 3. Center Studio Product Stage (Uncropped Pedestal OR Full Bleed!)
      const stageTop = cursorY + 26;
      const bottomReserved = poster.aspect === "story" ? 300 : 214;
      const stageH = Math.max(360, H - stageTop - bottomReserved);

      drawStudioProductStage(ctx, loadedImg, padX, stageTop, contentW, stageH, {
        radius: 34,
        borderColor: palette.stageBorder,
        enhance: poster.enhancePhoto !== false,
        fitMode: poster.photoFit || "contain",
        scale: poster.photoScale || 1,
        offsetY: poster.photoOffsetY || 0,
        isLight: palette.isLight,
        placeholderText: "আপনার পণ্যের পুরো ছবি কোনো কাটা ছাড়াই এখানে বসবে",
      });

      // Top-Left Delivery / Trust Ribbon inside top corner of stage
      if (poster.freeDelivery || poster.codBadge !== false) {
        const sealTxt = poster.freeDelivery
          ? "🚚 সারা দেশে ফ্রি ডেলিভারি!"
          : "✓ ক্যাশ অন ডেলিভারি";
        ctx.save();
        ctx.font = "800 22px 'Hind Siliguri', sans-serif";
        const sw = ctx.measureText(sealTxt).width + 38;
        roundRect(ctx, padX + 20, stageTop + 20, sw, 46, 23);
        ctx.fillStyle = poster.freeDelivery ? "#059669" : "rgba(15, 23, 42, 0.85)";
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillText(sealTxt, padX + 39, stageTop + 50);
        ctx.restore();
      }

      // Floating Commercial Price Tag Card (Bottom-Right of Stage)
      if (poster.hidePrice) {
        const pw = 390;
        const ph = 104;
        const px = W - padX - pw - 20;
        const py = stageTop + stageH - ph - 20;
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 24;
        roundRect(ctx, px, py, pw, ph, 26);
        ctx.fillStyle = palette.priceBg;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = palette.accent;
        ctx.stroke();
        ctx.fillStyle = palette.priceText;
        ctx.font = "800 28px 'Hind Siliguri', sans-serif";
        ctx.fillText("💬 অফার প্রাইস জানতে", px + 26, py + 44);
        ctx.fillStyle = palette.accent === palette.priceBg ? "#ffffff" : palette.accent;
        ctx.font = "700 23px 'Hind Siliguri', sans-serif";
        ctx.fillText("এখনই ইনবক্স বা কমেন্ট করুন →", px + 26, py + 80);
        ctx.restore();
      } else if (offerPrice > 0) {
        const pw = savingsFormatted ? 360 : 320;
        const ph = regFormatted ? 128 : 96;
        const px = W - padX - pw - 20;
        const py = stageTop + stageH - ph - 20;
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.40)";
        ctx.shadowBlur = 26;
        roundRect(ctx, px, py, pw, ph, 26);
        ctx.fillStyle = palette.priceBg;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = palette.accent;
        ctx.stroke();
        ctx.shadowColor = "transparent";

        if (regFormatted) {
          ctx.fillStyle = "#cbd5e1";
          ctx.font = "700 22px 'Hind Siliguri', sans-serif";
          const rTxt = `আগের দাম: ${regFormatted}`;
          ctx.fillText(rTxt, px + 24, py + 38);
          const rw = ctx.measureText(rTxt).width;
          ctx.strokeStyle = "#fb7185";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(px + 22, py + 30);
          ctx.lineTo(px + 26 + rw, py + 30);
          ctx.stroke();

          if (savingsFormatted) {
            ctx.fillStyle = "#fde047";
            ctx.font = "800 19px 'Hind Siliguri', sans-serif";
            ctx.fillText(`সাশ্রয় ${savingsFormatted}`, px + 24 + rw + 12, py + 38);
          }
        }

        ctx.fillStyle = palette.priceText;
        ctx.font = "900 56px 'Hind Siliguri', sans-serif";
        ctx.fillText(offerFormatted, px + 24, py + (regFormatted ? 104 : 68));
        ctx.restore();
      }

      // 4. Horizontal Feature & Trust Pills Row
      const pillsY = stageTop + stageH + (poster.aspect === "story" ? 28 : 20);
      const highlights = (poster.highlights || []).filter(Boolean).slice(0, 3);
      if (highlights.length > 0) {
        const gap = 14;
        const pillW = (contentW - gap * (highlights.length - 1)) / highlights.length;
        highlights.forEach((item, idx) => {
          const hx = padX + idx * (pillW + gap);
          roundRect(ctx, hx, pillsY, pillW, 54, 16);
          ctx.fillStyle = palette.pillBg;
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = palette.pillBorder;
          ctx.stroke();
          ctx.fillStyle = palette.textMain;
          ctx.font = "700 20px 'Hind Siliguri', sans-serif";
          const fittedBullet = wrapLines(ctx, `✓ ${item}`, pillW - 28, 1)[0];
          ctx.textAlign = "center";
          ctx.fillText(fittedBullet, hx + pillW / 2, pillsY + 34);
          ctx.textAlign = "left";
        });
      }

      // 5. Executive Bottom Order Bar + Non-Blocking Scannable QR Dock
      const dockY = H - (poster.aspect === "story" ? 158 : 118);
      const dockH = poster.aspect === "story" ? 106 : 90;
      const showQrBox = Boolean(qrImg && poster.showQr !== false);
      const ctaWidth = showQrBox ? contentW - 118 : contentW;

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.32)";
      ctx.shadowBlur = 22;
      roundRect(ctx, padX, dockY, ctaWidth, dockH, 24);
      ctx.fillStyle = palette.ctaBg;
      ctx.fill();
      ctx.shadowColor = "transparent";

      ctx.fillStyle = palette.ctaText;
      ctx.font = "800 31px 'Hind Siliguri', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        wrapLines(ctx, poster.ctaText, ctaWidth - 40, 1)[0],
        padX + ctaWidth / 2,
        dockY + 41
      );

      ctx.globalAlpha = 0.94;
      ctx.font = "600 19px 'Hind Siliguri', sans-serif";
      const deliveryLine = poster.freeDelivery
        ? "🎉 সারা দেশে ফ্রি হোম ডেলিভারি • পণ্য হাতে পেয়ে দেখে পেমেন্ট!"
        : `পণ্য হাতে পেয়ে দেখে পেমেন্ট • ঢাকা ৳${brandKit.deliveryInsideDhaka ?? 70} | ঢাকার বাইরে ৳${brandKit.deliveryOutsideDhaka ?? 130}`;
      ctx.fillText(
        wrapLines(ctx, deliveryLine, ctaWidth - 36, 1)[0],
        padX + ctaWidth / 2,
        dockY + 71
      );
      ctx.globalAlpha = 1;
      ctx.textAlign = "left";
      ctx.restore();

      if (showQrBox && qrImg) {
        const qBoxW = 102;
        const qx = W - padX - qBoxW;
        roundRect(ctx, qx, dockY - 4, qBoxW, dockH + 8, 20);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.drawImage(qrImg, qx + 11, dockY + 4, 80, 80);
      }
    }, [poster, brandKit, regularPrice, offerPrice, copyStyle, loadedImg, loadedLogo, qrImg]);

    return (
      <div
        className={`relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-900/10 ${className}`}
      >
        <canvas
          ref={canvasRef}
          className="block h-auto w-full"
          style={{
            aspectRatio:
              poster.aspect === "story"
                ? "1080 / 1920"
                : poster.aspect === "portrait"
                ? "1080 / 1350"
                : "1 / 1",
          }}
        />
      </div>
    );
  }
);
