/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  // Explicitly set project root to prevent webpack from scanning outside
  // reactStrictMode: true,
  output: 'standalone',
  experimental: {
    outputFileTracingIgnores: ["./generated/client/**/*"],
    outputFileTracingExcludes: ["./generated/client/**/*"],
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
  },
  webpack: (config, { isServer, dev }) => {
    // Set explicit context to project directory
    config.context = __dirname
    // Restrict webpack to only scan the project directory
    config.resolve.modules = [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'node_modules'),
      'node_modules'
    ]
    
    // Ignore Windows system directories and prevent scanning outside project
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.next/**',
      ],
    }
    
    // Prevent webpack from traversing symlinks
    config.resolve.symlinks = false
    
    // Disable snapshot to avoid permission issues on Windows
    config.snapshot = {
      managedPaths: [path.resolve(__dirname, 'node_modules')],
      immutablePaths: [],
      buildDependencies: {
        hash: true,
        timestamp: true,
      },
      module: {
        timestamp: true,
      },
      resolve: {
        timestamp: true,
      },
      resolveBuildDependencies: {
        hash: true,
        timestamp: true,
      },
    }
    
    return config
  },
}

module.exports = nextConfig