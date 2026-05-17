type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={[
        "animate-pulse rounded-lg bg-border/80",
        className,
      ].join(" ")}
      aria-hidden
    />
  );
}
