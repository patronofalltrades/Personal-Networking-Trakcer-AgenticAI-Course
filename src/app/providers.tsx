"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { neon } from "@/lib/neon";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  const content = (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </QueryClientProvider>
  );

  if (!neon) return content;

  return (
    <NeonAuthUIProvider
      authClient={neon.auth}
      basePath="/auth"
      redirectTo="/"
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      Link={Link}
      credentials={{ forgotPassword: false }}
      signUp={{ fields: ["name"] }}
    >
      {content}
    </NeonAuthUIProvider>
  );
}
