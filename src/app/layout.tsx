import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: "Berkonnect — Personal Networking Tracker",
  description:
    "A private, secure place to remember the people and context that matter.",
  openGraph: {
    title: "Berkonnect",
    description: "Your network, thoughtfully kept.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Berkonnect",
    description: "Your network, thoughtfully kept.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
