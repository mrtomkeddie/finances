/** @type {import('next').NextConfig} */
const defaultRuntimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  navigateFallbackDenylist: [
    /^\/api\//,
  ],
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.googleapis\.com\/.*/i,
      handler: 'NetworkOnly',
    },
    {
      urlPattern: /^https:\/\/.*\.firebaseio\.com\/.*/i,
      handler: 'NetworkOnly',
    },
    {
      urlPattern: /^https:\/\/.*\.firebaseapp\.com\/.*/i,
      handler: 'NetworkOnly',
    },
    {
      urlPattern: /^https:\/\/.*\.firebasestorage\.app\/.*/i,
      handler: 'NetworkOnly',
    },
    ...defaultRuntimeCaching,
  ],
});

const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = withPWA(nextConfig);
