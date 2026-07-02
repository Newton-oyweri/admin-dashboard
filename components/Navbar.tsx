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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Detect if running as PWA
  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;
    setIsInstalled(isPWA);
  }, []);

  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

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

  const visibleItems = allNavigationItems.filter((item) => {
    if (!userRole) return false;
    
    if (userRole === "admin") return true;
    if (userRole === "delivery_person") return item.id === "delivery";
    if (userRole === "seller") return item.id !== "delivery";
    
    return false;
  });

  // Hide install button if already installed as PWA
  const showInstallButton = !isInstalled && deferredPrompt;

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
        <div className="flex items-center gap-3">
          {showInstallButton && (
            <div className="flex flex-col items-end">
              <button
                onClick={handleInstallClick}
                className="rounded-lg bg-orange-500 hover:bg-orange-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-[0.985]"
              >
                Download App
              </button>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                WonderBakes Seller is better on app
              </p>
            </div>
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