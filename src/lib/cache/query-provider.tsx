/**
 * React Query Provider Component
 * Configures React Query client with caching optimizations
 */

"use client";

import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient, createQueryClient } from "./query-client";
import { cachePersistence } from "./query-client";

interface QueryProviderProps {
  children: ReactNode;
  client?: QueryClient;
  enableDevtools?: boolean;
  persistToSession?: boolean;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({
  children,
  client = queryClient,
  enableDevtools = process.env.NODE_ENV === "development",
  persistToSession = true,
}) => {
  // Restore cache from session storage on mount
  React.useEffect(() => {
    if (persistToSession && typeof window !== "undefined") {
      cachePersistence.restoreCache();
    }
  }, [persistToSession]);

  // Save cache to session storage before page unload
  React.useEffect(() => {
    if (persistToSession && typeof window !== "undefined") {
      const handleBeforeUnload = () => {
        cachePersistence.saveCache();
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () =>
        window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [persistToSession]);

  return (
    <QueryClientProvider client={client}>
      {children}
      {enableDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

// Create a new query client instance for SSR/SSG
export const createQueryClientForSSR = () => {
  return createQueryClient();
};

// Provider configuration with environment-specific settings
export const getQueryProviderConfig = () => {
  const isDevelopment = process.env.NODE_ENV === "development";

  return {
    enableDevtools: isDevelopment,
    persistToSession: !isDevelopment, // Only persist in production
    retryOnMount: !isDevelopment,
    refetchOnWindowFocus: false,
  };
};

// Query client configuration for different environments
export const getQueryClientConfig = () => {
  const isDevelopment = process.env.NODE_ENV === "development";

  return {
    defaultOptions: {
      queries: {
        staleTime: isDevelopment ? 0 : 2 * 60 * 1000, // 0 for dev, 2min for prod
        gcTime: isDevelopment ? 5 * 60 * 1000 : 10 * 60 * 1000, // 5min for dev, 10min for prod
        retry: isDevelopment ? 1 : 3,
        retryDelay: (attemptIndex: number) =>
          Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        networkMode: "online",
      },
      mutations: {
        retry: isDevelopment ? 1 : 2,
        networkMode: "online",
      },
    },
  };
};
