// app/(protected)/delivery/layout.tsx
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";

export default async function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Get the current authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Look up the role matching your exact database profile setup
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Only 'delivery_person' (and optionally 'admin') should pass through
  const allowedRoles = ["delivery_person", "admin"];

  if (profileError || !profile || !allowedRoles.includes(profile.role)) {
    // Send unprivileged users or standard customers elsewhere safely
    redirect("/"); 
  }

  return <>{children}</>;
}