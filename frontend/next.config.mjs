/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  trailingSlash: false,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true, // required for static export
  },
}

export default nextConfig