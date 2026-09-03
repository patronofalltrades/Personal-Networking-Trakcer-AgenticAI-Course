export type AuthSocialProvider = "google" | "microsoft";

const supportedProviders = new Set<AuthSocialProvider>([
  "google",
  "microsoft",
]);

export function parseAuthSocialProviders(
  value: string | undefined,
): AuthSocialProvider[] {
  if (!value) return [];

  return [
    ...new Set(
      value
        .split(",")
        .map((provider) => provider.trim().toLowerCase())
        .filter((provider): provider is AuthSocialProvider =>
          supportedProviders.has(provider as AuthSocialProvider),
        ),
    ),
  ];
}

