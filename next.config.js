import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  output: 'standalone',
  experimental: {
    authInterrupts: true,
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
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    
    config.context = __dirname
    config.resolve.modules = [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'node_modules'),
      'node_modules'
    ]
    
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.next/**',
      ],
    }
    
    config.resolve.symlinks = false
    
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

export default nextConfig;