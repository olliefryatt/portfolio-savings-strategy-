/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // Disable ESLint checks during production builds to avoid build failures
      ignoreDuringBuilds: true,
    },
  };
  
  module.exports = nextConfig;