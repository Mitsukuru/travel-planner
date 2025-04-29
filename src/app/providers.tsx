"use client";

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

if (!process.env.HASURA_GRAPHQL_ENDPOINT) {
  throw new Error('HASURA_GRAPHQL_ENDPOINT is not defined');
}

if (!process.env.HASURA_GRAPHQL_ADMIN_SECRET) {
  throw new Error('HASURA_GRAPHQL_ADMIN_SECRET is not defined');
}

const client = new ApolloClient({
  uri: process.env.HASURA_GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
  headers: {
    'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
} 