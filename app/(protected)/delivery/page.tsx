"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { updateOrderStatus, OrderWithDetails } from "./actions";
import { supabase } from "@/lib/client";

interface ParsedNotes {
  customWriting?: string;
  fulfillmentMethod?: string;
  deliveryAddress?: string;
  productName?: string;
}

const STATUS_MAP: Record<string, { label: string; container: string }> = {
  ready: { label: "Ready at Store", container: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30" },
  pickup: { label: "Arrived at Store (Tap to Notify)", container: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30" },
  delivered: { label: "Delivered", container: "bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30" },
  default: { label: "Processing", container: "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/50" },
};

export default function DeliveryPortalPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [searching, setSearching] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setSearching(true);
    setError(null);
    setOrder(null);

    try {
      const { data, error: dbError } = await supabase
        .from("orders")
        .select(`
          *,
          products(*),
          profiles:profiles!orders_customer_id_fkey(*)
        `)
        .eq("order_number", orderNumber.trim())
        .maybeSingle();

      if (dbError) throw dbError;

      if (data) {
        setOrder(data as unknown as OrderWithDetails);
      } else {
        setError(`No active order records found for code "${orderNumber}".`);
      }
    } catch (err: any) {
      console.error("Search Error Detail:", err);
      setError(err?.message || "Failed to search the database framework for this order number.");
    } finally {
      setSearching(false);
    }
  };

  const handleStatusChange = async (targetStatus: "pickup" | "delivered") => {
    if (!order) return;
    
    const confirmationPrompt = targetStatus === "pickup" 
      ? "Confirm product has arrived? This will notify the customer."
      : "Confirm that the product has been delivered to the customer?";
      
    if (!window.confirm(confirmationPrompt)) return;

    setUpdating(true);
    try {
      const success = await updateOrderStatus(order.id, targetStatus);
      if (success) {
        setOrder({ ...order, status: targetStatus });
        if (targetStatus === "pickup") {
          alert("Status changed: Product has arrived and customer has been notified!");
        } else {
          alert("Status changed: Product has been successfully delivered!");
        }
      } else {
        alert("Failed to update status values.");
      }
    } catch (err) {
      alert("An absolute system process bounds failure crashed this update cycle.");
    } finally {
      setUpdating(false);
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

  const notesDetails = order ? safeParseNotes(order.notes) : {};
  const badgeStyle = order ? (STATUS_MAP[order.status] || STATUS_MAP.default) : STATUS_MAP.default;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 sm:px-6 sm:py-8 sm:space-y-8 text-zinc-900 dark:text-zinc-50 antialiased">
      <Navbar />

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-zinc-900 dark:text-white">Courier Fulfillment Portal</h1>
           <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
  Enter order reference numbers, update delivery status , and notify customers when their delivery has arrived.
</p>
        </div>

        {/* Search Layout UI Row */}
        <form onSubmit={handleSearch} className="flex gap-2 bg-white dark:bg-zinc-950 p-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
          <input
            type="text"
            placeholder="Search Order Number (e.g., ORD-0029841)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none border-0 focus:ring-0 placeholder-zinc-400 dark:placeholder-zinc-500 font-mono tracking-wide"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2 bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 text-white dark:text-zinc-950 text-xs font-semibold rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
          >
            {searching ? "Searching..." : "Find Package"}
          </button>
        </form>

        {error && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs sm:text-sm text-amber-800 dark:text-amber-400 font-medium">
            {error}
          </div>
        )}

        {/* Search Results Display Display Card */}
        {order && (
          <div className="border rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 flex flex-col space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                {order.products?.image_urls && order.products.image_urls.length > 0 ? (
                  <img
                    src={order.products.image_urls[0]}
                    alt="Product Cargo Image"
                    className="w-14 h-14 object-cover rounded-xl border border-zinc-200/60 dark:border-zinc-800 shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/60 rounded-xl flex items-center justify-center text-[9px] font-medium text-zinc-400 tracking-wider uppercase shrink-0">
                    📦 Treat
                  </div>
                )}

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100 truncate">
                      {order.products?.name || notesDetails.productName || "Product Cargo"}
                    </h3>
                    <span className="inline-flex items-center text-[10px] tracking-wider font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/50">
                      #{order.order_number}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-0.5">
                    <p>Recipient: <strong className="text-zinc-800 dark:text-zinc-200 font-medium">{order.profiles?.full_name || "Guest Check-out"}</strong></p>
                    <p>Quantity Footprint: <strong className="text-zinc-800 dark:text-zinc-200 font-medium">{order.quantity} Count</strong></p>
                  </div>
                </div>
              </div>

              <div className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border self-start ${badgeStyle.container}`}>
                {badgeStyle.label}
              </div>
            </div>

            {/* Address notes rendering blocks */}
            {(notesDetails.customWriting || notesDetails.deliveryAddress) && (
              <div className="grid grid-cols-1 gap-4 bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/60 p-4 rounded-xl text-xs sm:text-sm">
                {notesDetails.deliveryAddress && (
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Drop-off Coordinates ({notesDetails.fulfillmentMethod?.replace('_', ' ') || 'Standard Courier'})
                    </span>
                    <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 shadow-sm">
                      {notesDetails.deliveryAddress}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mutation Flow Action Triggers Bar layout items */}
            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-zinc-400 dark:text-zinc-500">
                Created: {new Date(order.created_at || "").toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
              </div>

              <div className="flex items-center gap-2 justify-end">
                {/* Ready -> Pickup Mutation Trigger Action Button */}
                {["pending", "accepted", "in_progress", "ready"].includes(order.status) && (
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleStatusChange("pickup")}
                    className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 text-white dark:text-zinc-950 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm whitespace-nowrap"
                  >
                    {updating ? "Processing..." : "📱 Product Arrived (Notify)"}
                  </button>
                )}

                {/* Pickup -> Delivered Terminal Delivery Completed Switch Button */}
                {["pending", "accepted", "in_progress", "ready", "pickup"].includes(order.status) && (
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleStatusChange("delivered")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm whitespace-nowrap"
                  >
                    {updating ? "Fulfilling..." : "✅ Confirm Delivered"}
                  </button>
                )}

                {order.status === "delivered" && (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.04] border border-emerald-500/10 px-3 py-1.5 rounded-lg">
                    🎉 Product Delivered Successfully
                  </p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}