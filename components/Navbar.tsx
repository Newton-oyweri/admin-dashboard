"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/client";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [userName, setUserName] = useState<string>("Seller");

  useEffect(() => {
    async function getActiveUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Seller";
        setUserName(name);
      }
    }
    getActiveUser();
  }, []);

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
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/90 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Navigation items & Dynamic Welcome banner */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 pl-1 whitespace-nowrap">
            Welcome back, {userName}
          </span>
          
          <div className="h-px sm:h-4 w-full sm:w-px bg-zinc-200 dark:bg-zinc-700 hidden sm:block" />
          
          <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {navigationItems.map((item) => {
              const isActive = pathname === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.path)}
                  className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
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
        </div>

        {/* Action Controls */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg bg-red-500 hover:bg-red-600 px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
        >
          {loggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}