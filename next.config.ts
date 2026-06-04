import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Autorizar la IP de tu red local para que React funcione en otros dispositivos
  allowedDevOrigins: ['192.168.100.38', 'localhost'],
};

export default nextConfig;