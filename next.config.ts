import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    HASURA_GRAPHQL_ENDPOINT: process.env.HASURA_GRAPHQL_ENDPOINT,
  },
};

export default nextConfig;
