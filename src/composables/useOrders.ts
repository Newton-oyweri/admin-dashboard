// src/composables/useOrders.ts
import { supabase } from '@/lib/supabase'
import type { OrderWithDetails } from '@/types/orders'

export async function getSessionUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function fetchSellerOrders(sellerId: string): Promise<OrderWithDetails[]> {
  const { data, error } = await supabase
    .from('orders')
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
    .eq('seller_id', sellerId)
    .eq('order_type', 'normalorder')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error reading database order register:', error)
    return []
  }
  return data as unknown as OrderWithDetails[]
}

export async function fetchSellerBookings(sellerId: string): Promise<OrderWithDetails[]> {
  const { data, error } = await supabase
    .from('orders')
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
    .eq('seller_id', sellerId)
    .eq('order_type', 'booking')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error reading database booking register:', error)
    return []
  }
  return data as unknown as OrderWithDetails[]
}

export async function updateOrderStatus(orderId: string, nextStatus: string): Promise<boolean> {
  const { error } = await supabase
    .from('orders')
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) {
    console.error('Status migration error:', error)
    return false
  }
  return true
}