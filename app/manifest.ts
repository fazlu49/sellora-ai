import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sellora AI — F-Commerce AI Marketing Studio",
    short_name: "Sellora AI",
    description:
      "৩০ সেকেন্ডে তৈরি করুন HD বাংলা অফার পোস্টার, Facebook Ad Copy, ক্যাশ মেমো ও রিলস স্ক্রিপ্ট।",
    start_url: "/",
    display: "standalone",
    background_color: "#090d16",
    theme_color: "#e11d48",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
