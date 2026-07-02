"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/client";
import { usePathname, useRouter } from "next/navigation";

// Define a structural interface for the standard browser installation prompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [userName, setUserName] = useState<string>("User");
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // PWA State Handles
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    async function getActiveUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
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

    // Listen for the browser's native PWA installation prompt request
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent standard browser banners from displaying directly automatically
      e.preventDefault();
      // Save the event state wrapper so it can be manually triggered on tap later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBtn(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Optional: Hide the button immediately if the application gets installed successfully
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    
    // Show the native browser installation confirmation modal dialog box
    deferredPrompt.prompt();
    
    // Await user's structural confirmation target action choice
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted the PWA install application request");
    }
    
    // Clear prompt hook resource metrics context state references
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

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

  const visibleItems = allNavigationItems.filter((item) => {
    if (!userRole) return false;
    
    if (userRole === "admin") return true;
    if (userRole === "delivery_person") return item.id === "delivery";
    if (userRole === "seller") return item.id !== "delivery";
    
    return false;
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
        <div className="flex items-center gap-2 justify-end sm:w-auto">
          {showInstallBtn && (
            <button
              onClick={handleInstallPWA}
              className="rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:hover:bg-orange-950/70 border border-orange-200/40 dark:border-orange-900/30 px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer whitespace-nowrap"
            >
              📥 Download App
            </button>
          )}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-lg bg-red-500 hover:bg-red-600 px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            {loggingOut ? "Signing out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}