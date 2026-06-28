"use client";

import Link from "next/link";
import { supabase } from "@/lib/client";

export default function Navbar() {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  // Shared elegant styles for navigation items
  const linkStyle = {
    textDecoration: "none",
    color: "#4a5568", // Sophisticated dark gray instead of harsh black
    fontSize: "15px",
    fontWeight: 500,
    transition: "color 0.2s ease",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };

  // Modern link-style interaction for Logout
  const logoutStyle = {
    ...linkStyle,
    marginLeft: "auto",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    color: "#e53e3e", // Elegant muted red for destructive actions
  };

  return (
    <nav
      style={{
        width: "100%",
        background: "#ffffff",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        borderBottom: "1px solid #edf2f7",
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
          gap: 32,
          alignItems: "center",
          padding: "20px 24px",
        }}
      >
        {/* Brand / Title styling if desired, otherwise standard link */}
        <Link href="/dashboard" style={{ ...linkStyle, fontWeight: 600, color: "#1a202c" }}>
          Dashboard
        </Link>
        
        <Link href="/orders" style={linkStyle}>
          Orders
        </Link>
        <Link href="/products" style={linkStyle}>
          Products
        </Link>
        <Link href="/payouts" style={linkStyle}>
          Payouts
        </Link>
        <Link href="/settings" style={linkStyle}>
          Settings
        </Link>

        {/* Semantic button acting visually exactly like a text link */}
        <button
          onClick={handleLogout}
          style={logoutStyle}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#9b2c2c")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#e53e3e")}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}