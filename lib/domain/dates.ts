export function startOfLocalDay(timestampOrDate: number | Date): number {
  const date = new Date(timestampOrDate);

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

export function todayStartOfLocalDay(): number {
  return startOfLocalDay(new Date());
}
