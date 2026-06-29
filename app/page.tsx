import React from "react";

const stats = [
  { name: "Sales", value: "$4,230", change: "+12%" },
  { name: "Orders", value: "18", change: "4 pend" },
  { name: "Items", value: "32", change: "2 out" },
  { name: "Rating", value: "4.9 ★", change: "112 rev" },
];

const recentOrders = [
  { id: "#1024", customer: "Sarah J.", items: "1x Choc Cake", total: "$45.00", status: "Prep" },
  { id: "#1023", customer: "Michael C.", items: "12x Cupcakes", total: "$36.00", status: "Ready" },
  { id: "#1022", customer: "Emma W.", items: "1x Custom Cake", total: "$120.00", status: "Done" },
];

export default function MobileDashboardPage() {
  return (
    <main className="py-4 space-y-4 px-2 sm:px-0">
      {/* Dashboard Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-xs text-zinc-500 sm:text-base">WonderBakes Seller Hub</p>
        </div>
        <button className="px-3 py-1.5 text-xs font-medium text-white rounded-lg bg-orange-500 hover:bg-orange-600">
          + New
        </button>
      </div>

      {/* Stats Grid: Forced 2x2 grid on mobile, expands to 4 columns on desktop */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.name} 
            className="p-3 border rounded-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
          >
            <p className="text-xs font-medium text-zinc-500">{stat.name}</p>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-lg font-bold tracking-tight sm:text-2xl">{stat.value}</p>
              <p className="text-[10px] font-medium text-green-600">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Sections: Forced Side-by-Side Horizontal Scroll on Mobile */}
      {/* On desktop, it falls back into a standard grid format */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:pb-0">
        
        {/* Recent Orders Card */}
        <div className="w-[85vw] shrink-0 snap-center p-4 border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 sm:w-auto sm:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold sm:text-lg">Recent Orders</h2>
            <button className="text-xs font-medium text-orange-500">All</button>
          </div>
          
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs sm:text-sm">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium">{order.customer}</p>
                  <p className="text-[11px] text-zinc-400">{order.items}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{order.total}</p>
                  <span className="text-[10px] text-zinc-500 font-mono">{order.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Status Card */}
        <div className="w-[85vw] shrink-0 snap-center p-4 border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 sm:w-auto">
          <h2 className="mb-3 text-sm font-bold sm:text-lg">Bakery Status</h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-800/50">
              <span>Acceptance</span>
              <span className="font-bold text-green-600">OPEN</span>
            </div>
            <div className="p-2 border border-dashed rounded border-zinc-200 dark:border-zinc-800">
              <p className="font-semibold text-zinc-400 mb-1 text-[10px] uppercase">Reminders</p>
              <p className="text-zinc-600 dark:text-zinc-400">Restock flour tonight.</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}