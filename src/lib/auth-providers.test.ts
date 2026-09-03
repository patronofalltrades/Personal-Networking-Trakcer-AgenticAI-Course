import { describe, expect, it } from "vitest";

import { parseAuthSocialProviders } from "./auth-providers";

describe("parseAuthSocialProviders", () => {
  it("returns no providers when the variable is empty", () => {
    expect(parseAuthSocialProviders(undefined)).toEqual([]);
    expect(parseAuthSocialProviders("")).toEqual([]);
  });

  it("accepts Google and Microsoft", () => {
    expect(parseAuthSocialProviders("google,microsoft")).toEqual([
      "google",
      "microsoft",
    ]);
  });

  it("normalizes values and removes duplicates", () => {
    expect(parseAuthSocialProviders(" Google,google, MICROSOFT ")).toEqual([
      "google",
      "microsoft",
    ]);
  });

  it("ignores providers that the application does not support", () => {
    expect(parseAuthSocialProviders("google,github")).toEqual(["google"]);
  });
});

