import { CoinLoader } from "@/components/shared/coin-loader";

export default function RootLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <CoinLoader fullPage label="Loading…" />
    </div>
  );
}
