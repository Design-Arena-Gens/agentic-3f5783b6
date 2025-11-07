/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'puppeteer': 'commonjs puppeteer',
        'chrome-aws-lambda': 'commonjs chrome-aws-lambda',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
