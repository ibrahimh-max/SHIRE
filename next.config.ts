import withPWA from 'next-pwa';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

export default nextConfig;