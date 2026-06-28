"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/client";

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
        seller_id: profile.id, // ← Profile ID from profiles table
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
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>Products</h1>

      {/* Display seller info */}
      {profile && (
        <div style={{ marginBottom: '20px', padding: '12px', background: '#f0f0f0', borderRadius: '4px' }}>
          <strong>Seller:</strong> {profile.full_name} ({profile.role})
        </div>
      )}

      {/* Upload Form */}
      <div style={{ marginBottom: '40px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '20px' }}>Add New Product</h2>
        
        <form onSubmit={handleUpload}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold', width: '150px' }}>Product Name</td>
                <td style={{ padding: '8px' }}>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Product name"
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Category</td>
                <td style={{ padding: '8px' }}>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  >
                    <option value="cake">Cake</option>
                    <option value="pizza">Pizza</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Price (KES)</td>
                <td style={{ padding: '8px' }}>
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="2500"
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Post Type</td>
                <td style={{ padding: '8px' }}>
                  <select 
                    name="post_type"
                    value={formData.post_type}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  >
                    <option value="sale">For Sale</option>
                    <option value="booking">For Booking</option>
                    <option value="pinned">Pinned</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold', verticalAlign: 'top' }}>Description</td>
                <td style={{ padding: '8px' }}>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Product description..."
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold', verticalAlign: 'top' }}>Product Images</td>
                <td style={{ padding: '8px' }}>
                  <div style={{ border: '2px dashed #ccc', padding: '20px', borderRadius: '4px', textAlign: 'center' }}>
                    <input 
                      id="fileInput"
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleFileChange}
                      required
                    />
                    {formData.files.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <p style={{ fontWeight: 'bold', color: 'green' }}>
                          ✅ {formData.files.length} image(s) selected
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
                          {formData.files.map((file, index) => (
                            <span key={index} style={{ 
                              background: '#f0f0f0', 
                              padding: '4px 12px', 
                              borderRadius: '20px',
                              fontSize: '12px'
                            }}>
                              {file.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ padding: '8px' }}>
                  <button 
                    type="submit"
                    disabled={uploading || !profile}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: uploading || !profile ? '#ccc' : '#e91e63',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: uploading || !profile ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {!profile ? 'Please complete profile first' : 
                     uploading ? `Uploading ${formData.files.length} images...` : 'Upload Product'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>

      {/* My Products List */}
      <div>
        <h2 style={{ marginBottom: '20px' }}>My Products ({products.length})</h2>

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Images</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Product</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Price</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {product.image_urls && product.image_urls.length > 0 ? (
                        product.image_urls.slice(0, 3).map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`${product.name} ${index + 1}`}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                              border: index === 0 ? '2px solid #e91e63' : '1px solid #ddd'
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/60?text=No+Image';
                            }}
                          />
                        ))
                      ) : (
                        <div style={{ width: '60px', height: '60px', background: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px' }}>
                          No img
                        </div>
                      )}
                      {product.image_urls && product.image_urls.length > 3 && (
                        <div style={{
                          width: '60px',
                          height: '60px',
                          background: '#e91e63',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          +{product.image_urls.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <div>
                      <strong>{product.name}</strong>
                      {product.description && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          {product.description.length > 50 ? product.description.substring(0, 50) + '...' : product.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', textTransform: 'capitalize' }}>
                    {product.category}
                    <div style={{ fontSize: '11px', color: '#999' }}>{product.post_type}</div>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold', color: '#e91e63' }}>
                    KES {Number(product.price).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: product.is_available ? '#4ade80' : '#f87171',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {product.is_available ? 'Available' : 'Finished'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => toggleAvailability(product.id, product.is_available)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          background: product.is_available ? '#f59e0b' : '#4ade80',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {product.is_available ? 'Mark Finished' : 'Mark Available'}
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id, product.image_urls)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          background: '#ef4444',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && products.length === 0 && (
          <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No products yet. Add your first product above.
          </p>
        )}
      </div>
    </div>
  );
}