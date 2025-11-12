/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for Vercel compatibility
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },

  // Image optimization
  images: {
    domains: ['localhost']
  },

  // Basic optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = nextConfig