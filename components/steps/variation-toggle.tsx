"use client";

import { Check } from "lucide-react";

type VariationToggleProps = {
  variationKey: string;
  selected: boolean;
  disabled?: boolean;
  onToggle: (variationKey: string) => void;
};

export function VariationToggle({
  variationKey,
  selected,
  disabled = false,
  onToggle,
}: VariationToggleProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 data-[selected=true]:border-[var(--foreground)] data-[selected=true]:bg-[var(--foreground)] data-[selected=true]:text-white"
      data-selected={selected}
      onClick={() => onToggle(variationKey)}
    >
      {selected ? <Check size={16} aria-hidden="true" /> : null}
      {selected ? "Selected" : "Select"}
    </button>
  );
}
