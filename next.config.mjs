/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  experimental: {
    optimisticClientCache: false,
  },
}

export default nextConfig