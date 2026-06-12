export function knownBaits(values: string[]): string[] {
  const counts: Record<string, { label: string; count: number }> = {};

  for (const raw of values) {
    const bait = raw.trim();
    if (!bait) continue;

    const key = bait.toLowerCase();
    counts[key] ??= { label: bait, count: 0 };
    counts[key].count += 1;
  }

  return Object.values(counts)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .map((item) => item.label);
}
