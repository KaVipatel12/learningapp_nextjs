// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',

      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.app.goo.gl',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
    ],
  },
  // Your other Next.js config options here
}

export default nextConfig