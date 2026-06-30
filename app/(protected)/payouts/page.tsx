"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function PayoutsPage() {
  const [totalIncome] = useState(124500); // KES

  const recentSales = [
    {
      id: 1,
      product: "Chocolate Birthday Cake",
      amount: 2500,
      date: "2025-06-24",
      status: "Delivered",
    },
    {
      id: 2,
      product: "Pepperoni Pizza (Large)",
      amount: 1200,
      date: "2025-06-23",
      status: "Delivered",
    },
    {
      id: 3,
      product: "Red Roses Bouquet",
      amount: 1800,
      date: "2025-06-22",
      status: "Delivered",
    },
    {
      id: 4,
      product: "Vanilla Cake",
      amount: 2200,
      date: "2025-06-21",
      status: "Delivered",
    },
  ];

  const categoryBreakdown = [
    { category: "Cake", sales: 8, income: 28500 },
    { category: "Pizza", sales: 12, income: 15600 },
    { category: "Flower", sales: 5, income: 9200 },
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto py-6 space-y-6 sm:py-8 sm:space-y-8">
      <Navbar />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-zinc-900 dark:text-zinc-50">
            Payouts
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track your earnings and request payouts
          </p>
        </div>
      </div>

      {/* Total Income Card */}
      <div className="border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs p-8 text-center">
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">Total Income</p>
        <h2 className="text-4xl sm:text-5xl font-bold text-pink-600 dark:text-pink-400 mb-3">
          KES {totalIncome.toLocaleString()}
        </h2>
        <p className="text-sm font-medium text-emerald-500 dark:text-emerald-400">This Month</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Category Breakdown */}
        <div className="border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs p-5 sm:p-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Income by Category
          </h3>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {categoryBreakdown.map((item, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {item.category}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {item.sales} sales
                  </p>
                </div>
                <div className="text-right font-bold text-zinc-900 dark:text-zinc-50">
                  KES {item.income.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs p-5 sm:p-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Total Orders</span>
              <strong className="text-zinc-900 dark:text-zinc-50">25</strong>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Pending Payout</span>
              <strong className="text-pink-600 dark:text-pink-400">KES 18,500</strong>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Next Payout Date</span>
              <strong className="text-zinc-900 dark:text-zinc-50">July 5, 2025</strong>
            </div>
          </div>

          <button className="w-full mt-6 px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">
            Request Payout
          </button>
        </div>
      </div>

      {/* Recent Sales */}
      <div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Recent Sales
        </h3>
        
        <div className="border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {sale.product}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {sale.date}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    + KES {sale.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {sale.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}