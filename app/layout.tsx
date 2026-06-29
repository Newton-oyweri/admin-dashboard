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
      <head>
        {/* Forces the phone browser to map the viewport track at 1200px directly */}
        <meta name="viewport" content="width=1200, initial-scale=1" />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
        {children}
      </body>
    </html>
  );
}