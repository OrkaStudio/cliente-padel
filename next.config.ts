import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true, // Tipado estricto de rutas Next.js
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
}

export default nextConfig
