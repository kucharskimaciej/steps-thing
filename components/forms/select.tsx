"use client";

import { useId } from "react";

type SelectOption<T extends string | number> = {
  value: T;
  label: string;
};

type SelectProps<T extends string | number> = {
  label: string;
  value: T;
  options: SelectOption<T>[];
  error?: string;
  onChange: (value: T) => void;
};

export function Select<T extends string | number>({
  label,
  value,
  options,
  error,
  onChange,
}: SelectProps<T>) {
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm"
        value={String(value)}
        onChange={(event) => {
          const option = options.find(
            (candidate) => String(candidate.value) === event.target.value,
          );

          if (option) {
            onChange(option.value);
          }
        }}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
