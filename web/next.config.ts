import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Fix warning "multiple lockfiles" — pointe sur la racine du repo mono-repo
  outputFileTracingRoot: path.join(__dirname, '../'),

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            // geolocation=*  → autorise le site lui-même
            // gyroscope/accelerometer=* → autorise la boussole DeviceOrientation
            key: 'Permissions-Policy',
            value: 'geolocation=*, gyroscope=*, accelerometer=*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
