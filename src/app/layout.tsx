import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { TopLoader } from "@/components/TopLoader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPortal - Hệ thống quản lý tiền lương",
  description: "SPortal - Hệ thống quản lý tiền lương",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense><TopLoader /></Suspense>
        <div className="flex-1">{children}</div>
        <footer className="bg-slate-800 text-slate-300 py-6 px-4 print:hidden">
          <div className="max-w-5xl mx-auto text-center space-y-2">
            <p className="text-sm font-semibold text-white">Phòng Chuyển đổi số — THACO AGRI KLH SNUOL</p>
            <p className="text-xs text-slate-400">SPortal v1.0 — Hệ thống quản lý tiền lương nội bộ</p>
            <div className="h-px w-16 bg-slate-600 mx-auto my-2" />
            <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} THACO AGRI SNUOL COMPLEX. All rights reserved.</p>
            <p className="text-[10px] text-slate-600">Mọi thông tin trên hệ thống là tài sản bảo mật của Công ty. Nghiêm cấm sao chép, chia sẻ dưới mọi hình thức.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
