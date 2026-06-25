"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";  

export default function DashboardPage() {
  const [name, setName] = useState("");
  const supabase = createClient();   // ← Create inside component or useEffect

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (data) {
      setName(data.full_name);
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
    } else {
      // Optional: window.location.href = "/login"; or use router
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Hello {name}</h1>
      <p>Welcome to WonderBakes Seller Dashboard</p>

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}