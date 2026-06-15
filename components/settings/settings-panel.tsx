import Link from "next/link";

import { Card } from "@/components/ui/card";

export function SettingsPanel() {
  return (
    <div className="space-y-6">
      <Card padding="md">
        <h3 className="font-semibold tracking-tight text-text">Legal</h3>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy policy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="text-accent hover:underline">
              Terms of use
            </Link>
          </li>
        </ul>
      </Card>

      <p className="pb-4 text-center text-xs text-text-muted">
        All rights reserved. Develop by{" "}
        <a
          href="https://github.com/MushfiqMoon"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Mushfiq
        </a>
      </p>
    </div>
  );
}
