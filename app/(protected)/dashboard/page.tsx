"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";  

export default function DashboardPage() {
  const [name, setName] = useState("");
  const [stats, setStats] = useState({
    totalIncome: 124500,
    totalOrders: 28,
    activeProducts: 12,
    pendingOrders: 5,
  });

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (data) {
      setName(data.full_name);
    }
  }

  const recentOrders = [
    { id: 1, customer: "Jane Doe", product: "Chocolate Cake", amount: 2500, status: "pending" },
    { id: 2, customer: "John Mwangi", product: "Pepperoni Pizza", amount: 2400, status: "accepted" },
    { id: 3, customer: "Mary Wambui", product: "Rose Bouquet", amount: 1800, status: "ready" },
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto py-6 space-y-6 sm:py-8 sm:space-y-8">
      
      {/* Welcome Top Banner Area */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-zinc-900 dark:text-zinc-50">
            Hello, {name || "Seller"} 👋
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Welcome back to your WonderBakes Dashboard
          </p>
        </div>
      </div>

      {/* Key Stats Matrix Grid: Explicit 2-wide columns layout on mobile monitors */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        
        <div className="p-5 border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Income</p>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-pink-600 dark:text-pink-400 sm:text-2xl">
            KES {stats.totalIncome.toLocaleString()}
          </h2>
          <p className="mt-1 text-[11px] text-green-500 font-medium">This Month</p>
        </div>

        <div className="p-5 border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Orders</p>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
            {stats.totalOrders}
          </h2>
          <p className="mt-1 text-[11px] text-zinc-400 font-medium">All-time packages</p>
        </div>

        <div className="p-5 border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Active Products</p>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
            {stats.activeProducts}
          </h2>
          <p className="mt-1 text-[11px] text-zinc-400 font-medium">Live items</p>
        </div>

        <div className="p-5 border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Pending Orders</p>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-amber-500 dark:text-amber-400 sm:text-2xl">
            {stats.pendingOrders}
          </h2>
          <p className="mt-1 text-[11px] text-amber-500/80 font-medium">Requires dispatch</p>
        </div>

      </div>

      {/* Workspace Split Panels */}
      {/* On phone screen views, this holds a persistent dashboard slider flow */}
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:pb-0">
        
        {/* Recent Orders Table Panel Frame */}
        <div className="w-[88vw] shrink-0 snap-center p-5 border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 sm:w-auto sm:col-span-2">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-4">Recent Orders</h3>
          
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs sm:text-sm">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="space-y-0.5">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">{order.product}</p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">by {order.customer}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-zinc-900 dark:text-zinc-50">KES {order.amount.toLocaleString()}</p>
                  <span className={`inline-block px-2.5 py-0.5 text-[10px] font-medium rounded-full uppercase tracking-wider ${
                    order.status === "pending"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
                      : "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel Area */}
        <div className="w-[88vw] shrink-0 snap-center p-5 border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 sm:w-auto">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-2.5">
            <button className="w-full text-left p-3.5 text-xs font-semibold rounded-lg border bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-700 transition-all text-zinc-700 dark:text-zinc-300 cursor-pointer">
              Add New Product
            </button>
            <button className="w-full text-left p-3.5 text-xs font-semibold rounded-lg border bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-700 transition-all text-zinc-700 dark:text-zinc-300 cursor-pointer">
              Manage Orders
            </button>
            <button className="w-full text-left p-3.5 text-xs font-semibold rounded-lg border bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-700 transition-all text-zinc-700 dark:text-zinc-300 cursor-pointer">
              View Payouts
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}