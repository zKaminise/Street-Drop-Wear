/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Exclude Prisma SQLite DB and WAL files from file watching
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/prisma/*.db',
        '**/prisma/*.db-journal',
        '**/prisma/*.db-shm',
        '**/prisma/*.db-wal',
      ],
    }
    return config
  },
}

export default nextConfig
