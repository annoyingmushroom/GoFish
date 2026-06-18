import type { Trip } from "@/contexts/TripsContext";
import { parseTripDate } from "@/lib/date";
import { parseFish } from "@/lib/fish";

export function tripFishCount(t: Trip): number {
  return parseFish(t.fishGot).reduce((sum, f) => sum + f.count, 0);
}

export function totalFish(trips: Trip[]): number {
  return trips.reduce((sum, t) => sum + tripFishCount(t), 0);
}

export function speciesRanking(trips: Trip[]): { species: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const t of trips) {
    for (const f of parseFish(t.fishGot)) {
      counts[f.species] = (counts[f.species] ?? 0) + f.count;
    }
  }
  return Object.entries(counts)
    .map(([species, count]) => ({ species, count }))
    .sort((a, b) => b.count - a.count);
}

export function fishByMonth(trips: Trip[]): { label: string; count: number }[] {
  const buckets: Record<number, { label: string; count: number }> = {};
  for (const t of trips) {
    const d = parseTripDate(t.date);
    if (!d) continue;
    const key = d.getFullYear() * 12 + d.getMonth();
    if (!buckets[key]) {
      buckets[key] = { label: d.toLocaleDateString("en-GB", { month: "short" }), count: 0 };
    }
    buckets[key].count += tripFishCount(t);
  }
  return Object.entries(buckets)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([, v]) => v)
    .slice(-6);
}

export function topSpots(trips: Trip[]): { location: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const t of trips) {
    if (t.location) counts[t.location] = (counts[t.location] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export function baitRanking(trips: Trip[]): { bait: string; fish: number; trips: number }[] {
  const counts: Record<string, { label: string; fish: number; trips: number }> = {};
  for (const t of trips) {
    const bait = t.bait.trim();
    if (!bait) continue;
    const key = bait.toLowerCase();
    counts[key] ??= { label: bait, fish: 0, trips: 0 };
    counts[key].fish += tripFishCount(t);
    counts[key].trips += 1;
  }
  return Object.values(counts)
    .map((v) => ({ bait: v.label, fish: v.fish, trips: v.trips }))
    .sort((a, b) => b.fish - a.fish || b.trips - a.trips)
    .slice(0, 5);
}

export function monthComparison(
  trips: Trip[],
): { thisMonth: number; lastMonth: number; diff: number } {
  const now = new Date();
  const thisKey = now.getFullYear() * 12 + now.getMonth();
  const lastKey = thisKey - 1;
  let thisMonth = 0;
  let lastMonth = 0;
  for (const t of trips) {
    const d = parseTripDate(t.date);
    if (!d) continue;
    const key = d.getFullYear() * 12 + d.getMonth();
    if (key === thisKey) thisMonth += tripFishCount(t);
    if (key === lastKey) lastMonth += tripFishCount(t);
  }
  return { thisMonth, lastMonth, diff: thisMonth - lastMonth };
}

export function activityDays(
  trips: Trip[],
): { label: string; active: boolean; count: number }[] {
  const byDay: Record<string, number> = {};
  for (const t of trips) {
    const d = parseTripDate(t.date);
    if (!d) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    byDay[key] = (byDay[key] ?? 0) + 1;
  }

  const days: { label: string; active: boolean; count: number }[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 34);
  for (let i = 0; i < 35; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({
      label: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      active: Boolean(byDay[key]),
      count: byDay[key] ?? 0,
    });
  }
  return days;
}

export function bestDay(trips: Trip[]): { count: number; date: string } | null {
  let best: { count: number; date: string } | null = null;
  for (const t of trips) {
    const c = tripFishCount(t);
    if (c > 0 && (!best || c > best.count)) best = { count: c, date: t.date };
  }
  return best;
}

export function mostSpecies(trips: Trip[]): number {
  let max = 0;
  for (const t of trips) {
    const n = parseFish(t.fishGot).length;
    if (n > max) max = n;
  }
  return max;
}
