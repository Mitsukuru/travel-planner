import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        pathname: '/maps/api/place/js/PhotoService.GetPhoto**',
      },
    ],
  },
  env: {
    HASURA_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_ENDPOINT,
  },
};

export default nextConfig;
