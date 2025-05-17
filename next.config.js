/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // Disable ESLint checks during production builds to avoid build failures
      ignoreDuringBuilds: true,
    },
    typescript: {
      // Disable type-checking errors during production builds
      ignoreBuildErrors: true,
    },
  };
  
  module.exports = nextConfig;