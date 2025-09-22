/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['konva'], // Modern way to transpile packages
  outputFileTracingRoot: __dirname, // This fixes the multiple lockfiles warning

  // 👇 Image optimization doesn't work in static export, so disable it
  images: {
    unoptimized: true,
    domains: [
      'dreamr-user-content.s3.amazonaws.com',
      'i.scdn.co',
      'via.placeholder.com',
      'mosaic.scdn.co',
      'lineup-images.scdn.co',
      'wrapped-images.spotifycdn.com',
      "i.pravatar.cc",
      "is1-ssl.mzstatic.com"
    ],
  },
}

module.exports = nextConfig
