// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        // Optionally restrict to specific paths:
        // pathname: '/dzm3wq5vw/**',
      },
    ],
  },
  // Your other Next.js config options here
}

export default nextConfig