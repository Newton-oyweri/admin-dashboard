"use client";

import Link from "next/link";
import { supabase } from "@/lib/client";

export default function Navbar() {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <nav
      style={{
        width: "100%",
        background: "#fff",
        boxShadow: "0 2px 12px rgba(0,0,0,.06)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          gap: 28,
          alignItems: "center",
          padding: "18px 24px",
        }}
      >
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/products">Products</Link>
        <Link href="/payouts">Payouts</Link>
        <Link href="/settings">Settings</Link>

        <button
          onClick={handleLogout}
          style={{
            marginLeft: "auto",
            padding: "10px 18px",
            border: "none",
            borderRadius: 8,
            background: "#e91e63",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}