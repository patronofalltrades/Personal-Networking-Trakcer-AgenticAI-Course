"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { parseAuthSocialProviders } from "@/lib/auth-providers";
import { neon } from "@/lib/neon";

const socialProviders = parseAuthSocialProviders(
  process.env.NEXT_PUBLIC_AUTH_SOCIAL_PROVIDERS,
);

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
      social={
        socialProviders.length ? { providers: socialProviders } : undefined
      }
    >
      {content}
    </NeonAuthUIProvider>
  );
}
