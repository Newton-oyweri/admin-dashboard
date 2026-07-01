// app/products/actions.ts
import { supabase } from "@/lib/client";
import { Product, FormData } from "./types";

// Get active session email or metadata
export async function getSessionUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Return user info directly from the session object
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Seller'
  };
}

// Fetch All Products
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data as Product[];
}

// Handle Image Cloudflare R2 Uploads + Supabase Insert
export async function uploadProduct(formData: FormData, userId: string): Promise<Product | null> {
  const uploadedUrls: string[] = [];
  
  for (const file of formData.files) {
    const uploadFormData = new globalThis.FormData();
    uploadFormData.append('file', file);

    const cloudflareRes = await fetch('https://posts-api.unscriptedusa.workers.dev/', {
      method: 'POST',
      body: uploadFormData
    });

    if (!cloudflareRes.ok) throw new Error(`Failed to upload ${file.name}`);

    const { image_url } = await cloudflareRes.json();
    uploadedUrls.push(image_url);
  }

  const productData = {
    seller_id: userId, // Uses user ID directly from session
    category: formData.category,
    name: formData.name,
    description: formData.description,
    price: parseFloat(formData.price),
    image_urls: uploadedUrls,
    is_available: true,
    post_type: formData.post_type
  };

  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select();

  if (error) throw new Error(error.message);
  return data && data.length > 0 ? (data[0] as Product) : null;
}

// Toggle Product Status
export async function updateProductAvailability(id: string, nextStatus: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .update({ is_available: nextStatus })
    .eq('id', id);

  if (error) return false;
  return true;
}

// Delete Product and Images
export async function removeProduct(id: string, imageUrls: string[] | null): Promise<boolean> {
  if (imageUrls) {
    for (const url of imageUrls) {
      const key = url.split('.r2.dev/')[1];
      if (key) {
        await fetch(`https://posts-api.unscriptedusa.workers.dev/?key=${key}`, {
          method: 'DELETE'
        });
      }
    }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) return false;
  return true;
}