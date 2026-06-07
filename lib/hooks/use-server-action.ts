"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function useServerAction(fallbackMessage: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAction = useCallback(
    async (action: () => Promise<void>) => {
      setLoading(true);
      setError(null);
      try {
        await action();
        router.refresh();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : fallbackMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [router, fallbackMessage],
  );

  return { loading, error, setError, runAction };
}
