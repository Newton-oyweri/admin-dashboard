"use server";

import { createClient } from "@/lib/server";

export interface ProductDetails {
  id: string;
  name: string;
  image_urls?: string[] | null;
}

export interface ProfileDetails {
  id: string;
  full_name?: string | null;
}

export interface OrderWithDetails {
  id: string;
  customer_id: string;
  product_id: string;
  seller_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  delivery_person_id: string | null;
  order_number: string | null;
  products?: ProductDetails | null;
  profiles?: ProfileDetails | null; // Mapped via the explicit customer relationship fkey
}


export async function updateOrderStatus(orderId: string, nextStatus: "pickup" | "delivered"): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // 1. Validate authenticated user session context
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Action rejected: Unauthenticated user.");
      return false;
    }

    // 2. Validate strict profile matching limits
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const allowedRoles = ["delivery_person", "admin"];
    if (profileError || !profile || !allowedRoles.includes(profile.role)) {
      console.error(`Action rejected: User ${user.id} does not have delivery clearance.`);
      return false;
    }
    
    // 3. Complete database update mutation
    const { error } = await supabase
      .from("orders")
      .update({ 
        status: nextStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (error) {
      console.error(`Failed to update status to ${nextStatus}:`, error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in updateOrderStatus server action:", err);
    return false;
  }
}