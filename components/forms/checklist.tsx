"use client";

type ChecklistOption = {
  value: string;
  label: string;
};

type ChecklistProps = {
  label: string;
  values: string[];
  options: ChecklistOption[];
  error?: string;
  onChange: (values: string[]) => void;
};

export function Checklist({
  label,
  values,
  options,
  error,
  onChange,
}: ChecklistProps) {
  function toggle(value: string) {
    onChange(
      values.includes(value)
        ? values.filter((candidate) => candidate !== value)
        : [...values, value],
    );
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm"
          >
            <input
              type="checkbox"
              checked={values.includes(option.value)}
              onChange={() => toggle(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </fieldset>
  );
}
