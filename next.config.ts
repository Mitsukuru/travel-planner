import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    HASURA_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_ENDPOINT,
  },
};

export default nextConfig;
