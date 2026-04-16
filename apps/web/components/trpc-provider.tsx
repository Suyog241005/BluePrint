"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";

import { trpc } from "@/lib/trpc";

export function TRPCProvider({
  children,
  cookies,
}: {
  children: React.ReactNode;
  cookies?: string;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005"}/api/trpc`,
          async headers() {
            // Only manually send cookies during server-side rendering
            if (typeof window === "undefined" && cookies) {
              return {
                cookie: cookies,
              };
            }
            return {};
          },
          // For client-side requests, fetch will handle credentials: "include" automatically
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
