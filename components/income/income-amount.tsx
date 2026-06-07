import { FiPlusCircle } from "react-icons/fi";

import { formatCurrency } from "@/lib/format";

const sizeClasses = {
  sm: {
    text: "text-sm font-semibold",
    icon: "h-3.5 w-3.5",
  },
  md: {
    text: "text-base font-bold sm:text-lg",
    icon: "h-4 w-4",
  },
  lg: {
    text: "text-xl font-bold",
    icon: "h-[1.125rem] w-[1.125rem]",
  },
} as const;

type IncomeAmountProps = {
  amount: number;
  size?: keyof typeof sizeClasses;
  className?: string;
};

export function IncomeAmount({
  amount,
  size = "sm",
  className = "text-income",
}: IncomeAmountProps) {
  const sizing = sizeClasses[size];

  return (
    <span
      className={[
        "inline-flex items-center gap-1 tabular-nums",
        sizing.text,
        className,
      ].join(" ")}
    >
      <FiPlusCircle
        className={[sizing.icon, "shrink-0 opacity-90"].join(" ")}
        aria-hidden
      />
      {formatCurrency(amount)}
    </span>
  );
}
