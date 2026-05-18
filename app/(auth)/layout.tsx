import { PublicShell } from "@/components/public-shell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell variant="auth">{children}</PublicShell>;
}
