import { AuthForm } from "@/components/auth/auth-form";

type SignupPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  return (
    <AuthForm
      mode="signup"
      next={params.next}
      oauthError={params.error}
    />
  );
}
