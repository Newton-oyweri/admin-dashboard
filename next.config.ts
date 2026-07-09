import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 👇 ADD THIS LINE HERE
  allowedDevOrigins: ["172.17.88.239"],

  // Silence the workspace root warning
  experimental: {
    // You can leave this empty for now or add other flags
  },
};

export default nextConfig;