// app/orders/actions.ts
import { supabase } from "@/lib/client";

// Add or verify this inside app/orders/actions.ts
export interface OrderWithDetails {
  id: string;
  order_number: string | null;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
  notes: string | null; // This holds our JSON payload string
  created_at: string;
  products: {
    name: string;
    image_urls: string[] | null;
  } | null;
  profiles: {
    full_name: string;
  } | null;
}

// Fetch current logged in seller session info
export async function getSessionUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Fetch all live rows matching this seller
export async function fetchSellerOrders(sellerId: string): Promise<OrderWithDetails[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      quantity,
      unit_price,
      total_amount,
      status,
      notes,
      created_at,
      products (name, image_urls),
      profiles!orders_customer_id_fkey (full_name)
    `)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error reading database order register:", error);
    return [];
  }
  return data as unknown as OrderWithDetails[];
}

// Update state on backend using safe values passing status checks
export async function updateOrderStatus(orderId: string, nextStatus: string): Promise<boolean> {
  const { error } = await supabase
    .from("orders")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    console.error("Status migration error:", error);
    return false;
  }
  return true;
}