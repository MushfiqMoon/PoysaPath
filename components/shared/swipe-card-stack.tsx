"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { FiLayers } from "react-icons/fi";

const SWIPE_THRESHOLD = 50;
const TAP_THRESHOLD = 10;
const PEEK_PADDING_PX = 36;

type SlideDirection = "next" | "prev" | null;

export type SwipeCardStackProps<T> = {
  items: T[];
  getItemId: (item: T) => string;
  label: string;
  renderPeek: (item: T) => ReactNode;
  renderFront: (
    item: T,
    options: { showHint: boolean; tapHint: string },
  ) => ReactNode;
  onItemSelect?: (item: T) => void;
};

function wrapIndex(index: number, length: number): number {
  if (length === 0) return 0;
  return ((index % length) + length) % length;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function SwipeCardStack<T>({
  items,
  getItemId,
  label,
  renderPeek,
  renderFront,
  onItemSelect,
}: SwipeCardStackProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const startX = useRef(0);
  const dragging = useRef(false);
  const pointerId = useRef<number | null>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  const count = items.length;
  const hasMoreCards = count > 1;
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    setActiveIndex((current) => wrapIndex(current, count));
  }, [count]);

  const changeIndex = useCallback(
    (direction: "next" | "prev") => {
      if (reducedMotion) {
        setActiveIndex((current) =>
          wrapIndex(current + (direction === "next" ? 1 : -1), count),
        );
        return;
      }

      setSlideDirection(direction);
      setActiveIndex((current) =>
        wrapIndex(current + (direction === "next" ? 1 : -1), count),
      );
    },
    [count, reducedMotion],
  );

  const goNext = useCallback(() => changeIndex("next"), [changeIndex]);
  const goPrev = useCallback(() => changeIndex("prev"), [changeIndex]);

  const handleRelease = useCallback(
    (dx: number) => {
      dragging.current = false;
      pointerId.current = null;

      if (Math.abs(dx) < TAP_THRESHOLD) {
        setDragOffset(0);
        const item = items[activeIndex];
        if (item && onItemSelect) {
          onItemSelect(item);
        }
        return;
      }

      if (dx <= -SWIPE_THRESHOLD) {
        goNext();
      } else if (dx >= SWIPE_THRESHOLD) {
        goPrev();
      }

      setDragOffset(0);
    },
    [activeIndex, goNext, goPrev, items, onItemSelect],
  );

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startX.current = e.clientX;
    dragging.current = true;
    pointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current || pointerId.current !== e.pointerId) return;
    setDragOffset(e.clientX - startX.current);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current || pointerId.current !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    handleRelease(e.clientX - startX.current);
  }

  function onPointerCancel(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current || pointerId.current !== e.pointerId) return;
    dragging.current = false;
    pointerId.current = null;
    setDragOffset(0);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const item = items[activeIndex];
      if (item && onItemSelect) {
        onItemSelect(item);
      }
    }
  }

  function handleFrontAnimationEnd() {
    setSlideDirection(null);
  }

  if (count === 0) return null;

  const frontItem = items[activeIndex];
  const prevItem = hasMoreCards
    ? items[wrapIndex(activeIndex - 1, count)]
    : null;

  const dragProgress = Math.max(-1, Math.min(1, dragOffset / 120));
  const frontLiftY = dragOffset !== 0 ? -dragProgress * 18 : 0;
  const frontScale =
    dragOffset !== 0 ? 1 - Math.min(0.05, Math.abs(dragProgress) * 0.05) : 1;
  const frontRotate = dragOffset !== 0 ? dragProgress * 1.5 : 0;

  const frontEnterClass =
    slideDirection === "next"
      ? "card-stack-rise"
      : slideDirection === "prev"
        ? "card-stack-drop"
        : "";

  const frontTransform =
    dragOffset !== 0
      ? `translateX(${dragOffset}px) translateY(${frontLiftY}px) scale(${frontScale}) rotate(${frontRotate}deg)`
      : undefined;

  const topPeekDrop =
    dragOffset > 0
      ? Math.min(21, dragOffset * 0.12)
      : dragOffset < 0
        ? -Math.min(7, -dragOffset * 0.05)
        : 0;

  const tapHint = onItemSelect ? "Tap to open · Swipe to browse" : "Swipe to browse";

  return (
    <section className="space-y-4">
      {hasMoreCards ? (
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-text-muted">
          <FiLayers className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
          <span>
            {count} {label} · swipe to browse
          </span>
        </div>
      ) : null}

      <div className="relative isolate z-0 mx-auto w-full max-w-md">
        <div
          ref={stackRef}
          role="group"
          tabIndex={0}
          aria-label={`${label} ${activeIndex + 1} of ${count}`}
          className="relative overflow-hidden touch-pan-y outline-none"
          style={{ paddingTop: hasMoreCards ? PEEK_PADDING_PX : 0 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onKeyDown={onKeyDown}
        >
          {prevItem ? (
            <div
              key={`${getItemId(prevItem)}-peek-${activeIndex}`}
              className={[
                "absolute inset-x-0 z-[1] px-1.5",
                reducedMotion ? "" : "card-stack-peek-drop",
              ].join(" ")}
              style={{
                top: `${topPeekDrop}px`,
                transform: "scale(0.97)",
                transformOrigin: "bottom center",
              }}
            >
              {renderPeek(prevItem)}
            </div>
          ) : null}

          <div
            key={getItemId(frontItem)}
            className={[
              "relative z-[2]",
              frontEnterClass,
              dragOffset !== 0 || reducedMotion
                ? ""
                : "transition-transform duration-200 ease-out",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ transform: frontTransform }}
            onAnimationEnd={handleFrontAnimationEnd}
          >
            {renderFront(frontItem, {
              showHint: hasMoreCards,
              tapHint,
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-text-muted">
          {activeIndex + 1} of {count}
        </p>
        {hasMoreCards ? (
          <div className="flex items-center gap-1.5" aria-hidden>
            {items.map((item, index) => (
              <span
                key={getItemId(item)}
                className={[
                  "h-1.5 rounded-full transition-all duration-200",
                  index === activeIndex ? "w-4 bg-accent" : "w-1.5 bg-border",
                ].join(" ")}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
