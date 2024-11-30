/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: 'routopia-user-avatars.s3.us-east-2.amazonaws.com',
        pathname: '/**',
      }
    ],
  },
}

module.exports = nextConfig 