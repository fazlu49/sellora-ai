import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-sans-en",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#e11d48",
};

export const metadata: Metadata = {
  title: "Sellora AI — বাংলাদেশের F-Commerce উদ্যোক্তাদের #১ AI মার্কেটিং স্টুডিও",
  description:
    "পণ্যের ছবি ও দাম দিন — ৩০ সেকেন্ডে পান বুস্ট-রেডি HD বাংলা অফার পোস্টার, QR কোড, ডিজিটাল ক্যাশ মেমো, রিলস ভিডিও স্ক্রিপ্ট ও Facebook Ad Copy।",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sellora AI",
  },
  openGraph: {
    title: "Sellora AI — ৩০ সেকেন্ডে অফার পোস্টার, ক্যাশ মেমো ও বাংলা বিজ্ঞাপন",
    description:
      "বাংলাদেশের Facebook ও WhatsApp উদ্যোক্তাদের অল-ইন-ওয়ান AI মার্কেটিং ও বিজনেস স্টুডিও।",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${plusJakarta.variable} antialiased`}
    >
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-rose-100 selection:text-rose-900">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); }); }`,
          }}
        />
      </body>
    </html>
  );
}
