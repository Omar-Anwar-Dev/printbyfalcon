const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      { protocol: 'https', hostname: 'api.printbyfalcon.com' },
      { protocol: 'https', hostname: 'printbyfalcon.com' },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
