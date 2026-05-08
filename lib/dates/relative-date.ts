const units = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["week", 7 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
] as const;

export function relativeDate(value: number | undefined, now = Date.now()) {
  if (!value) {
    return "Never";
  }

  const elapsed = now - value;

  if (Math.abs(elapsed) < 60 * 1000) {
    return "today";
  }

  for (const [unit, unitMs] of units) {
    const count = Math.floor(Math.abs(elapsed) / unitMs);

    if (count >= 1) {
      const suffix = count === 1 ? unit : `${unit}s`;
      return elapsed >= 0 ? `${count} ${suffix} ago` : `in ${count} ${suffix}`;
    }
  }

  return "today";
}
