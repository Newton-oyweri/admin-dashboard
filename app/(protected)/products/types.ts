// app/products/types.ts
export interface Product {
  id: string;
  seller_id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  post_type: 'sale' | 'booking' | 'pinned';
  image_urls: string[] | null;
}

export interface FormData {
  name: string;
  category: string;
  price: string;
  description: string;
  post_type: 'sale' | 'booking'; // Removed 'pinned' from form options
  files: File[];
}

export interface Profile {
  id: string;
  full_name: string;
  role: string;
}