"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client"; 

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 LISTEN FOR AUTH CHANGES AND ROUTE SAFELY
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.refresh(); 
        router.replace("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Changed to handle form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // 👈 Stops the page from reloading
    if (loading) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false); // 👈 Unlocks button on error
      return;
    }
    
    // Just in case redirect takes a second, unlock it if unmounted safely, 
    // or let the useEffect handle the redirect.
  };

  // Styles
  const inputStyle = {
    width: "100%",
    maxWidth: "320px",
    padding: "10px 14px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
    boxSizing: "border-box" as const,
    backgroundColor: loading ? "#f5f5f5" : "#fff",
  };

  const buttonStyle = {
    width: "100%",
    maxWidth: "320px",
    padding: "12px",
    fontSize: "16px",
    fontWeight: "bold" as const,
    backgroundColor: loading ? "#482121" : "#f97316",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: loading ? "not-allowed" : "pointer",
  };

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>WonderBakes Seller</h1>
      
      {/* 👈 Wrapped in a form element */}
      <form onSubmit={handleLogin}> 
        <input
          type="email" // 👈 Better for mobile keyboards
          placeholder="Email"
          value={email}
          disabled={loading}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          required
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          disabled={loading}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          required
        />
        <br /><br />
        {/* 👈 type="submit" ensures clicking OR pressing Enter works */}
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}