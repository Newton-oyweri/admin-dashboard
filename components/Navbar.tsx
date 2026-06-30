"use client";

import { useState } from "react";
import { supabase } from "@/lib/client";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", path: "/" },
    { id: "orders", label: "Orders", path: "/orders" },
    { id: "products", label: "Products", path: "/products" },
    { id: "payouts", label: "Payouts", path: "/payouts" },
    { id: "settings", label: "Settings", path: "/settings" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/90 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {navigationItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="ml-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
