type BudgetProgressRingProps = {
  spent: number;
  amount: number;
  icon?: string | null;
  size?: number;
  strokeWidth?: number;
};

export function BudgetProgressRing({
  spent,
  amount,
  icon,
  size = 56,
  strokeWidth = 5,
}: BudgetProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = amount > 0 ? Math.min(100, (spent / amount) * 100) : 0;
  const over = spent > amount;
  const offset = circumference - (pct / 100) * circumference;
  const stroke = over ? "var(--danger)" : "var(--accent)";

  const iconSize = Math.round(size * 0.38);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-300"
        />
      </svg>
      {icon ? (
        <span
          className="absolute inset-0 flex items-center justify-center leading-none select-none"
          style={{ fontSize: iconSize }}
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
    </div>
  );
}
