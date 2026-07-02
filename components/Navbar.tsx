"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/client";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [userName, setUserName] = useState<string>("User");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function getActiveUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch full_name and role from your profiles table schema
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

        if (!error && profile) {
          setUserName(profile.full_name || "User");
          setUserRole(profile.role);
        } else {
          const fallbackName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
          setUserName(fallbackName);
        }
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

  const allNavigationItems = [
    { id: "orders", label: "My orders", path: "/" },
    { id: "products", label: "My Products", path: "/products" },
    { id: "payouts", label: "Payout", path: "/payouts" },
    { id: "delivery", label: "Delivery", path: "/delivery" },
  ];

  // Simply show tabs dynamically based on their role profile
  const visibleItems = allNavigationItems.filter((item) => {
    if (!userRole) return false; // Hold tabs rendering until the role identity loads
    
    if (userRole === "admin") return true; // Admins can view absolutely everything
    if (userRole === "delivery_person") return item.id === "delivery"; // Delivery sees only delivery tab
    if (userRole === "seller") return item.id !== "delivery"; // Sellers see everything EXCEPT delivery
    
    return false; // Default fallback for raw customers
  });

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
            {visibleItems.map((item) => {
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