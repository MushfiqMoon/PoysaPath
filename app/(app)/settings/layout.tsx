import { SettingsSwipeBack } from "@/components/settings/settings-swipe-back";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SettingsSwipeBack>{children}</SettingsSwipeBack>;
}
