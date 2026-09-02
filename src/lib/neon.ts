"use client";

import { createClient } from "@neondatabase/neon-js";
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react/adapters";

import type { Database } from "@/types/database";

const authUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL;
const dataApiUrl = process.env.NEXT_PUBLIC_NEON_DATA_API_URL;

export const isNeonConfigured = Boolean(authUrl && dataApiUrl);

export const neon = isNeonConfigured
  ? createClient<Database>({
      auth: {
        adapter: BetterAuthReactAdapter(),
        url: authUrl!,
      },
      dataApi: {
        url: dataApiUrl!,
      },
    })
  : null;
