"use client";

import { useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Chocolate Birthday Cake",
      category: "cake",
      price: 2500,
      description: "Rich chocolate cake with fresh strawberries and buttercream",
      image_url: "https://picsum.photos/id/1080/300/200",
      is_available: true,
    },
    {
      id: 2,
      name: "Pepperoni Pizza",
      category: "pizza",
      price: 1200,
      description: "Classic pepperoni pizza with extra cheese",
      image_url: "https://picsum.photos/id/1060/300/200",
      is_available: true,
    },
    {
      id: 3,
      name: "Red Roses Bouquet",
      category: "flower",
      price: 1800,
      description: "Fresh red roses bouquet for special occasions",
      image_url: "https://picsum.photos/id/1074/300/200",
      is_available: false,
    },
  ]);

  const toggleAvailability = (id: number) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id
          ? { ...product, is_available: !product.is_available }
          : product
      )
    );
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "24px" }}>Products</h1>

      {/* Upload Form */}
      <div style={{ background: "#fff", padding: "32px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: "40px" }}>
        <h2 style={{ marginBottom: "24px", fontSize: "22px" }}>Add New Product</h2>
        
        <form>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Product Name</label>
              <input 
                type="text" 
                placeholder="Product name"
                style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Category</label>
              <select style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }}>
                <option value="cake">Cake</option>
                <option value="pizza">Pizza</option>
                <option value="flower">Flower</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Price (KES)</label>
            <input 
              type="number" 
              placeholder="2500"
              style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Description</label>
            <textarea 
              rows={4}
              placeholder="Product description..."
              style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "8px", resize: "vertical" }}
            />
          </div>

          <div style={{ marginBottom: "30px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Product Images</label>
            <div style={{
              border: "2px dashed #ccc",
              borderRadius: "12px",
              padding: "40px",
              textAlign: "center",
              background: "#fafafa"
            }}>
              <p style={{ fontSize: "18px", marginBottom: "8px" }}>📸</p>
              <p>Click to upload or drag and drop images</p>
              <input type="file" multiple accept="image/*" style={{ marginTop: "12px" }} />
            </div>
          </div>

          <button 
            type="button"
            style={{
              width: "100%",
              padding: "16px",
              background: "#e91e63",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Upload Product
          </button>
        </form>
      </div>

      {/* My Products List */}
      <div>
        <h2 style={{ marginBottom: "20px", fontSize: "24px" }}>My Products</h2>

        <div style={{ display: "grid", gap: "20px" }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                gap: "20px",
                alignItems: "center"
              }}
            >
              <img
                src={product.image_url}
                alt={product.name}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "8px"
                }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "20px" }}>{product.name}</h3>
                    <p style={{ margin: "0 0 8px 0", color: "#666", textTransform: "capitalize" }}>
                      {product.category}
                    </p>
                    <p style={{ margin: "0", fontWeight: "600", color: "#e91e63" }}>
                      KES {product.price.toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleAvailability(product.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: "none",
                      background: product.is_available ? "#4ade80" : "#f87171",
                      color: "white",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    {product.is_available ? "✓ Available" : "✕ Finished"}
                  </button>
                </div>

                <p style={{ margin: "12px 0 0 0", color: "#555", fontSize: "15px" }}>
                  {product.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <p style={{ textAlign: "center", color: "#666", padding: "40px" }}>
            No products yet. Add your first product above.
          </p>
        )}
      </div>
    </div>
  );
}