import React from "react";

// Mock data for the dashboard overview
const stats = [
  { name: "Total Sales", value: "$4,230.00", change: "+12% from last week" },
  { name: "Active Orders", value: "18", change: "4 pending preparation" },
  { name: "Products Listed", value: "32", change: "2 out of stock" },
  { name: "Store Rating", value: "4.9 ★", change: "Based on 112 reviews" },
];

const recentOrders = [
  { id: "#1024", customer: "Sarah Jenkins", items: "1x Chocolate Fudge Cake", total: "$45.00", status: "Preparing" },
  { id: "#1023", customer: "Michael Chang", items: "12x Red Velvet Cupcakes", total: "$36.00", status: "Ready for Pickup" },
  { id: "#1022", customer: "Emma Watson", items: "1x Custom Birthday Cake", total: "$120.00", status: "Delivered" },
];

export default function SellerDashboardPage() {
  return (
    <main className="py-8 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Welcome back, WonderBakes Chef! Here is your store overview.</p>
        </div>
        <button className="self-start px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700">
          + Add New Product
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div 
            key={stat.name} 
            className="p-6 transition-shadow border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-md"
          >
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.name}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</p>
            <p className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Main Sections Split */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders List (Takes up 2/3 columns on large screens) */}
        <div className="p-6 border lg:col-span-2 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <button className="text-sm font-medium text-orange-500 hover:underline">View all</button>
          </div>
          
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{order.customer} <span className="text-zinc-400 dark:text-zinc-500">{order.id}</span></p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{order.items}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{order.total}</p>
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    order.status === 'Delivered' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                    order.status === 'Preparing' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' :
                    'bg-blue-50 text-blue-700 ring-blue-600/20'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Bakery Status Sidebar */}
        <div className="p-6 border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <h2 className="mb-4 text-lg font-bold">Bakery Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <span className="text-sm">Store Acceptance</span>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">OPEN</span>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-zinc-400 tracking-wider">Quick Reminders</p>
              <ul className="text-sm space-y-1 text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                <li>Restock flour quantities tonight.</li>
                <li>Wedding cake pickup scheduled at 2:00 PM.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}