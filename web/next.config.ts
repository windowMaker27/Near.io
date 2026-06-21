import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Permet le build même si certaines pages utilisent window/navigator
  // (MapLibre etc.) — elles sont protégées par 'use client' + dynamic imports
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // Avatars Supabase Storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Headers sécurité + permissions géolocalisation/orientation
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions Policy : active géolocalisation + gyroscope (boussole)
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), gyroscope=(), accelerometer=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
