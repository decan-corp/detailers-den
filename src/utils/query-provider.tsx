/* eslint-disable no-console */

'use client';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import React from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

const QueryProvider = ({ children }: React.PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

export default QueryProvider;
