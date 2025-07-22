import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.mp3$/,
      use: {
        loader: 'file-loader',
        options: {
          name: 'static/media/[name].[hash].[ext]',
        },
      },
    });
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://web:8000/api/:path*',
      },
      {
        source: '/play/:path*',
        destination: 'http://web:8000/play/:path*',
      },
      {
        source: '/accounts/:path*',
        destination: 'http://web:8000/accounts/:path*/',
      },
      {
        source: '/change-player-preferences/:path*',
        destination: 'http://web:8000/change-player-preferences/:path*',
      },
      {
        source: '/:username/games/:path*',
        destination: 'http://web:8000/:username/games/:path*',
      },
      {
        source: '/ws/:path*',
        destination: 'http://daphne:8001/ws/:path*',
      },
    ]
  },
};

export default nextConfig;
