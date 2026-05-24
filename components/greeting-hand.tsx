"use client";

import { useState } from "react";

export function GreetingHand() {
  const [stopped, setStopped] = useState(false);

  return (
    <span className="greeting-wave-slot text-md" aria-hidden>
      <span
        className={stopped ? "greeting-wave is-stopped" : "greeting-wave"}
        onAnimationEnd={() => setStopped(true)}
      >
        ✋
      </span>
    </span>
  );
}
