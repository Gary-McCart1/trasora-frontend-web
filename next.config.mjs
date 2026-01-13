/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Fixes the "Multiple lockfiles detected" warning and speeds up compilation
  experimental: {
    turbopack: {
      root: './',
    },
  },

  transpilePackages: [],

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'dreamr-user-content.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'mosaic.scdn.co' },
      { protocol: 'https', hostname: 'lineup-images.scdn.co' },
      { protocol: 'https', hostname: 'wrapped-images.spotifycdn.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'is1-ssl.mzstatic.com' },
    ],
  },
};

export default nextConfig;