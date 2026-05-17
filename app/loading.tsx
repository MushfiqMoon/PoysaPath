import { CoinLoader } from "@/components/coin-loader";

export default function RootLoading() {
  return (
    <div className="flex min-h-full items-center justify-center bg-bg">
      <CoinLoader fullPage label="Loading…" />
    </div>
  );
}
