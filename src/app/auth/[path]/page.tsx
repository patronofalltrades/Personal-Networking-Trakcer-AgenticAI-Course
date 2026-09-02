import { AuthScreen } from "@/components/auth-screen";

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  return <AuthScreen path={path} />;
}
