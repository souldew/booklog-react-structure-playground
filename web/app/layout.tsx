import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppLayout } from "@/app/layouts/AppLayout/AppLayout";

import "@/app/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "booklog",
  description: "URL 設計と画面の分け方を確かめる読書管理デモ",
};

// Next.js の Root Layout。html / body、フォント、メタデータだけを持つ。
// ヘッダーと <main> の骨格 (AppLayout) とグローバル CSS は src/app (FSD の app 層) にあり、ここは呼ぶだけ。
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
