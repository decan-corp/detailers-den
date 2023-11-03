/** @type {import('next').NextConfig} */
const wordpressApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '';
const nextConfig = {
  images: {
    domains: [wordpressApiUrl.replace('https://', '')],
  },
  webpack: (config) => {
    const fileLoaderRule = config.module.rules.find(
      (rule) => rule.test && rule.test?.test?.('.svg')
    );
    fileLoaderRule.exclude = /\.svg$/;
    config.module.rules.push({
      test: /\.svg$/,
      loader: require.resolve('@svgr/webpack'),
    });
    return config;
  },
};

module.exports = nextConfig;
