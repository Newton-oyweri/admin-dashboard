"use client";

import { supabase } from "@/lib/client";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", path: "/" },
    { id: "orders", label: "Orders", path: "/orders" },
    { id: "products", label: "Products", path: "/products" },
    { id: "payouts", label: "Payouts", path: "/payouts" },
    { id: "settings", label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="w-full sticky top-0 z-50 bg-white border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-xs">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar sm:gap-6">
          {navigationItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`text-sm font-medium transition-colors cursor-pointer whitespace-nowrap pb-1 border-b-2 ${
                  isActive
                    ? "text-orange-500 border-orange-500 dark:text-orange-400 dark:border-orange-400 font-semibold"
                    : "text-zinc-500 border-transparent hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          className="text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer ml-4 shrink-0"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}