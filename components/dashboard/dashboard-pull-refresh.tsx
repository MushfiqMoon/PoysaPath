"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

const THRESHOLD = 72;
const MAX_PULL = 100;

type DashboardPullRefreshProps = {
  children: React.ReactNode;
};

export function DashboardPullRefresh({ children }: DashboardPullRefreshProps) {
  const router = useRouter();
  const startY = useRef(0);
  const pulling = useRef(false);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const canPull = useCallback(() => {
    if (typeof window === "undefined") return false;
    if (!window.matchMedia("(pointer: coarse)").matches) return false;
    return window.scrollY <= 0;
  }, []);

  function onTouchStart(e: React.TouchEvent) {
    if (refreshing || !canPull()) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!pulling.current || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0 && window.scrollY <= 0) {
      setPull(Math.min(MAX_PULL, dy * 0.5));
    } else if (dy <= 0) {
      setPull(0);
      pulling.current = false;
    }
  }

  function onTouchEnd() {
    if (!pulling.current) return;
    pulling.current = false;
    if (pull >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPull(THRESHOLD);
      router.refresh();
      window.setTimeout(() => {
        setRefreshing(false);
        setPull(0);
      }, 600);
    } else {
      setPull(0);
    }
  }

  return (
    <div
      className="relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="pointer-events-none flex justify-center overflow-hidden transition-[height] duration-150 md:hidden"
        style={{ height: pull > 0 ? pull : 0 }}
        aria-hidden
      >
        <span className="pt-2 text-xs text-text-muted">
          {refreshing
            ? "Refreshing…"
            : pull >= THRESHOLD
              ? "Release to refresh"
              : pull > 20
                ? "Pull to refresh"
                : ""}
        </span>
      </div>
      {children}
    </div>
  );
}
