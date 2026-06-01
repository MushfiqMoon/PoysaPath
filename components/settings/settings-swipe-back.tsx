"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, type ReactNode } from "react";

const SWIPE_THRESHOLD_PX = 72;

function isCoarsePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "input, textarea, select, button, a, [role='dialog'], [role='tablist']",
    ),
  );
}

type SettingsSwipeBackProps = {
  children: ReactNode;
};

export function SettingsSwipeBack({ children }: SettingsSwipeBackProps) {
  const pathname = usePathname();
  const router = useRouter();
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);

  const isSubpage =
    pathname.startsWith("/settings/") && pathname !== "/settings";

  function onTouchStart(e: React.TouchEvent) {
    if (!isSubpage || !isCoarsePointer()) return;
    if (isInteractiveTarget(e.target)) return;

    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    tracking.current = true;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!tracking.current) return;

    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) {
      tracking.current = false;
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!tracking.current) return;
    tracking.current = false;

    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;

    if (dx >= SWIPE_THRESHOLD_PX && dx > Math.abs(dy)) {
      router.push("/settings");
    }
  }

  if (!isSubpage) {
    return <>{children}</>;
  }

  return (
    <div
      className="min-h-0 touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  );
}
