"use client";

import { AuthView } from "@neondatabase/auth-ui";
import { ArrowLeft, LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { isNeonConfigured } from "@/lib/neon";
import { cn } from "@/lib/utils";

export function AuthScreen({ path }: { path: string }) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,0.9fr)_minmax(32rem,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-primary px-10 py-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_15%,oklch(0.78_0.125_83/.35),transparent_22rem),linear-gradient(135deg,transparent_35%,oklch(0.25_0.07_253)_100%)]" />
        <div className="relative flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
            <Sparkles className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-heading font-semibold">Berkeley Network</p>
            <p className="text-xs text-primary-foreground/65">Stay meaningfully connected</p>
          </div>
        </div>
        <div className="relative max-w-lg">
          <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            <LockKeyhole className="size-4" aria-hidden="true" /> Private by design
          </p>
          <h1 className="font-heading text-5xl font-semibold leading-[1.05] tracking-[-0.04em]">The details that make a relationship feel remembered.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-primary-foreground/70">Your contacts are protected by account-level database policies, so your network remains yours alone.</p>
        </div>
        <p className="relative text-xs text-primary-foreground/55">Securely powered by Neon Auth and Postgres row-level security.</p>
      </section>

      <section className="flex min-h-screen flex-col px-4 py-6 sm:px-8 lg:px-16 lg:py-10">
        <div className="flex items-center justify-between">
          <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "-ml-2 h-9 gap-2 rounded-xl px-3")}>
            <ArrowLeft className="size-4" aria-hidden="true" /> Back
          </Link>
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground lg:hidden"><Sparkles className="size-4" aria-hidden="true" /></div>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          {isNeonConfigured ? (
            <AuthView path={path} redirectTo="/" className="w-full max-w-md" />
          ) : (
            <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Setup required</p>
              <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">Connect Neon to continue</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Copy <code>.env.example</code> to <code>.env.local</code>, add the public Auth and Data API endpoints, and restart the app.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
