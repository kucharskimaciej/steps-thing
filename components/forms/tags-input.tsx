"use client";

import { X } from "lucide-react";
import { useId, useState } from "react";

type TagsInputProps = {
  label: string;
  values: string[];
  options?: string[];
  onChange: (values: string[]) => void;
};

function normalize(value: string): string {
  return value.trim();
}

export function TagsInput({
  label,
  values,
  options = [],
  onChange,
}: TagsInputProps) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const listLabel = `Selected ${label.toLocaleLowerCase()}`;
  const suggestions = options.filter((option) => !values.includes(option));

  function addValue(value: string) {
    const next = normalize(value);

    if (!next || values.includes(next)) {
      setDraft("");
      return;
    }

    onChange([...values, next]);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        className="h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm"
        value={draft}
        list={`${id}-options`}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => addValue(draft)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addValue(draft);
          }
        }}
      />
      <datalist id={`${id}-options`}>
        {suggestions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2" role="listbox" aria-label={`${label} options`}>
          {suggestions.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-2 py-1 text-xs"
              onClick={() => addValue(option)}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
      {values.length > 0 ? (
        <fieldset aria-label={listLabel} className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex min-h-8 items-center gap-1 rounded-md bg-[var(--foreground)] px-2 text-xs text-white"
            >
              {value}
              <button
                type="button"
                aria-label={`Remove ${label.toLocaleLowerCase()} ${value}`}
                onClick={() =>
                  onChange(values.filter((candidate) => candidate !== value))
                }
              >
                <X size={14} aria-hidden="true" />
              </button>
            </span>
          ))}
        </fieldset>
      ) : null}
    </div>
  );
}
