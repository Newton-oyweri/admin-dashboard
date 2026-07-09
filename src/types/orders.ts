// src/types/orders.ts
export interface OrderWithDetails {
  id: string;
  order_number: string | null;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
  notes: string | null;
  created_at: string;
  products: {
    name: string;
    image_urls: string[] | null;
  } | null;
  profiles: {
    full_name: string;
  } | null;
}

export interface ParsedNotes {
  customWriting?: string;
  fulfillmentMethod?: string;
  deliveryAddress?: string;
  productName?: string;
  orderedAt?: string;
}

export type Tab = 'orders' | 'bookings';