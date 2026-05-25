import Image from "next/image";

type CoinLoaderProps = {
  label?: string;
  /** Fill the main content area (route transitions). */
  fullPage?: boolean;
};

export function CoinLoader({
  label = "Loading…",
  fullPage = false,
}: CoinLoaderProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center gap-4",
        fullPage ? "min-h-[min(70vh,32rem)] py-12" : "py-8",
      ].join(" ")}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="coin-flip-scene">
        <Image
          src="/icon.png"
          alt=""
          width={72}
          height={72}
          className="coin-flip-face rounded-full"
          priority
        />
      </div>
      <p className="text-sm font-medium text-text-muted">{label}</p>
    </div>
  );
}
