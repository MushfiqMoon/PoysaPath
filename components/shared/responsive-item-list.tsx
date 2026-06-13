import type { ReactNode } from "react";

import { SwipeCardStack, type SwipeCardStackProps } from "@/components/shared/swipe-card-stack";

type ResponsiveItemListProps<T> = SwipeCardStackProps<T> & {
  renderDesktop: (item: T) => ReactNode;
  desktopListClassName?: string;
};

export function ResponsiveItemList<T>({
  items,
  renderDesktop,
  desktopListClassName = "space-y-3",
  ...stackProps
}: ResponsiveItemListProps<T>) {
  if (items.length === 0) return null;

  return (
    <>
      <div className="md:hidden">
        <SwipeCardStack items={items} {...stackProps} />
      </div>
      <ul className={["hidden md:block", desktopListClassName].join(" ")}>
        {items.map((item) => (
          <li key={stackProps.getItemId(item)}>{renderDesktop(item)}</li>
        ))}
      </ul>
    </>
  );
}
