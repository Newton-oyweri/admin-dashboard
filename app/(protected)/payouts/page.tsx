"use client";

import { useState } from "react";

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
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Payouts</h1>
      <p style={{ color: "#666", marginBottom: "32px" }}>Track your earnings and request payouts</p>

      {/* Total Income Card */}
      <div style={{
        background: "#fff",
        padding: "32px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        textAlign: "center",
        marginBottom: "32px"
      }}>
        <p style={{ fontSize: "18px", color: "#666", marginBottom: "8px" }}>Total Income</p>
        <h2 style={{ fontSize: "48px", margin: "0 0 12px 0", color: "#e91e63" }}>
          KES {totalIncome.toLocaleString()}
        </h2>
        <p style={{ color: "#4ade80", fontWeight: "600" }}>This Month</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "40px" }}>
        
        {/* Category Breakdown */}
        <div style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ marginBottom: "20px" }}>Income by Category</h3>
          {categoryBreakdown.map((item, index) => (
            <div key={index} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: index !== categoryBreakdown.length - 1 ? "1px solid #eee" : "none"
            }}>
              <div>
                <strong>{item.category}</strong>
                <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#666" }}>
                  {item.sales} sales
                </p>
              </div>
              <div style={{ textAlign: "right", fontWeight: "600" }}>
                KES {item.income.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ marginBottom: "20px" }}>Summary</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Total Orders</span>
              <strong>25</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Pending Payout</span>
              <strong style={{ color: "#e91e63" }}>KES 18,500</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Next Payout Date</span>
              <strong>July 5, 2025</strong>
            </div>
          </div>

          <button style={{
            marginTop: "24px",
            width: "100%",
            padding: "16px",
            background: "#e91e63",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "17px",
            fontWeight: "600",
            cursor: "pointer"
          }}>
            Request Payout
          </button>
        </div>
      </div>

      {/* Recent Sales */}
      <div>
        <h3 style={{ marginBottom: "20px" }}>Recent Sales</h3>
        
        <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          {recentSales.map((sale) => (
            <div
              key={sale.id}
              style={{
                padding: "20px",
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "600" }}>{sale.product}</div>
                <div style={{ fontSize: "14px", color: "#666" }}>{sale.date}</div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "700", color: "#16a34a" }}>
                  + KES {sale.amount.toLocaleString()}
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>{sale.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}