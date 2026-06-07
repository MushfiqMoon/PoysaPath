type DashboardMasonryProps = {
  children: React.ReactNode;
};

/** Desktop: 2-column masonry via CSS columns. Mobile: single column stack. */
export function DashboardMasonry({ children }: DashboardMasonryProps) {
  return (
    <div className="flex flex-col gap-6 md:block md:columns-2 md:gap-6">
      {children}
    </div>
  );
}

type DashboardMasonryItemProps = {
  children: React.ReactNode;
  className?: string;
};

export function DashboardMasonryItem({
  children,
  className = "",
}: DashboardMasonryItemProps) {
  return (
    <div
      className={[
        "w-full max-w-full break-inside-avoid [display:flow-root] md:mb-6 md:last:mb-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
