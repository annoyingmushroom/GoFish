export type FishEntry = { species: string; count: number };

// Parse a stored "Tilapia x2, Bass x1" string into structured entries.
// Falls back gracefully for older freeform values.
export function parseFish(stored: string): FishEntry[] {
  if (!stored || !stored.trim()) return [];
  return stored
    .split(",")
    .map((part) => {
      const t = part.trim();
      if (!t) return null;
      // "Species x2" / "Species X2"
      let m = t.match(/^(.*?)\s*[xX]\s*(\d+)$/);
      if (m && m[1].trim()) return { species: m[1].trim(), count: parseInt(m[2], 10) };
      // "2x Species" / "2 Species"
      m = t.match(/^(\d+)\s*[xX]?\s+(.*)$/);
      if (m && m[2].trim()) return { species: m[2].trim(), count: parseInt(m[1], 10) };
      // plain species, assume 1
      return { species: t, count: 1 };
    })
    .filter((e): e is FishEntry => e !== null && e.count > 0);
}

// Turn structured entries back into the stored "Tilapia x2, Bass x1" format.
export function serializeFish(entries: FishEntry[]): string {
  return entries
    .filter((e) => e.species.trim())
    .map((e) => `${e.species.trim()} x${e.count}`)
    .join(", ");
}

// Build a suggestion list from species the user has actually logged before,
// most frequent first. Returns nothing until they've recorded some catches.
export function knownSpecies(allStored: string[]): string[] {
  const counts: Record<string, number> = {};
  for (const stored of allStored) {
    for (const e of parseFish(stored)) {
      const key = e.species.trim();
      if (key) counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([species]) => species);
}
