/** @type {import('next').NextConfig} */


const nextConfig = {
  output: 'export',
  assetPrefix: './',
  trailingSlash: true,
  images: {
    unoptimized: true, // خلي التحسينات شغالة
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'shared.fastly.steamstatic.com',
        pathname: '/store_item_assets/steam/apps/**',
      },
    ],
  },
};

export default nextConfig;
