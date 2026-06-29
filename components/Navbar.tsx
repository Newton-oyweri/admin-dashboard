"use client";

import { supabase } from "@/lib/client";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Navbar({ currentTab, setCurrentTab }: NavbarProps) {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "orders", label: "Orders" },
    { id: "products", label: "Products" },
    { id: "payouts", label: "Payouts" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <nav className="w-full sticky top-0 z-50 bg-white border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-xs">
      {/* Aligns directly inside your 1200px viewport constraint smoothly */}
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 py-4 sm:px-6">
        
        {/* Navigation Tabs Track */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar sm:gap-6">
          {navigationItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
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

        {/* Destructive Action Logout Trigger */}
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