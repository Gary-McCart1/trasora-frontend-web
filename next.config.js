/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['konva'], // Modern way to transpile packages
  outputFileTracingRoot: __dirname, // This fixes the multiple lockfiles warning
  images: {
    domains: [
      'dreamr-user-content.s3.amazonaws.com',
      'i.scdn.co',
      'via.placeholder.com',
      'mosaic.scdn.co',
      'lineup-images.scdn.co',
      'wrapped-images.spotifycdn.com',
      "i.pravatar.cc"
    ],
  },
}

module.exports = nextConfig
