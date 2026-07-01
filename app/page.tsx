"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { fetchSellerOrders, updateOrderStatus, getSessionUser, OrderWithDetails } from "./(protected)/orders/actions";

interface ParsedNotes {
  customWriting?: string;
  fulfillmentMethod?: string;
  deliveryAddress?: string;
  productName?: string;
  orderedAt?: string;
}

const STATUS_MAP: Record<string, { label: string; container: string }> = {
  pending: { label: "Pending", container: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30" },
  accepted: { label: "Accepted", container: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30" },
  in_progress: { label: "In Progress", container: "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30" },
  ready: { label: "Ready", container: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30" },
  delivered: { label: "Delivered", container: "bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30" },
  default: { label: "Unknown", container: "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/50" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerId, setSellerId] = useState<string | null>(null);

  async function loadData(id: string) {
    setLoading(true);
    const serverOrders = await fetchSellerOrders(id);
    setOrders(serverOrders);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      const user = await getSessionUser();
      if (user) {
        setSellerId(user.id);
        await loadData(user.id);
      } else {
        alert("Session expired. Please sign in again.");
      }
    }
    init();
  }, []);

  const handleStateProgression = async (id: string, currentStatus: string) => {
    if (!sellerId) return;
    
    let nextStatus = currentStatus;
    if (currentStatus === "pending") nextStatus = "accepted";
    else if (currentStatus === "accepted") nextStatus = "in_progress";
    else if (currentStatus === "in_progress") nextStatus = "ready";

    const success = await updateOrderStatus(id, nextStatus);
    if (success) {
      await loadData(sellerId);
    } else {
      alert("Failed to advance order step.");
    }
  };

  const safeParseNotes = (rawNotes: string | null): ParsedNotes => {
    if (!rawNotes) return {};
    try {
      return JSON.parse(rawNotes);
    } catch {
      return { customWriting: rawNotes };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 sm:px-6 sm:py-8 sm:space-y-8 text-zinc-900 dark:text-zinc-50 antialiased">
      <Navbar />
      
      {/* Friendly Store Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-zinc-900 dark:text-white">Your Orders</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track your incoming sales, manage customer requests, and fulfill your handbacks smoothly.
          </p>
        </div>
        <div className="inline-flex items-center self-start sm:self-center bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-400 shadow-xs">
          Active Store Orders: <span className="font-bold ml-1.5 px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40">{orders.length}</span>
        </div>
      </div>

      {/* Loading State Container */}
      {loading ? (
        <div className="border rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 p-20 flex flex-col items-center justify-center space-y-3 shadow-xs">
          <div className="h-7 w-7 animate-spin rounded-full border-[2.5px] border-zinc-900 dark:border-zinc-100 border-t-transparent"></div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading your store metrics...</p>
        </div>
      ) : orders.length === 0 ? (
        /* Empty State with direct Seller Engagement */
        <div className="border rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 py-24 px-4 text-center shadow-xs">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 mb-3 text-xl">
            👋
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">All caught up!</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1 max-w-sm mx-auto">
            No live orders found right now. Once clients check out items from your shop listings, they will show up right here.
          </p>
        </div>
      ) : (
        /* Isolated Blocks Layout Grid */
        <div className="space-y-4 sm:space-y-6">
          {orders.map((order) => {
            const notesDetails = safeParseNotes(order.notes);
            const badgeStyle = STATUS_MAP[order.status] || STATUS_MAP.default;
            
            return (
              <div
                key={order.id}
                className="border rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 flex flex-col space-y-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-150 shadow-xs"
              >
                {/* Meta Identifiers & Financial Block */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  
                  <div className="flex items-start gap-4 min-w-0">
                    {order.products?.image_urls && order.products.image_urls.length > 0 ? (
                      <img
                        src={order.products.image_urls[0]}
                        alt={order.products?.name || "Product"}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-zinc-200/60 dark:border-zinc-800 shrink-0 shadow-2xs"
                      />
                    ) : (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/60 rounded-xl flex items-center justify-center text-[10px] font-medium text-zinc-400 tracking-wider uppercase shrink-0">
                        No Image
                      </div>
                    )}

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 leading-snug truncate">
                          {order.products?.name || notesDetails.productName || "Product Listing"}
                        </h3>
                        {order.order_number && (
                          <span className="inline-flex items-center text-[10px] tracking-wider font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/50">
                            #{order.order_number}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>Customer: <strong className="text-zinc-800 dark:text-zinc-200 font-medium">{order.profiles?.full_name || "Guest Checkout"}</strong></span>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <span>Quantity: <strong className="text-zinc-800 dark:text-zinc-200 font-medium">{order.quantity}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Revenue tag */}
                  <div className="flex items-center sm:items-end justify-between sm:flex-col gap-1.5 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.02] border border-emerald-500/10 p-3 rounded-xl min-w-[150px] self-start sm:self-auto w-full sm:w-auto">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">
                      ✓ Paid 
                    </span>
                    <span className="text-lg sm:text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400 leading-none">
                      KES {Number(order.total_amount).toLocaleString()}
                    </span>
                  </div>

                </div>

                {/* Logistics & Request Sections */}
                {(notesDetails.customWriting || notesDetails.deliveryAddress) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/60 p-4 rounded-xl text-xs sm:text-sm">
                    {notesDetails.customWriting && (
                      <div className="space-y-1.5">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Customer Request
                        </span>
                        <p className="text-zinc-800 dark:text-zinc-200 font-medium bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 shadow-2xs">
                          {notesDetails.customWriting}
                        </p>
                      </div>
                    )}
                    
                    {notesDetails.deliveryAddress && (
                      <div className="space-y-1.5">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Fulfillment Address ({notesDetails.fulfillmentMethod?.replace('_', ' ') || 'Standard Courier'})
                        </span>
                        <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 shadow-2xs">
                          {notesDetails.deliveryAddress}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Operational Progress Footbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-900">
                  <div className="flex items-center text-xs text-zinc-400 dark:text-zinc-500">
                    <span>Received: {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${badgeStyle.container}`}>
                      {badgeStyle.label}
                    </div>

                    {["pending", "accepted", "in_progress"].includes(order.status) && (
                      <button
                        onClick={() => handleStateProgression(order.id, order.status)}
                        className="px-4 py-1.5 bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-900 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-semibold rounded-lg transition-all active:scale-[0.98] cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        {order.status === "pending" && "Accept Order"}
                        {order.status === "accepted" && "Start Preparation"}
                        {order.status === "in_progress" && "Mark Ready"}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}