"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();


  return (
    <div>
      <nav
        style={{
          display: "flex",
          gap: 20,
          padding: 20,
          borderBottom: "1px solid #ddd",
        }}
      >
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/products">Products</Link>
        <Link href="/payouts">Payouts</Link>
        <Link href="/settings">Settings</Link>
      </nav>

      <main>{children}</main>
    </div>
  );
}