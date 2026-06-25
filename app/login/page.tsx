"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/client"; 
 

export default function LoginPage() {
  const router = useRouter();
   const supabase = createClient();  

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔐 CHECK SESSION ON PAGE LOAD
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        router.replace("/dashboard");
      }
    };

    checkUser();
  }, [router]);

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // after login → go dashboard
    router.replace("/dashboard");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>WonderBakes Seller</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <button onClick={login}>
        Login
      </button>
    </div>
  );
}