"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

type CopyToClipboardProps = {
  value: string;
  label?: string;
};

export function CopyToClipboard({
  value,
  label = "Copy shortlink",
}: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1600);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyValue() {
    const clipboard = window.navigator.clipboard;

    if (!clipboard) {
      return;
    }

    await clipboard.writeText(value);
    setCopied(true);
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <code className="min-w-0 truncate rounded bg-[var(--muted)] px-2 py-1 text-xs text-[var(--muted-foreground)]">
        {value}
      </code>
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-[var(--border)] bg-white px-2 text-xs font-medium"
        onClick={copyValue}
      >
        {copied ? (
          <Check size={14} aria-hidden="true" />
        ) : (
          <Copy size={14} aria-hidden="true" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
