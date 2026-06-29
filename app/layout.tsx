import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#f97316",
};

export const metadata = {
  title: "WonderBakes Seller",
  description: "Seller Dashboard",
  manifest: "/manifest.json",
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
        {/* The 1200px Fixed-Width Container */}
        <div className="w-full max-w-[1200px] mx-auto flex-1 flex flex-col px-4 sm:px-6">
          {children}
        </div>
      </body>
    </html>
  );
}
