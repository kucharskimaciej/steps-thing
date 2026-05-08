type StepTagsProps = {
  values: string[];
  limit?: number;
};

export function StepTags({ values, limit = 12 }: StepTagsProps) {
  const unique = [
    ...new Set(values.filter((value) => value.trim().length > 0)),
  ];

  if (unique.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Step tags">
      {unique.slice(0, limit).map((tag) => (
        <li
          key={tag}
          className="rounded-md bg-[var(--muted)] px-2 py-1 text-xs text-[var(--foreground)]"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
