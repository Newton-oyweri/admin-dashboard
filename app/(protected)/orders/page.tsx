"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function OrdersPage() {
  const [orders, setOrders] = useState([
    {
      id: 1,
      customer: "Jane Doe",
      product: "Chocolate Birthday Cake",
      quantity: 1,
      total: 2500,
      date: "2025-06-25",
      status: "pending",
    },
    {
      id: 2,
      customer: "John Mwangi",
      product: "Large Pepperoni Pizza",
      quantity: 2,
      total: 2400,
      date: "2025-06-25",
      status: "accepted",
    },
    {
      id: 3,
      customer: "Mary Wambui",
      product: "Red Roses Bouquet",
      quantity: 1,
      total: 1800,
      date: "2025-06-24",
      status: "in_progress",
    },
    {
      id: 4,
      customer: "Peter Kimani",
      product: "Vanilla Cake",
      quantity: 1,
      total: 2200,
      date: "2025-06-23",
      status: "ready",
    },
  ]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return { background: "#fef3c7", color: "#d97706" };
      case "accepted":
        return { background: "#dbeafe", color: "#2563eb" };
      case "in_progress":
        return { background: "#d1fae5", color: "#10b981" };
      case "ready":
        return { background: "#f3e8ff", color: "#8b5cf6" };
      default:
        return { background: "#f3f4f6", color: "#6b7280" };
    }
  };

  const updateStatus = (id: number, newStatus: string) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const getNextStatus = (current: string) => {
    if (current === "pending") return "accepted";
    if (current === "accepted") return "in_progress";
    if (current === "in_progress") return "ready";
    return current;
  };

  const getButtonText = (status: string) => {
    if (status === "pending") return "Accept Order";
    if (status === "accepted") return "Mark In Preparation";
    if (status === "in_progress") return "Mark Ready";
    return "Completed";
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto py-6 space-y-6 sm:py-8 sm:space-y-8">
      <Navbar />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-zinc-900 dark:text-zinc-50">
            Orders
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage customer orders and update their progress
          </p>
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Total: <span className="font-semibold text-zinc-900 dark:text-zinc-50">{orders.length}</span>
        </div>
      </div>

      <div className="border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">No orders yet</p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Orders will appear here once customers place them</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                        {order.product}
                      </h3>
                    </div>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {order.date}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Customer: <span className="font-medium text-zinc-900 dark:text-zinc-50">{order.customer}</span>
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Qty: <span className="font-medium">{order.quantity}</span>
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Total: <span className="font-bold text-pink-600 dark:text-pink-400">
                        KES {order.total.toLocaleString()}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:flex-nowrap flex-wrap">
                  <div
                    className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={getStatusStyle(order.status)}
                  >
                    {order.status.replace("_", " ")}
                  </div>

                  {!["ready", "delivered", "cancelled"].includes(order.status) && (
                    <button
                      onClick={() => updateStatus(order.id, getNextStatus(order.status))}
                      className="px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                      {getButtonText(order.status)}
                    </button>
                  )}

                  {order.status === "ready" && (
                    <div className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-lg whitespace-nowrap">
                      Ready for Delivery
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <p>Seller can update orders up to <strong className="text-zinc-600 dark:text-zinc-400">Ready</strong> status. Delivery is handled by customers or riders.</p>
      </div>
    </div>
  );
}