"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";

// Import your custom views directly from your protected folder track
import DashboardView from "./(protected)/dashboard/page";
import OrdersView from "./(protected)/orders/page";
import ProductsView from "./(protected)/products/page";
import PayoutsView from "./(protected)/payouts/page";
import SettingsView from "./(protected)/settings/page";

export default function MainAppHub() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserSession();
  }, []);

  async function checkUserSession() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Auth session exception error:", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm font-medium text-zinc-500 animate-pulse">
          Verifying WonderBakes secure session...
          </p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Dictionary mapping states to views dynamically
  const renderActiveComponent = () => {
    switch (currentTab) {
      case "dashboard":
        return <DashboardView />;
      case "orders":
        return <OrdersView />;
      case "products":
        return <ProductsView />;
      case "payouts":
        return <PayoutsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "orders", label: "Orders" },
    { id: "products", label: "Products" },
    { id: "payouts", label: "Payouts" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      
      {/* 1. Global Responsive Sticky Navbar */}
      <nav className="w-full sticky top-0 z-50 bg-white border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-xs">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 py-4 sm:px-6">
          
          {/* Navigation Items Track */}
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar sm:gap-6">
            {navItems.map((item) => {
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

          {/* Logout Trigger */}
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer ml-4 shrink-0"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* 2. Main Page Active Tab Render Workspace */}
      {/* Enforces your 1200px width limit perfectly across all dynamically swapped pages */}
      <div className="w-full max-w-[1200px] mx-auto flex-1 flex flex-col px-4 sm:px-6">
        {renderActiveComponent()}
      </div>

    </div>
  );
}