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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        
        {/* Left Side: Welcome Text + Scrollable Navigation Links */}
        <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
          <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 whitespace-nowrap shrink-0">
            Hi, {userName.split(" ")[0]} {/* Shortened to first name on mobile to save space */}
          </span>
          
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 shrink-0" />
          
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1">
            {visibleItems.map((item) => {
              const isActive = pathname === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.path)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 ${
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

        {/* Right Side: Quick Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {showInstallButton && (
            <button
              onClick={handleInstallClick}
              className="rounded-md bg-orange-500 hover:bg-orange-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition active:scale-[0.985] whitespace-nowrap"
              title="WonderBakes Seller is better on app"
            >
              Get App
            </button>
          )}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-md bg-red-500 hover:bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer whitespace-nowrap"
          >
            {loggingOut ? "..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}