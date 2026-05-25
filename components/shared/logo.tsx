"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  href?: string;
  className?: string;
};

export function Logo({
  size = 40,
  showWordmark = false,
  href,
  className = "",
}: LogoProps) {
  const [flipping, setFlipping] = useState(false);

  const handleFlip = useCallback(() => {
    if (flipping) return;
    setFlipping(true);
  }, [flipping]);

  const handleAnimationEnd = useCallback(() => {
    setFlipping(false);
  }, []);

  const src = size <= 64 ? "/icon.png" : "/logo.png";

  const image = (
    <div className="coin-flip-scene inline-block shrink-0 cursor-pointer" onClick={handleFlip}>
      <Image
        src={src}
        alt="PoysaPath"
        width={size}
        height={size}
        sizes={`${size}px`}
        className={[
          "rounded-full ring-1 ring-border/60",
          flipping ? "coin-flip-once" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onAnimationEnd={handleAnimationEnd}
        priority={size >= 64}
        draggable={false}
      />
    </div>
  );

  const content = (
    <span
      className={[
        "inline-flex items-center gap-2.5",
        href ? "transition-opacity hover:opacity-90 active:opacity-80" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {image}
      {showWordmark && (
        <span className="logo-wordmark text-[22px] text-accent">PoysaPath</span>
      )}
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
