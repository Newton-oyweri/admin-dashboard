"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getDashboardData();
  }, []);

  async function getDashboardData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // 1. Fetch wallet & bank details
      const { data: walletData } = await supabase
        .from("seller_wallets")
        .select("bank_details, available_balance, total_earned")
        .eq("seller_id", user.id)
        .maybeSingle();
      
      if (walletData) {
        setWallet(walletData);
        if (walletData.bank_details) setBankDetails(walletData.bank_details);
      }

      // 2. Fetch recent transactions
      const { data: txData } = await supabase
        .from("seller_wallet_transactions")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (txData) setTransactions(txData);
    }
    setLoading(false);
  }

  async function handleSaveBankDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const updatedDetails = {
      bank_name: formData.get("bank_name"),
      account_holder_name: formData.get("account_holder_name"),
      account_number: formData.get("account_number"),
    };

    const { error } = await supabase
      .from("seller_wallets")
      .upsert({ seller_id: user.id, bank_details: updatedDetails }, { onConflict: "seller_id" });

    if (!error) setBankDetails(updatedDetails);
    setIsSaving(false);
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Seller Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-500">Welcome to your WonderBakes seller dashboard.</p>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-500">Loading dashboard...</p>
        ) : (
          <>
            {/* 1. Wallet Balances Overview */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50 shadow-sm">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Available Balance</span>
                <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">KES {wallet?.available_balance?.toLocaleString() || "0.00"}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50 shadow-sm">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Earned</span>
                <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">KES {wallet?.total_earned?.toLocaleString() || "0.00"}</p>
              </div>
            </div>

            {/* 2. Bank Details vs Bank Form */}
            {bankDetails ? (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
                <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Payout Bank Account</h2>
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-zinc-800 dark:text-zinc-200">
                  <p><strong>Bank:</strong> {bankDetails.bank_name}</p>
                  <p><strong>Holder:</strong> {bankDetails.account_holder_name}</p>
                  <p><strong>Account:</strong> •••• {bankDetails.account_number?.slice(-4)}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-6 dark:border-amber-900/30 dark:bg-amber-950/10">
                <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-300">Add your bank details</h2>
                <p className="text-xs text-amber-800 dark:text-amber-400 mb-4">Provide details to receive your monthly payouts.</p>
                <form onSubmit={handleSaveBankDetails} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
                  <input type="text" name="bank_name" required placeholder="Bank Name" className="flex-1 rounded-lg border p-2 text-sm bg-white dark:bg-zinc-800 dark:border-zinc-700" />
                  <input type="text" name="account_holder_name" required placeholder="Holder Name" className="flex-1 rounded-lg border p-2 text-sm bg-white dark:bg-zinc-800 dark:border-zinc-700" />
                  <input type="text" name="account_number" required placeholder="Account Number" className="flex-1 rounded-lg border p-2 text-sm bg-white dark:bg-zinc-800 dark:border-zinc-700" />
                  <button type="submit" disabled={isSaving} className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50 whitespace-nowrap">
                    {isSaving ? "Saving..." : "Save Details"}
                  </button>
                </form>
              </div>
            )}

            {/* 3. Recent Transactions List */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Recent Transactions</h2>
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 font-medium">
                      <th className="p-4">Description</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Type</th>
                      <th className="p-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-zinc-400">No transactions recorded yet.</td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                          <td className="p-4 font-medium text-zinc-900 dark:text-zinc-100">{tx.description}</td>
                          <td className="p-4 text-zinc-500">{new Date(tx.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                          <td className="p-4"><span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30 uppercase">{tx.transaction_type}</span></td>
                          <td className="p-4 text-right font-semibold text-zinc-900 dark:text-white">KES {tx.amount.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}