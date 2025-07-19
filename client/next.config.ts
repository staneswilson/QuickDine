import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  transpilePackages: ['lucide-react'], // Add this line
};

export default nextConfig;
