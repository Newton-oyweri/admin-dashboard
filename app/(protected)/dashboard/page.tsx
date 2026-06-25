"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [name, setName] = useState("");

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

  return (
    <div style={{ padding: 20 }}>
      <h1>Hello {name}</h1>
      <p>Welcome to WonderBakes Seller Dashboard</p>

      <button onClick={async () => {
        await supabase.auth.signOut();
      }}>
        Logout
      </button>
    </div>
  );
}