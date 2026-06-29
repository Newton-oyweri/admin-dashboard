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
        // The library has guaranteed the cookies/localstorage are written
        router.refresh(); // Clears Next.js server component cache
        router.replace("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const login = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }
    // Notice: No routing here! The useEffect listener above will catch it safely.
  };

  // Shared modern styles for inputs
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

  // Shared modern styles for the button
  const buttonStyle = {
    width: "100%",
    maxWidth: "320px",
    padding: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    backgroundColor: loading ? "#482121" : "#f97316",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: loading ? "not-allowed" : "pointer",
  };

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>WonderBakes Seller</h1>
      <input
        placeholder="Email"
        value={email}
        disabled={loading}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />
      <br /><br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        disabled={loading}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <br /><br />
      <button onClick={login} disabled={loading} style={buttonStyle}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}
