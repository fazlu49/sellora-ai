"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import QRCode from "qrcode";
import { BrandKit, PosterConfig } from "@/lib/types";
import { formatBdt } from "@/lib/ai-engine";

export interface PosterCanvasHandle {
  downloadPng: (fileName?: string) => void;
}

interface PosterCanvasProps {
  poster: PosterConfig;
  brandKit: BrandKit;
  regularPrice: number;
  offerPrice: number;
  copyStyle?: "bn" | "banglish" | "en";
  className?: string;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

let globalEnhancePhoto = true;

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 28
) {
  ctx.save();
  drawRoundedRect(ctx, x, y, w, h, radius);
  ctx.clip();
  ctx.filter = globalEnhancePhoto
    ? "contrast(1.07) saturate(1.13) brightness(1.03)"
    : "none";

  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let drawW = w;
  let drawH = h;
  let offsetX = x;
  let offsetY = y;

  if (imgRatio > boxRatio) {
    drawH = h;
    drawW = h * imgRatio;
    offsetX = x - (drawW - w) / 2;
  } else {
    drawW = w;
    drawH = w / imgRatio;
    offsetY = y - (drawH - h) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  ctx.filter = "none";
  ctx.restore();
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
    const test = `${current} ${words[i]}`;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
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

    useImperativeHandle(ref, () => ({
      downloadPng: (fileName = "sellora-offer-poster.png") => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = fileName;
        link.href = canvas.toDataURL("image/png", 1.0);
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
      globalEnhancePhoto = poster.enhancePhoto !== false;
    }, [poster.enhancePhoto]);

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
      let cancelled = false;
      const render = async () => {
        if (typeof document !== "undefined" && document.fonts?.ready) {
          try {
            await document.fonts.ready;
          } catch {
            // continue
          }
        }
        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const W = 1080;
        const H = poster.aspect === "portrait" ? 1350 : 1080;
        canvas.width = W;
        canvas.height = H;

        const fontFamily = `"Hind Siliguri", "Plus Jakarta Sans", sans-serif`;
        const primary = brandKit.primaryColor || "#e11d48";
        const accent = brandKit.accentColor || "#f59e0b";
        const isEn = copyStyle === "en";
        const offerFormatted = formatBdt(offerPrice, isEn ? "en" : "bn");
        const regFormatted = formatBdt(regularPrice, isEn ? "en" : "bn");

        ctx.clearRect(0, 0, W, H);

        const drawPhotoPlaceholder = (
          x: number,
          y: number,
          w: number,
          h: number,
          onDark: boolean
        ) => {
          ctx.save();
          drawRoundedRect(ctx, x + 28, y + 28, w - 56, h - 56, 24);
          ctx.strokeStyle = onDark ? "rgba(255,255,255,0.28)" : "#cbd5e1";
          ctx.setLineDash([12, 10]);
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.textAlign = "center";
          ctx.fillStyle = onDark ? "rgba(255,255,255,0.85)" : "#475569";
          ctx.font = `700 30px ${fontFamily}`;
          ctx.fillText(
            isEn ? "📷 Upload Your Product Photo" : "📷 আপনার পণ্যের ছবি যোগ করুন",
            x + w / 2,
            y + h / 2 - 8
          );
          ctx.fillStyle = onDark ? "rgba(255,255,255,0.55)" : "#94a3b8";
          ctx.font = `500 22px ${fontFamily}`;
          ctx.fillText(
            isEn ? "Appears here automatically in 1080px HD" : "ফোন গ্যালারি থেকে ছবি দিলেই এখানে বসবে",
            x + w / 2,
            y + h / 2 + 34
          );
          ctx.textAlign = "left";
          ctx.restore();
        };

        const drawShopBadge = (x: number, y: number, lightText: boolean) => {
          ctx.save();
          drawRoundedRect(ctx, x, y, 64, 64, 18);
          ctx.fillStyle = primary;
          ctx.fill();
          if (loadedLogo) {
            drawCoverImage(ctx, loadedLogo, x, y, 64, 64, 18);
          } else {
            ctx.fillStyle = "#ffffff";
            ctx.font = `700 30px ${fontFamily}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const firstChar = (brandKit.shopName || "S").trim().charAt(0);
            ctx.fillText(firstChar, x + 32, y + 34);
          }
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
          ctx.fillStyle = lightText ? "#ffffff" : "#0f172a";
          ctx.font = `700 30px ${fontFamily}`;
          ctx.fillText((brandKit.shopName || "Sellora Shop").slice(0, 26), x + 80, y + 30);
          ctx.fillStyle = lightText ? "rgba(255,255,255,0.78)" : "#64748b";
          ctx.font = `500 20px ${fontFamily}`;
          const cleanTagline = wrapLines(
            ctx,
            brandKit.tagline || "বিশ্বস্ত অনলাইন শপ",
            520,
            1
          )[0];
          ctx.fillText(cleanTagline, x + 80, y + 56);
          ctx.restore();
        };

        if (poster.templateId === "festive_emerald") {
          // Royal Emerald & Gold Festive / Eid Edition
          const eg = ctx.createLinearGradient(0, 0, W, H);
          eg.addColorStop(0, "#022c22");
          eg.addColorStop(0.55, "#064e3b");
          eg.addColorStop(1, "#022c22");
          ctx.fillStyle = eg;
          ctx.fillRect(0, 0, W, H);

          // Double Gold Border Frame
          drawRoundedRect(ctx, 24, 24, W - 48, H - 48, 36);
          ctx.strokeStyle = "rgba(251,191,36,0.55)";
          ctx.lineWidth = 4;
          ctx.stroke();

          drawShopBadge(58, 52, true);

          ctx.save();
          ctx.font = `700 24px ${fontFamily}`;
          const bw = Math.max(225, ctx.measureText(`🌙 ${poster.badgeText}`).width + 52);
          drawRoundedRect(ctx, W - 58 - bw, 58, bw, 54, 27);
          ctx.fillStyle = "#fbbf24";
          ctx.fill();
          ctx.fillStyle = "#022c22";
          ctx.textAlign = "center";
          ctx.fillText(`🌙 ${poster.badgeText}`, W - 58 - bw / 2, 94);
          ctx.restore();

          const imgY = 144;
          const imgH = H === 1350 ? 640 : 485;
          ctx.save();
          drawRoundedRect(ctx, 58, imgY, W - 116, imgH, 30);
          ctx.fillStyle = "#065f46";
          ctx.fill();
          ctx.restore();

          if (loadedImg) {
            drawCoverImage(ctx, loadedImg, 58, imgY, W - 116, imgH, 30);
          } else {
            drawPhotoPlaceholder(58, imgY, W - 116, imgH, true);
          }

          drawRoundedRect(ctx, 58, imgY, W - 116, imgH, 30);
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 3.5;
          ctx.stroke();

          const cy = imgY + imgH + 54;
          ctx.fillStyle = "#fef3c7";
          ctx.font = `700 45px ${fontFamily}`;
          const lines = wrapLines(ctx, poster.headline, W - 116, 2);
          lines.forEach((l, i) => ctx.fillText(l, 58, cy + i * 54));

          ctx.fillStyle = "#6ee7b7";
          ctx.font = `500 24px ${fontFamily}`;
          ctx.fillText(
            poster.highlights.slice(0, 3).map((h) => `✦ ${h}`).join("   ").slice(0, 66),
            58,
            cy + lines.length * 54 + 14
          );

          const footY = H - 156;
          drawRoundedRect(ctx, 58, footY, W - 116, 112, 26);
          ctx.fillStyle = "#fbbf24";
          ctx.fill();

          ctx.fillStyle = "#022c22";
          ctx.font = `700 46px ${fontFamily}`;
          ctx.fillText(offerFormatted, 86, footY + 74);

          ctx.textAlign = "right";
          ctx.font = `700 28px ${fontFamily}`;
          ctx.fillText(poster.ctaText, W - 86, footY + 70);
          ctx.textAlign = "left";
        } else if (poster.templateId === "crimson_flash") {
          // Bold High-CTR Red & Yellow Flash Sale Poster
          const rg = ctx.createLinearGradient(0, 0, W, H);
          rg.addColorStop(0, "#991b1b");
          rg.addColorStop(0.5, "#dc2626");
          rg.addColorStop(1, "#7f1d1d");
          ctx.fillStyle = rg;
          ctx.fillRect(0, 0, W, H);

          drawShopBadge(56, 46, true);

          ctx.save();
          ctx.font = `700 25px ${fontFamily}`;
          const bw = Math.max(225, ctx.measureText(`⚡ ${poster.badgeText}`).width + 52);
          drawRoundedRect(ctx, W - 56 - bw, 52, bw, 56, 16);
          ctx.fillStyle = "#fde047";
          ctx.fill();
          ctx.fillStyle = "#09090b";
          ctx.textAlign = "center";
          ctx.fillText(`⚡ ${poster.badgeText}`, W - 56 - bw / 2, 89);
          ctx.restore();

          const imgY = 136;
          const imgH = H === 1350 ? 645 : 495;
          drawRoundedRect(ctx, 56, imgY, W - 112, imgH, 30);
          ctx.fillStyle = "#ffffff";
          ctx.fill();

          if (loadedImg) {
            drawCoverImage(ctx, loadedImg, 68, imgY + 12, W - 136, imgH - 24, 22);
          } else {
            drawPhotoPlaceholder(68, imgY + 12, W - 136, imgH - 24, false);
          }

          // Yellow Price Burst Pill
          drawRoundedRect(ctx, W - 380, imgY + imgH - 122, 308, 106, 22);
          ctx.fillStyle = "#fde047";
          ctx.fill();
          ctx.fillStyle = "#09090b";
          ctx.font = `700 46px ${fontFamily}`;
          ctx.fillText(offerFormatted, W - 354, imgY + imgH - 52);

          const cy = imgY + imgH + 54;
          ctx.fillStyle = "#ffffff";
          ctx.font = `700 45px ${fontFamily}`;
          const lines = wrapLines(ctx, poster.headline, W - 112, 2);
          lines.forEach((l, i) => ctx.fillText(l, 56, cy + i * 54));

          const footY = H - 126;
          drawRoundedRect(ctx, 56, footY, W - 112, 88, 22);
          ctx.fillStyle = "#09090b";
          ctx.fill();
          ctx.fillStyle = "#fde047";
          ctx.font = `700 28px ${fontFamily}`;
          ctx.textAlign = "center";
          ctx.fillText(poster.ctaText, W / 2, footY + 55);
          ctx.textAlign = "left";
        } else if (poster.templateId === "dark_executive") {
          // Midnight Slate Luxury Template
          const bgGrad = ctx.createLinearGradient(0, 0, W, H);
          bgGrad.addColorStop(0, "#090d16");
          bgGrad.addColorStop(0.55, "#111827");
          bgGrad.addColorStop(1, "#1e1b2e");
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, W, H);

          const glow = ctx.createRadialGradient(W * 0.72, H * 0.34, 40, W * 0.72, H * 0.34, 520);
          glow.addColorStop(0, `${primary}55`);
          glow.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, W, H);

          drawShopBadge(56, 48, true);

          // Discount pill top right
          ctx.save();
          ctx.font = `700 24px ${fontFamily}`;
          const badgeW = Math.max(210, ctx.measureText(poster.badgeText).width + 56);
          drawRoundedRect(ctx, W - 56 - badgeW, 54, badgeW, 54, 27);
          ctx.fillStyle = primary;
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.fillText(poster.badgeText, W - 56 - badgeW / 2, 90);
          ctx.restore();

          // Framed Product Hero Image
          const imgY = 140;
          const imgH = H === 1350 ? 640 : 480;
          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.45)";
          ctx.shadowBlur = 36;
          drawRoundedRect(ctx, 56, imgY, W - 112, imgH, 32);
          ctx.fillStyle = "#1f2937";
          ctx.fill();
          ctx.restore();

          if (loadedImg) {
            drawCoverImage(ctx, loadedImg, 56, imgY, W - 112, imgH, 32);
          } else {
            drawPhotoPlaceholder(56, imgY, W - 112, imgH, true);
          }

          // Border stroke around photo
          ctx.save();
          drawRoundedRect(ctx, 56, imgY, W - 112, imgH, 32);
          ctx.strokeStyle = "rgba(255,255,255,0.16)";
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();

          // Headline & Price Card Area
          const contentY = imgY + imgH + 54;
          ctx.fillStyle = "#ffffff";
          ctx.font = `700 46px ${fontFamily}`;
          const titleLines = wrapLines(ctx, poster.headline, W - 112, 2);
          titleLines.forEach((line, idx) => {
            ctx.fillText(line, 56, contentY + idx * 56);
          });

          const afterTitleY = contentY + titleLines.length * 56 + 6;
          ctx.fillStyle = "#fda4af";
          ctx.font = `500 25px ${fontFamily}`;
          ctx.fillText(poster.subline.slice(0, 56), 56, afterTitleY);

          // Feature pills row
          let bulletY = afterTitleY + 46;
          poster.highlights.slice(0, 2).forEach((hl) => {
            ctx.fillStyle = "#e2e8f0";
            ctx.font = `500 24px ${fontFamily}`;
            ctx.fillText(`✦  ${hl.slice(0, 44)}`, 56, bulletY);
            bulletY += 38;
          });

          // Bottom Footer Bar with Price Box
          const barH = 128;
          const barY = H - barH - 40;
          drawRoundedRect(ctx, 56, barY, W - 112, barH, 28);
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.fill();

          // Offer price pill inside footer
          drawRoundedRect(ctx, 74, barY + 18, 340, 92, 20);
          ctx.fillStyle = primary;
          ctx.fill();

          ctx.fillStyle = "rgba(255,255,255,0.82)";
          ctx.font = `500 22px ${fontFamily}`;
          const regWidth = ctx.measureText(regFormatted).width;
          if (regularPrice > offerPrice) {
            ctx.fillText(regFormatted, 98, barY + 52);
            ctx.strokeStyle = "#fde047";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(95, barY + 44);
            ctx.lineTo(100 + regWidth, barY + 44);
            ctx.stroke();
          } else {
            ctx.fillText(isEn ? "OFFER PRICE" : "অফার মূল্য", 98, barY + 52);
          }

          ctx.fillStyle = "#ffffff";
          ctx.font = `700 44px ${fontFamily}`;
          ctx.fillText(offerFormatted, 98, barY + 95);

          // Call to action right side
          ctx.fillStyle = "#fde047";
          ctx.font = `600 22px ${fontFamily}`;
          ctx.fillText(
            isEn ? "Cash on Delivery Nationwide" : "সারা দেশে ক্যাশ অন ডেলিভারি",
            444,
            barY + 54
          );
          ctx.fillStyle = "#ffffff";
          ctx.font = `700 29px ${fontFamily}`;
          ctx.fillText(`WhatsApp: ${brandKit.phoneWhatsapp}`, 444, barY + 94);
        } else if (poster.templateId === "minimal_boutique") {
          // Warm Cream Boutique Editorial
          ctx.fillStyle = "#fffaf8";
          ctx.fillRect(0, 0, W, H);

          // Subtle editorial frame
          drawRoundedRect(ctx, 28, 28, W - 56, H - 56, 36);
          ctx.strokeStyle = `${primary}33`;
          ctx.lineWidth = 3;
          ctx.stroke();

          drawShopBadge(64, 58, false);

          // Soft tinted discount pill
          ctx.save();
          ctx.font = `700 24px ${fontFamily}`;
          const bw = Math.max(210, ctx.measureText(poster.badgeText).width + 52);
          drawRoundedRect(ctx, W - 64 - bw, 64, bw, 52, 26);
          ctx.fillStyle = `${primary}18`;
          ctx.fill();
          ctx.fillStyle = primary;
          ctx.textAlign = "center";
          ctx.fillText(poster.badgeText, W - 64 - bw / 2, 99);
          ctx.restore();

          const imgY = 148;
          const imgH = H === 1350 ? 660 : 490;
          ctx.save();
          ctx.shadowColor = "rgba(15,23,42,0.09)";
          ctx.shadowBlur = 28;
          drawRoundedRect(ctx, 64, imgY, W - 128, imgH, 30);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.restore();

          if (loadedImg) {
            drawCoverImage(ctx, loadedImg, 64, imgY, W - 128, imgH, 30);
          } else {
            drawPhotoPlaceholder(64, imgY, W - 128, imgH, false);
          }

          // Floating price tag bottom-right of image
          const tagW = 290;
          const tagH = 108;
          const tagX = W - 64 - tagW - 22;
          const tagY = imgY + imgH - tagH - 22;
          ctx.save();
          ctx.shadowColor = "rgba(15,23,42,0.18)";
          ctx.shadowBlur = 20;
          drawRoundedRect(ctx, tagX, tagY, tagW, tagH, 24);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.restore();

          if (regularPrice > offerPrice) {
            ctx.fillStyle = "#94a3b8";
            ctx.font = `600 22px ${fontFamily}`;
            const rw = ctx.measureText(regFormatted).width;
            ctx.fillText(regFormatted, tagX + 26, tagY + 38);
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(tagX + 24, tagY + 31);
            ctx.lineTo(tagX + 28 + rw, tagY + 31);
            ctx.stroke();
          }
          ctx.fillStyle = primary;
          ctx.font = `700 44px ${fontFamily}`;
          ctx.fillText(offerFormatted, tagX + 26, tagY + 86);

          // Centered Editorial Typography
          const textY = imgY + imgH + 58;
          ctx.textAlign = "center";
          ctx.fillStyle = "#0f172a";
          ctx.font = `700 44px ${fontFamily}`;
          const lines = wrapLines(ctx, poster.headline, W - 150, 2);
          lines.forEach((l, i) => ctx.fillText(l, W / 2, textY + i * 54));

          const subY = textY + lines.length * 54 + 8;
          ctx.fillStyle = "#475569";
          ctx.font = `500 25px ${fontFamily}`;
          ctx.fillText(
            poster.highlights.slice(0, 2).join("  •  ").slice(0, 62),
            W / 2,
            subY
          );

          // Bottom CTA Pill
          const ctaBarY = H - 118;
          drawRoundedRect(ctx, 64, ctaBarY, W - 128, 72, 36);
          ctx.fillStyle = "#0f172a";
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = `600 26px ${fontFamily}`;
          ctx.fillText(poster.ctaText, W / 2, ctaBarY + 46);
          ctx.textAlign = "left";
        } else if (poster.templateId === "flash_split") {
          // High-CTR Split Meta Ad Layout
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, W, H);

          const leftW = 500;
          const panelGrad = ctx.createLinearGradient(0, 0, leftW, H);
          panelGrad.addColorStop(0, "#0f172a");
          panelGrad.addColorStop(1, "#1e293b");
          ctx.fillStyle = panelGrad;
          ctx.fillRect(0, 0, leftW, H);

          // Top Accent Strip
          ctx.fillStyle = primary;
          ctx.fillRect(0, 0, leftW, 14);

          drawShopBadge(42, 48, true);

          // Right Side Full Height Studio Image
          if (loadedImg) {
            drawCoverImage(ctx, loadedImg, leftW, 0, W - leftW, H - 96, 0);
          } else {
            drawPhotoPlaceholder(leftW, 0, W - leftW, H - 96, false);
          }

          // Urgent Flash Pill on Left Panel
          drawRoundedRect(ctx, 42, 148, 280, 52, 14);
          ctx.fillStyle = primary;
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = `700 24px ${fontFamily}`;
          ctx.fillText(`🔥 ${poster.badgeText}`, 62, 183);

          // Headline on Left Panel
          ctx.fillStyle = "#ffffff";
          ctx.font = `700 44px ${fontFamily}`;
          const lines = wrapLines(ctx, poster.headline, leftW - 84, 3);
          lines.forEach((l, idx) => ctx.fillText(l, 42, 260 + idx * 54));

          // Highlights list
          let hy = 260 + lines.length * 54 + 28;
          poster.highlights.slice(0, 3).forEach((hl) => {
            ctx.fillStyle = "#fda4af";
            ctx.font = `700 22px ${fontFamily}`;
            ctx.fillText("✓", 42, hy);
            ctx.fillStyle = "#e2e8f0";
            ctx.font = `500 22px ${fontFamily}`;
            const hlLines = wrapLines(ctx, hl, leftW - 115, 2);
            hlLines.forEach((line, li) => {
              ctx.fillText(line, 70, hy + li * 30);
            });
            hy += hlLines.length * 30 + 18;
          });

          // Price Block near bottom left
          const priceBoxY = H - 255;
          drawRoundedRect(ctx, 42, priceBoxY, leftW - 84, 128, 24);
          ctx.fillStyle = "rgba(255,255,255,0.09)";
          ctx.fill();

          if (regularPrice > offerPrice) {
            ctx.fillStyle = "#94a3b8";
            ctx.font = `500 23px ${fontFamily}`;
            const rw = ctx.measureText(regFormatted).width;
            ctx.fillText(`${isEn ? "Regular:" : "আগের দাম:"} ${regFormatted}`, 66, priceBoxY + 44);
            const prefixW = ctx.measureText(`${isEn ? "Regular:" : "আগের দাম:"} `).width;
            ctx.strokeStyle = "#f43f5e";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(66 + prefixW, priceBoxY + 36);
            ctx.lineTo(66 + prefixW + rw, priceBoxY + 36);
            ctx.stroke();
          }

          ctx.fillStyle = "#fde047";
          ctx.font = `700 50px ${fontFamily}`;
          ctx.fillText(offerFormatted, 66, priceBoxY + 104);

          // Full-Width Bottom Order Ribbon
          ctx.fillStyle = primary;
          ctx.fillRect(0, H - 96, W, 96);
          ctx.fillStyle = "#ffffff";
          ctx.font = `700 28px ${fontFamily}`;
          ctx.textAlign = "center";
          ctx.fillText(
            `${poster.ctaText}  •  ${
              isEn ? "Cash on Delivery" : "পণ্য হাতে পেয়ে পেমেন্ট"
            }`,
            W / 2,
            H - 38
          );
          ctx.textAlign = "left";
        } else {
          // Default Signature Template: Magenta Luxe Offer Studio
          ctx.fillStyle = "#f8fafc";
          ctx.fillRect(0, 0, W, H);

          // Curved Deep Gradient Top Hero Banner
          const topH = H === 1350 ? 430 : 370;
          const topGrad = ctx.createLinearGradient(0, 0, W, topH);
          topGrad.addColorStop(0, "#0f172a");
          topGrad.addColorStop(0.6, "#4c0519");
          topGrad.addColorStop(1, primary);
          ctx.fillStyle = topGrad;
          ctx.fillRect(0, 0, W, topH);

          drawShopBadge(56, 44, true);

          // Accent Offer Pill Top Right
          ctx.save();
          ctx.font = `700 24px ${fontFamily}`;
          const badgeW = Math.max(215, ctx.measureText(poster.badgeText).width + 54);
          drawRoundedRect(ctx, W - 56 - badgeW, 50, badgeW, 54, 27);
          ctx.fillStyle = accent;
          ctx.fill();
          ctx.fillStyle = "#0f172a";
          ctx.textAlign = "center";
          ctx.fillText(poster.badgeText, W - 56 - badgeW / 2, 86);
          ctx.restore();

          // Product Headline right inside top header
          ctx.fillStyle = "#ffffff";
          ctx.font = `700 46px ${fontFamily}`;
          const titleLines = wrapLines(ctx, poster.headline, W - 112, 2);
          titleLines.forEach((l, idx) => ctx.fillText(l, 56, 175 + idx * 54));

          ctx.fillStyle = "#fecdd3";
          ctx.font = `500 24px ${fontFamily}`;
          ctx.fillText(
            poster.subline.slice(0, 56),
            56,
            175 + titleLines.length * 54 + 4
          );

          // Elevated Floating Studio Card for Product Photo
          const cardY = topH - 58;
          const cardH = H === 1350 ? 640 : 495;
          ctx.save();
          ctx.shadowColor = "rgba(15,23,42,0.16)";
          ctx.shadowBlur = 34;
          drawRoundedRect(ctx, 56, cardY, W - 112, cardH, 32);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.restore();

          if (loadedImg) {
            drawCoverImage(ctx, loadedImg, 70, cardY + 14, W - 140, cardH - 28, 24);
          } else {
            drawPhotoPlaceholder(70, cardY + 14, W - 140, cardH - 28, false);
          }

          // Floating High-Contrast Price Card overlapping bottom right of photo
          const pBoxW = 330;
          const pBoxH = 126;
          const pBoxX = W - 56 - pBoxW - 18;
          const pBoxY = cardY + cardH - pBoxH - 18;
          ctx.save();
          ctx.shadowColor = "rgba(15,23,42,0.28)";
          ctx.shadowBlur = 24;
          drawRoundedRect(ctx, pBoxX, pBoxY, pBoxW, pBoxH, 24);
          ctx.fillStyle = "#0f172a";
          ctx.fill();
          ctx.restore();

          ctx.fillStyle = "#cbd5e1";
          ctx.font = `500 22px ${fontFamily}`;
          if (regularPrice > offerPrice) {
            const label = isEn ? "Regular: " : "রেগুলার: ";
            const prefixW = ctx.measureText(label).width;
            const rw = ctx.measureText(regFormatted).width;
            ctx.fillText(`${label}${regFormatted}`, pBoxX + 26, pBoxY + 42);
            ctx.strokeStyle = "#fb7185";
            ctx.lineWidth = 2.8;
            ctx.beginPath();
            ctx.moveTo(pBoxX + 26 + prefixW, pBoxY + 34);
            ctx.lineTo(pBoxX + 28 + prefixW + rw, pBoxY + 34);
            ctx.stroke();
          } else {
            ctx.fillText(isEn ? "Special Price" : "অফার প্রাইস", pBoxX + 26, pBoxY + 42);
          }

          ctx.fillStyle = "#ffffff";
          ctx.font = `700 48px ${fontFamily}`;
          ctx.fillText(offerFormatted, pBoxX + 26, pBoxY + 98);

          // Feature Pills Row below card
          const featY = cardY + cardH + 46;
          ctx.fillStyle = "#334155";
          ctx.font = `600 24px ${fontFamily}`;
          const combinedFeatures = poster.highlights
            .slice(0, 3)
            .map((h) => `✓ ${h}`)
            .join("    ")
            .slice(0, 72);
          ctx.fillText(combinedFeatures, 56, featY);

          // Solid Bottom Trust & WhatsApp CTA Bar
          const footH = 104;
          const footY = H - footH - 28;
          drawRoundedRect(ctx, 56, footY, W - 112, footH, 26);
          ctx.fillStyle = primary;
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.font = `700 29px ${fontFamily}`;
          ctx.textAlign = "center";
          ctx.fillText(poster.ctaText, W / 2, footY + 48);
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.font = `500 20px ${fontFamily}`;
          ctx.fillText(
            brandKit.paymentPolicy.slice(0, 56),
            W / 2,
            footY + 80
          );
          ctx.textAlign = "left";
        }

        // Optional Scannable WhatsApp Order QR Code Badge (Top-Left of Photo Area)
        if (poster.showQr) {
          try {
            const digits = (brandKit.phoneWhatsapp || "").replace(/\D/g, "");
            const waText = encodeURIComponent(
              `আসসালামু আলাইকুম, আমি "${poster.headline}" অর্ডার করতে চাই।`
            );
            const qrUrl = digits
              ? `https://wa.me/88${digits.replace(/^88/, "")}?text=${waText}`
              : "https://sellorabd.vercel.app";
            const qrDataUrl = await QRCode.toDataURL(qrUrl, {
              width: 140,
              margin: 1,
              color: { dark: "#0f172a", light: "#ffffff" },
            });
            const qrImg = new Image();
            await new Promise<void>((resolve) => {
              qrImg.onload = () => resolve();
              qrImg.onerror = () => resolve();
              qrImg.src = qrDataUrl;
            });
            if (!cancelled) {
              const qx = 76;
              const qy = poster.templateId === "magenta_luxe" ? (H === 1350 ? 390 : 330) : 162;
              ctx.save();
              ctx.shadowColor = "rgba(0,0,0,0.28)";
              ctx.shadowBlur = 18;
              drawRoundedRect(ctx, qx, qy, 134, 158, 18);
              ctx.fillStyle = "#ffffff";
              ctx.fill();
              ctx.restore();
              ctx.drawImage(qrImg, qx + 11, qy + 10, 112, 112);
              ctx.fillStyle = "#be123c";
              ctx.font = `700 15px ${fontFamily}`;
              ctx.textAlign = "center";
              ctx.fillText(
                isEn ? "Scan to Order" : "স্ক্যান করে অর্ডার",
                qx + 67,
                qy + 142
              );
              ctx.textAlign = "left";
            }
          } catch {
            // ignore QR generation errors
          }
        }
      };

      render();
      return () => {
        cancelled = true;
      };
    }, [poster, brandKit, regularPrice, offerPrice, copyStyle, loadedImg, loadedLogo]);

    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/5 shadow-sm ${className}`}
      >
        <canvas
          ref={canvasRef}
          className="block h-auto w-full"
          style={{
            aspectRatio: poster.aspect === "portrait" ? "4 / 5" : "1 / 1",
          }}
        />
      </div>
    );
  }
);
