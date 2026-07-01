// app/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Product, FormData } from "./types";
import { 
  getSessionUser, 
  fetchProducts, 
  uploadProduct, 
  updateProductAvailability, 
  removeProduct 
} from "./actions";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string; name: string } | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: 'cake',
    price: '',
    description: '',
    post_type: 'sale',
    files: []
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const activeUser = await getSessionUser();
      if (activeUser) {
        setUser(activeUser);
      } else {
        alert("Please log in first!");
        return;
      }
      
      const productList = await fetchProducts();
      setProducts(productList);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData({ ...formData, files });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return alert('Session not found. Please re-authenticate.');
    if (formData.files.length === 0) return alert('Please select at least one image');

    setUploading(true);
    try {
      const newProduct = await uploadProduct(formData, user.id);
      if (newProduct) {
        setProducts([newProduct, ...products]);
        setFormData({ name: '', category: 'cake', price: '', description: '', post_type: 'sale', files: [] });
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        alert(`✅ Product added successfully!`);
      }
    } catch (error) {
      alert('❌ Failed to add product: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleStock = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'in stock' : 'out of stock';
    const success = await updateProductAvailability(id, newStatus);
    if (success) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: newStatus } : p));
      alert(`✅ Product marked as ${action}`);
    } else {
      alert('❌ Failed to update stock status');
    }
  };

  const handleDelete = async (id: string, imageUrls: string[] | null) => {
    if (!confirm('Are you sure you want to delete this listing permanently?')) return;
    const success = await removeProduct(id, imageUrls);
    if (success) {
      setProducts(prev => prev.filter(p => p.id !== id));
      alert('✅ Listing deleted successfully!');
    } else {
      alert('❌ Failed to delete product');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 space-y-6 sm:py-8 sm:space-y-8 text-zinc-900 dark:text-zinc-50">
      <Navbar />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Catalog Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Manage your digital catalog and track real-time listings.
          </p>
        </div>
        <div className="self-start sm:self-center bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg text-xs font-medium">
          Total Items: <span className="font-bold text-pink-600 dark:text-pink-400">{products.length}</span>
        </div>
      </div>

      {/* Single Column Layout */}
      <div className="space-y-6">
        
        {/* Add Product Form */}
        <div className="border rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-base font-bold tracking-tight">Add New Product</h2>
          </div>
          
          <form onSubmit={handleUploadSubmit} className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  Product Name
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Chocolate Fudge, Rose Bouquet..."
                  required
                  className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  Category
                </label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full text-sm px-2.5 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                >
                  <option value="cake">Cake</option>
                  <option value="pizza">Pizza</option>
                  <option value="flowers">Flowers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  Price (KES)
                </label>
                <input 
                  type="number" 
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="2500"
                  required
                  className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  Product Type
                </label>
                <select 
                  name="post_type"
                  value={formData.post_type}
                  onChange={handleInputChange}
                  className="w-full text-sm px-2.5 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                >
                  <option value="sale">Instant Purchase</option>
                  <option value="booking">Booking</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Description
              </label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Provide product details such as ingredients/materials used, cake flavour, pizza size, flower type, dimensions, and the number of people it serves (if applicable)."
                className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Product Images
              </label>
              <div className="border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-center bg-zinc-50/30 dark:bg-zinc-800/10 hover:border-pink-500 transition-colors">
                <input 
                  id="fileInput"
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileChange}
                  required
                  className="block w-full text-xs text-zinc-500 dark:text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-50 dark:file:bg-pink-950/30 file:text-pink-700 dark:file:text-pink-400 cursor-pointer"
                />
                {formData.files.length > 0 && (
                  <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {formData.files.length} images selected
                  </p>
                )}
              </div>
            </div>

            <button 
              type="submit"
              disabled={uploading || !user}
              className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-semibold rounded-xl text-sm transition-transform active:scale-98 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 cursor-pointer disabled:cursor-not-allowed shadow-xs"
            >
              {uploading ? 'Adding Product...' : 'Add Product'}
            </button>
          </form>
        </div>

        {/* Product List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold tracking-tight px-1">All Products</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-pink-500 border-t-transparent"></div>
              <p className="mt-2 text-xs text-zinc-400">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 border rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <p className="text-sm text-zinc-400">No products added yet.</p>
            </div>
          ) : (
            <div className="border rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              {/* Desktop Table Header */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Stock Status</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              {/* Product List */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className={`p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors ${
                      !product.is_available ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Mobile Card View */}
                    <div className="sm:hidden space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          {product.image_urls && product.image_urls.length > 0 ? (
                            <img
                              src={product.image_urls[0]}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg border border-zinc-100 dark:border-zinc-800"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-[10px] text-zinc-400">
                              No Image
                            </div>
                          )}
                          {product.image_urls && product.image_urls.length > 1 && (
                            <span className="absolute -top-1 -right-1 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                              +{product.image_urls.length - 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-semibold uppercase text-zinc-400 dark:text-zinc-500">
                              {product.category}
                            </span>
                            <span className="text-[8px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300 capitalize">
                              {product.post_type === 'sale' ? 'For delivery' : 'For Booking'}
                            </span>
                          </div>
                          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm font-bold text-pink-600 dark:text-pink-400">
                            KES {Number(product.price).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[10px] font-semibold px-2 py-1 rounded ${
                              product.is_available 
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            }`}>
                              {product.is_available ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        {product.is_available ? (
                          <button
                            onClick={() => handleToggleStock(product.id, product.is_available)}
                            className="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                          >
                            Mark Out of Stock
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStock(product.id, product.is_available)}
                            className="text-xs font-medium text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer"
                          >
                            Mark In Stock
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(product.id, product.image_urls)}
                          className="text-xs font-medium text-zinc-400 hover:text-red-500 dark:hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Desktop Row View */}
                    <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          {product.image_urls && product.image_urls.length > 0 ? (
                            <img
                              src={product.image_urls[0]}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg border border-zinc-100 dark:border-zinc-800"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-[8px] text-zinc-400">
                              No Image
                            </div>
                          )}
                          {product.image_urls && product.image_urls.length > 1 && (
                            <span className="absolute -top-1 -right-1 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                              +{product.image_urls.length - 1}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-semibold uppercase text-zinc-400 dark:text-zinc-500">
                              {product.category}
                            </span>
                            <span className="text-[8px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300 capitalize">
                              {product.post_type === 'sale' ? 'For delivery' : 'For booking'}
                            </span>
                          </div>
                          <p className="font-medium text-xs sm:text-sm text-zinc-900 dark:text-zinc-50 truncate">
                            {product.name}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-2 text-center">
                        <span className="text-xs sm:text-sm font-bold text-pink-600 dark:text-pink-400">
                          KES {Number(product.price).toLocaleString()}
                        </span>
                      </div>

                      <div className="col-span-2 text-center">
                        <span className={`text-[10px] sm:text-xs font-semibold px-2 py-1 rounded ${
                          product.is_available 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        }`}>
                          {product.is_available ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>

                      <div className="col-span-3 flex items-center justify-end gap-2">
                        {product.is_available ? (
                          <button
                            onClick={() => handleToggleStock(product.id, product.is_available)}
                            className="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                          >
                            Mark Out of Stock
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStock(product.id, product.is_available)}
                            className="text-xs font-medium text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer"
                          >
                            Mark In Stock
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(product.id, product.image_urls)}
                          className="text-xs font-medium text-zinc-400 hover:text-red-500 dark:hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}