/** @type {import('next').NextConfig} */
const nextConfig = {
  // Specify src directory
  pageExtensions: ['tsx', 'ts'],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  // Ensure proper app directory resolution
  // Remove any conflicting output config

  // Environment-specific configurations
  env: {
    CUSTOM_KEY: process.env.NODE_ENV === 'production'
      ? 'production-value'
      : 'development-value'
  },

  // Output optimization
  compress: true,
  poweredByHeader: false,

  // Image optimization for different environments
  images: {
    domains: process.env.NODE_ENV === 'production'
      ? ['your-production-domain.com']
      : ['localhost'],
  },
}

module.exports = nextConfig