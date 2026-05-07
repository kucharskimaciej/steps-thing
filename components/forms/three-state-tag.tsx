"use client";

import type { FeelingFilterValue } from "@/lib/search/types";

type ThreeStateTagProps = {
  label: string;
  value: FeelingFilterValue;
  onChange: (value: FeelingFilterValue) => void;
};

const nextValue: Record<FeelingFilterValue, FeelingFilterValue> = {
  [-1]: 0,
  0: 1,
  1: -1,
};

const stateLabel: Record<FeelingFilterValue, string> = {
  [-1]: "exclude",
  0: "neutral",
  1: "include",
};

const stateClass: Record<FeelingFilterValue, string> = {
  [-1]: "border-red-300 bg-red-50 text-red-800",
  0: "border-[var(--border)] bg-white text-[var(--foreground)]",
  1: "border-[var(--accent)] bg-[var(--accent)] text-white",
};

export function ThreeStateTag({ label, value, onChange }: ThreeStateTagProps) {
  return (
    <button
      type="button"
      aria-label={`${label}: ${stateLabel[value]}`}
      className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium ${stateClass[value]}`}
      onClick={() => onChange(nextValue[value])}
    >
      <span>{label}</span>
      <span className="text-xs uppercase">{stateLabel[value]}</span>
    </button>
  );
}
