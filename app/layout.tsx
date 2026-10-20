import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Sellora AI — বাংলাদেশের F-Commerce উদ্যোক্তাদের #১ AI মার্কেটিং স্টুডিও",
  description:
    "পণ্যের ছবি ও দাম দিন — ৩০ সেকেন্ডে পান বুস্ট-রেডি HD বাংলা অফার পোস্টার, Facebook Ad Copy ও ইনবক্স ক্লোজিং স্ক্রিপ্ট।",
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
      </body>
    </html>
  );
}
