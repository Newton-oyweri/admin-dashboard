"use client";

import { useState } from "react";

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
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Orders</h1>
      <p style={{ color: "#666", marginBottom: "32px" }}>
        Manage customer orders and update their progress
      </p>

      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        {orders.length === 0 ? (
          <p style={{ textAlign: "center", padding: "60px", color: "#666" }}>
            No orders yet
          </p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              style={{
                padding: "24px",
                borderBottom: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap"
              }}
            >
              {/* Order Info */}
              <div style={{ flex: 1, minWidth: "280px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <strong>{order.product}</strong>
                  <span style={{ color: "#666", fontSize: "14px" }}>{order.date}</span>
                </div>
                <div style={{ color: "#444" }}>Customer: {order.customer}</div>
                <div style={{ color: "#666", fontSize: "14px" }}>
                  Qty: {order.quantity} • Total: <strong>KES {order.total.toLocaleString()}</strong>
                </div>
              </div>

              {/* Status */}
              <div style={{ minWidth: "140px" }}>
                <div
                  style={{
                    ...getStatusStyle(order.status),
                    padding: "8px 16px",
                    borderRadius: "9999px",
                    fontSize: "14px",
                    fontWeight: "600",
                    textAlign: "center",
                    textTransform: "capitalize",
                  }}
                >
                  {order.status.replace("_", " ")}
                </div>
              </div>

              {/* Progress Actions */}
              <div style={{ minWidth: "220px" }}>
                {order.status !== "ready" && order.status !== "delivered" && order.status !== "cancelled" ? (
                  <button
                    onClick={() => updateStatus(order.id, getNextStatus(order.status))}
                    style={{
                      padding: "10px 20px",
                      background: "#e91e63",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                      width: "100%"
                    }}
                  >
                    {getButtonText(order.status)}
                  </button>
                ) : (
                  <div style={{
                    padding: "10px 20px",
                    background: "#10b981",
                    color: "white",
                    borderRadius: "8px",
                    textAlign: "center",
                    fontWeight: "600"
                  }}>
                    ✓ Order Completed
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "24px", textAlign: "center", color: "#666", fontSize: "14px" }}>
        Seller can only update up to <strong>Ready</strong>. Delivery is handled by customer or rider.
      </div>
    </div>
  );
}