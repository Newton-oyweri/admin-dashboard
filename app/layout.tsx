// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers";

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

export const metadata: Metadata = {
  title: "WonderBakes Seller",
  description: "Seller Dashboard",
  // 1. Link your manifest file
  manifest: "/manifest.json",
  // 2. Configure proper Apple web app setup parameters
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WB Seller",
  },
  // 3. Declare the explicit target apple touch icon reference 
  icons: {
    apple: [
      { url: "/icon.png", sizes: "192x192", type: "image/png" }
    ]
  }
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
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}