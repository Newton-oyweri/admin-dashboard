"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";  

export default function DashboardPage() {
  const [name, setName] = useState("");
  const [stats, setStats] = useState({
    totalIncome: 124500,
    totalOrders: 28,
    activeProducts: 12,
    pendingOrders: 5,
  });

  const supabase = createClient();

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
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", margin: "0 0 8px 0" }}>Hello, {name || "Seller"} 👋</h1>
          <p style={{ color: "#666", fontSize: "18px" }}>Welcome back to your WonderBakes Dashboard</p>
        </div>
        <button 
          onClick={() => window.location.href = '/login'}
          style={{
            padding: "10px 20px",
            background: "#e91e63",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      {/* Key Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <p style={{ color: "#666", margin: "0 0 8px 0" }}>Total Income</p>
          <h2 style={{ fontSize: "36px", margin: "0", color: "#e91e63" }}>
            KES {stats.totalIncome.toLocaleString()}
          </h2>
          <p style={{ color: "#4ade80", marginTop: "8px" }}>This Month</p>
        </div>

        <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <p style={{ color: "#666", margin: "0 0 8px 0" }}>Total Orders</p>
          <h2 style={{ fontSize: "36px", margin: "0" }}>{stats.totalOrders}</h2>
        </div>

        <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <p style={{ color: "#666", margin: "0 0 8px 0" }}>Active Products</p>
          <h2 style={{ fontSize: "36px", margin: "0" }}>{stats.activeProducts}</h2>
        </div>

        <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <p style={{ color: "#666", margin: "0 0 8px 0" }}>Pending Orders</p>
          <h2 style={{ fontSize: "36px", margin: "0", color: "#f59e0b" }}>{stats.pendingOrders}</h2>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ marginBottom: "40px" }}>
        <h3 style={{ marginBottom: "16px" }}>Quick Actions</h3>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <a href="/products" style={quickLinkStyle}>Add New Product</a>
          <a href="/orders" style={quickLinkStyle}>Manage Orders</a>
          <a href="/payouts" style={quickLinkStyle}>View Payouts</a>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h3 style={{ marginBottom: "20px" }}>Recent Orders</h3>
        <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {recentOrders.map((order) => (
            <div
              key={order.id}
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontWeight: "600" }}>{order.product}</div>
                <div style={{ color: "#666", fontSize: "14px" }}>by {order.customer}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "700" }}>KES {order.amount}</div>
                <div style={{
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  background: order.status === "pending" ? "#fef3c7" : "#d1fae5",
                  color: order.status === "pending" ? "#d97706" : "#10b981",
                  display: "inline-block"
                }}>
                  {order.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const quickLinkStyle = {
  padding: "14px 24px",
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "8px",
  textDecoration: "none",
  color: "#333",
  fontWeight: "600",
  transition: "all 0.2s",
} as React.CSSProperties;