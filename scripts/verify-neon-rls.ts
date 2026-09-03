import { config } from "dotenv";
import { createClient } from "@neondatabase/neon-js";

config({ path: ".env.local", quiet: true });

const requiredVariables = [
  "NEXT_PUBLIC_NEON_AUTH_URL",
  "NEXT_PUBLIC_NEON_DATA_API_URL",
  "TEST_USER_A_EMAIL",
  "TEST_USER_A_PASSWORD",
  "TEST_USER_B_EMAIL",
  "TEST_USER_B_PASSWORD",
] as const;

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing ${variable}. Add it to .env.local before running the integration test.`);
  }
}

const authUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL!;
const dataApiUrl = process.env.NEXT_PUBLIC_NEON_DATA_API_URL!;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const appOrigin = new URL(appUrl).origin;

async function authenticatedClient(email: string, password: string) {
  const signIn = await fetch(`${authUrl}/sign-in/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: appOrigin,
    },
    body: JSON.stringify({ email, password, callbackURL: appUrl }),
  });

  if (!signIn.ok) {
    const body = await signIn.json().catch(() => ({}));
    throw new Error(`Could not sign in test account: ${body.message ?? signIn.statusText}`);
  }

  const sessionCookie = signIn.headers
    .getSetCookie()
    .map((value) => value.split(";", 1)[0])
    .find((value) => value.includes("session_token="));
  if (!sessionCookie) throw new Error("Auth did not return a session cookie.");

  const session = await fetch(`${authUrl}/get-session`, {
    headers: { Cookie: sessionCookie, Origin: appOrigin },
  });
  const jwt = session.headers.get("set-auth-jwt");
  if (!session.ok || !jwt) throw new Error("Auth did not return a Data API JWT.");

  return {
    neon: createClient({
      dataApi: { url: dataApiUrl, getToken: async () => jwt },
    }),
    async signOut() {
      await fetch(`${authUrl}/sign-out`, {
        method: "POST",
        headers: { Cookie: sessionCookie, Origin: appOrigin },
      });
    },
  };
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const [sessionA, sessionB] = await Promise.all([
    authenticatedClient(process.env.TEST_USER_A_EMAIL!, process.env.TEST_USER_A_PASSWORD!),
    authenticatedClient(process.env.TEST_USER_B_EMAIL!, process.env.TEST_USER_B_PASSWORD!),
  ]);
  const userA = sessionA.neon;
  const userB = sessionB.neon;
  const marker = `rls-check-${Date.now()}`;
  let contactId: string | undefined;

  try {
    const created = await userA
      .from("contacts")
      .insert({ name: marker, priority: "high" })
      .select("id,name,notes")
      .single();
    if (created.error) throw new Error(`User A could not create the fixture: ${created.error.message}`);

    contactId = created.data.id as string;

    const readByB = await userB.from("contacts").select("id").eq("id", contactId);
    if (readByB.error) throw new Error(readByB.error.message);
    assert(readByB.data.length === 0, "RLS failure: User B could read User A's contact.");

    const updateByB = await userB
      .from("contacts")
      .update({ notes: "unauthorized change" })
      .eq("id", contactId)
      .select("id");
    if (updateByB.error) throw new Error(updateByB.error.message);
    assert(updateByB.data.length === 0, "RLS failure: User B could update User A's contact.");

    const deleteByB = await userB.from("contacts").delete().eq("id", contactId).select("id");
    if (deleteByB.error) throw new Error(deleteByB.error.message);
    assert(deleteByB.data.length === 0, "RLS failure: User B could delete User A's contact.");

    const unchanged = await userA
      .from("contacts")
      .select("id,notes")
      .eq("id", contactId)
      .single();
    if (unchanged.error) throw new Error(unchanged.error.message);
    assert(unchanged.data.notes === null, "RLS failure: User A's contact changed.");

    const blankName = await userA.from("contacts").insert({ name: "   ", priority: "medium" });
    assert(Boolean(blankName.error), "Validation failure: the database accepted a blank name.");

    const invalidPriority = await userA
      .from("contacts")
      .insert({ name: "Invalid priority check", priority: "urgent" as never });
    assert(Boolean(invalidPriority.error), "Validation failure: the database accepted an invalid priority.");

    console.log("PASS: ownership RLS blocked cross-account read, update, and delete.");
    console.log("PASS: database constraints rejected blank names and invalid priorities.");
  } finally {
    if (contactId) {
      const cleanup = await userA.from("contacts").delete().eq("id", contactId);
      if (cleanup.error) console.warn(`Fixture cleanup failed: ${cleanup.error.message}`);
    }
    await Promise.all([sessionA.signOut(), sessionB.signOut()]);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
