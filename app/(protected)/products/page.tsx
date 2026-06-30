"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/client";
import Navbar from "@/components/Navbar";

// ===== TYPES =====
interface Product {
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

interface FormData {
  name: string;
  category: string;
  price: string;
  description: string;
  post_type: 'sale' | 'booking' | 'pinned';
  files: File[];
}

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: 'cake',
    price: '',
    description: '',
    post_type: 'sale',
    files: []
  });

  // Get current user profile on load
  useEffect(() => {
    getUserProfile();
    fetchProducts();
  }, []);

  async function getUserProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('Please login first!');
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      alert('User profile not found. Please complete your profile first.');
      return;
    }

    if (data) {
      setProfile(data);
      console.log('✅ Profile loaded:', data);
    }
  }

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data as Product[] || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection (multiple)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData({ ...formData, files });
    }
  };

  // Handle form inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // UPLOAD MULTIPLE IMAGES TO CLOUDFLARE R2 → SAVE TO SUPABASE
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!profile) {
      alert('Please login and complete your profile first!');
      return;
    }

    if (formData.files.length === 0) {
      alert('Please select at least one image');
      return;
    }

    setUploading(true);

    try {
      // 1️⃣ UPLOAD ALL IMAGES TO CLOUDFLARE R2
      const uploadedUrls: string[] = [];
      
      for (const file of formData.files) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const cloudflareRes = await fetch('https://posts-api.unscriptedusa.workers.dev/', {
          method: 'POST',
          body: uploadFormData
        });

        if (!cloudflareRes.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const { image_url } = await cloudflareRes.json();
        uploadedUrls.push(image_url);
        console.log(`✅ Uploaded ${file.name}:`, image_url);
      }

      // 2️⃣ SAVE TO SUPABASE WITH PROFILE ID AS SELLER
      const productData = {
        seller_id: profile.id,
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

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      // 3️⃣ UPDATE UI
      if (data && data.length > 0) {
        setProducts([data[0] as Product, ...products]);
      }
      
      // 4️⃣ RESET FORM
      setFormData({
        name: '',
        category: 'cake',
        price: '',
        description: '',
        post_type: 'sale',
        files: []
      });
      
      // Reset file input
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      alert(`✅ Product uploaded successfully with ${uploadedUrls.length} images!`);

    } catch (error) {
      console.error('Error:', error);
      alert('❌ Failed to upload product: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  // TOGGLE AVAILABILITY
  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setProducts(prev =>
        prev.map(product =>
          product.id === id
            ? { ...product, is_available: !product.is_available }
            : product
        )
      );
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product status');
    }
  };

  // DELETE PRODUCT
  const deleteProduct = async (id: string, imageUrls: string[] | null) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      // 1️⃣ DELETE IMAGES FROM CLOUDFLARE R2
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

      // 2️⃣ DELETE FROM SUPABASE
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 3️⃣ UPDATE UI
      setProducts(prev => prev.filter(product => product.id !== id));
      alert('✅ Product deleted successfully!');

    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Failed to delete product');
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto py-6 space-y-6 sm:py-8 sm:space-y-8">
      <Navbar />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-zinc-900 dark:text-zinc-50">
            Products
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your products and inventory
          </p>
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Total: <span className="font-semibold text-zinc-900 dark:text-zinc-50">{products.length}</span>
        </div>
      </div>

      {/* Display seller info */}
      {profile && (
        <div className="p-4 border rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <strong>Seller:</strong> {profile.full_name} 
            <span className="ml-2 px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded-full text-xs">
              {profile.role}
            </span>
          </p>
        </div>
      )}

      {/* Upload Form */}
      <div className="border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Add New Product</h2>
        </div>
        
        <form onSubmit={handleUpload} className="p-5 sm:p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Product Name
              </label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Category
                </label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="cake">Cake</option>
                  <option value="pizza">Pizza</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Price (KES)
                </label>
                <input 
                  type="number" 
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="2500"
                  required
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Post Type
              </label>
              <select 
                name="post_type"
                value={formData.post_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="sale">For Sale</option>
                <option value="booking">For Booking</option>
                <option value="pinned">Pinned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Description
              </label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your product..."
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-vertical"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Product Images
              </label>
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-6 text-center hover:border-pink-500 transition-colors">
                <input 
                  id="fileInput"
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileChange}
                  required
                  className="block w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 dark:file:bg-pink-900/30 dark:file:text-pink-400"
                />
                {formData.files.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {formData.files.length} image(s) selected
                    </p>
                    <div className="flex gap-2 flex-wrap justify-center mt-2">
                      {formData.files.map((file, index) => (
                        <span key={index} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-full text-xs text-zinc-600 dark:text-zinc-300">
                          {file.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit"
              disabled={uploading || !profile}
              className="w-full px-4 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-zinc-400 dark:disabled:bg-zinc-600 text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {!profile ? 'Please complete profile first' : 
               uploading ? `Uploading ${formData.files.length} images...` : 'Upload Product'}
            </button>
          </div>
        </form>
      </div>

      {/* Products List */}
      <div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          My Products ({products.length})
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
            <p className="mt-2 text-zinc-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">No products yet</p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Add your first product above</p>
          </div>
        ) : (
          <div className="border rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Images</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {product.image_urls && product.image_urls.length > 0 ? (
                            product.image_urls.slice(0, 3).map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`${product.name} ${index + 1}`}
                                className="w-12 h-12 object-cover rounded border border-zinc-200 dark:border-zinc-700"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/60?text=No+Image';
                                }}
                              />
                            ))
                          ) : (
                            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-700 rounded flex items-center justify-center text-xs text-zinc-400">
                              No img
                            </div>
                          )}
                          {product.image_urls && product.image_urls.length > 3 && (
                            <div className="w-12 h-12 bg-pink-600 rounded flex items-center justify-center text-white font-bold text-sm">
                              +{product.image_urls.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-900 dark:text-zinc-50">{product.name}</div>
                        {product.description && (
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                            {product.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm capitalize text-zinc-900 dark:text-zinc-50">{product.category}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{product.post_type}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-pink-600 dark:text-pink-400">
                        KES {Number(product.price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          product.is_available 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {product.is_available ? 'Available' : 'Finished'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => toggleAvailability(product.id, product.is_available)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              product.is_available 
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50' 
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
                            }`}
                          >
                            {product.is_available ? 'Mark Finished' : 'Mark Available'}
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id, product.image_urls)}
                            className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}