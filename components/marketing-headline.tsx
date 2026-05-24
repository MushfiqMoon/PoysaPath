type MarketingHeadlineProps = {
  title: string;
  titleEm: string;
  className?: string;
};

/** Tally-style split headline: sans lead-in + Instrument Serif italic accent */
export function MarketingHeadline({
  title,
  titleEm,
  className = "",
}: MarketingHeadlineProps) {
  return (
    <span className={className}>
      {title}{" "}
      <em className="marketing-em">{titleEm}</em>
    </span>
  );
}
