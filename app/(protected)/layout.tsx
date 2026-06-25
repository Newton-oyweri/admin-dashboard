import { createClient } from '@/lib/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

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