/** @type {import('next').NextConfig} */
const nextConfig = {
  // Specify src directory
  pageExtensions: ['tsx', 'ts'],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  // Ensure proper app directory resolution
  // Remove any conflicting output config
}

module.exports = nextConfig