import type { Trip } from "@/contexts/TripsContext";
import { useTrips } from "@/contexts/TripsContext";
import { formatTripDate, parseTripDate } from "@/lib/date";
import { parseFish } from "@/lib/fish";
import { fontStyle } from "@/lib/theme";
import { FontAwesome } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

function tripFishCount(t: Trip): number {
  return parseFish(t.fishGot).reduce((sum, f) => sum + f.count, 0);
}

function totalFish(trips: Trip[]): number {
  return trips.reduce((sum, t) => sum + tripFishCount(t), 0);
}

function speciesRanking(trips: Trip[]): { species: string; count: number }[] {
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

function fishByMonth(trips: Trip[]): { label: string; count: number }[] {
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

function topSpots(trips: Trip[]): { location: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const t of trips) {
    if (t.location) counts[t.location] = (counts[t.location] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function baitRanking(trips: Trip[]): { bait: string; fish: number; trips: number }[] {
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

function monthComparison(trips: Trip[]): { thisMonth: number; lastMonth: number; diff: number } {
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

function activityDays(trips: Trip[]): { label: string; active: boolean; count: number }[] {
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

function bestDay(trips: Trip[]): { count: number; date: string } | null {
  let best: { count: number; date: string } | null = null;
  for (const t of trips) {
    const c = tripFishCount(t);
    if (c > 0 && (!best || c > best.count)) best = { count: c, date: t.date };
  }
  return best;
}

function mostSpecies(trips: Trip[]): number {
  let max = 0;
  for (const t of trips) {
    const n = parseFish(t.fishGot).length;
    if (n > max) max = n;
  }
  return max;
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export default function StatsScreen() {
  const { trips } = useTrips();

  if (trips.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={styles.emptyTitle}>No data yet</Text>
        <Text style={styles.emptySub}>Log your first trip to see your stats.</Text>
      </View>
    );
  }

  const fishCount = totalFish(trips);
  const species = speciesRanking(trips);
  const months = fishByMonth(trips);
  const spots = topSpots(trips);
  const baits = baitRanking(trips);
  const comparison = monthComparison(trips);
  const activity = activityDays(trips);
  const best = bestDay(trips);
  const variety = mostSpecies(trips);

  const maxSpecies = species.length ? species[0].count : 1;
  const maxMonth = months.length ? Math.max(...months.map((m) => m.count)) : 1;

  return (
    <ScrollView style={styles.bg} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>📊</Text>
        <Text style={styles.headerTitle}>Your Stats</Text>
      </View>

      {/* A · Summary tiles */}
      <View style={styles.tileRow}>
        <View style={styles.tile}>
          <FontAwesome name="trophy" size={20} color="#f4b183" />
          <Text style={styles.tileValue}>{fishCount}</Text>
          <Text style={styles.tileLabel}>fish caught</Text>
        </View>
        <View style={styles.tile}>
          <FontAwesome name="map-marker" size={20} color="#f4b183" />
          <Text style={styles.tileValue}>{trips.length}</Text>
          <Text style={styles.tileLabel}>trips logged</Text>
        </View>
      </View>

      {/* This month vs last month */}
      <SectionLabel>MONTHLY PACE</SectionLabel>
      <View style={styles.card}>
        <View style={styles.compareRow}>
          <View>
            <Text style={styles.compareValue}>{comparison.thisMonth}</Text>
            <Text style={styles.compareLabel}>fish this month</Text>
          </View>
          <View style={styles.compareBadge}>
            <FontAwesome
              name={comparison.diff >= 0 ? "arrow-up" : "arrow-down"}
              size={12}
              color="#7a531a"
            />
            <Text style={styles.compareBadgeText}>
              {comparison.diff >= 0 ? "+" : ""}
              {comparison.diff}
            </Text>
          </View>
          <View style={styles.compareRight}>
            <Text style={styles.compareValueSmall}>{comparison.lastMonth}</Text>
            <Text style={styles.compareLabel}>last month</Text>
          </View>
        </View>
      </View>

      {/* B · Top species */}
      {species.length > 0 && (
        <>
          <SectionLabel>TOP SPECIES</SectionLabel>
          <View style={styles.card}>
            {species.slice(0, 5).map((s) => (
              <View key={s.species} style={styles.barBlock}>
                <View style={styles.barTop}>
                  <Text style={styles.barName}>{s.species}</Text>
                  <Text style={styles.barCount}>{s.count}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[styles.barFill, { width: `${Math.max(6, (s.count / maxSpecies) * 100)}%` }]}
                  />
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* C · Catches by month */}
      {months.length > 0 && (
        <>
          <SectionLabel>CATCHES BY MONTH</SectionLabel>
          <View style={styles.card}>
            <View style={styles.chartRow}>
              {months.map((m, i) => (
                <View key={i} style={styles.chartCol}>
                  <Text style={styles.chartValue}>{m.count}</Text>
                  <View
                    style={[
                      styles.chartBar,
                      { height: m.count > 0 ? Math.max(6, (m.count / maxMonth) * 72) : 2 },
                    ]}
                  />
                  <Text style={styles.chartLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {/* D · Top spots */}
      {spots.length > 0 && (
        <>
          <SectionLabel>TOP SPOTS</SectionLabel>
          <View style={styles.card}>
            {spots.map((s, i) => (
              <View
                key={s.location}
                style={[styles.spotRow, i < spots.length - 1 && styles.spotDivider]}
              >
                <Text style={styles.spotName}>
                  <Text style={styles.spotRank}>{i + 1}. </Text>
                  {s.location}
                </Text>
                <Text style={styles.spotCount}>
                  {s.count} trip{s.count !== 1 ? "s" : ""}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Best bait */}
      {baits.length > 0 && (
        <>
          <SectionLabel>BEST BAIT</SectionLabel>
          <View style={styles.card}>
            {baits.map((b, i) => (
              <View
                key={b.bait}
                style={[styles.spotRow, i < baits.length - 1 && styles.spotDivider]}
              >
                <Text style={styles.spotName}>
                  <Text style={styles.spotRank}>{i + 1}. </Text>
                  {b.bait}
                </Text>
                <Text style={styles.spotCount}>
                  {b.fish} fish · {b.trips} trip{b.trips !== 1 ? "s" : ""}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* E · Personal bests */}
      <SectionLabel>PERSONAL BESTS</SectionLabel>
      <View style={styles.tileRow}>
        <View style={styles.tile}>
          <FontAwesome name="trophy" size={16} color="#f4b183" />
          <Text style={styles.bestValue}>{best ? `${best.count} fish` : "—"}</Text>
          <Text style={styles.tileLabel}>
            {best?.date ? `best day · ${formatTripDate(best.date)}` : "best day"}
          </Text>
        </View>
        <View style={styles.tile}>
          <FontAwesome name="fire" size={16} color="#f4b183" />
          <Text style={styles.bestValue}>{variety} species</Text>
          <Text style={styles.tileLabel}>most in a trip</Text>
        </View>
      </View>

      <SectionLabel>ACTIVITY</SectionLabel>
      <View style={styles.card}>
        <View style={styles.activityGrid}>
          {activity.map((d, i) => (
            <View
              key={`${d.label}-${i}`}
              style={[
                styles.activityDot,
                d.active && styles.activityDotActive,
                d.count > 1 && styles.activityDotBusy,
              ]}
              accessibilityLabel={`${d.label}: ${d.count} trips`}
            />
          ))}
        </View>
        <View style={styles.activityLegend}>
          <Text style={styles.activityLegendText}>{activity[0]?.label}</Text>
          <Text style={styles.activityLegendText}>last 35 days</Text>
          <Text style={styles.activityLegendText}>{activity[activity.length - 1]?.label}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const CARD_BG = "rgba(255,255,255,0.10)";
const CARD_BORDER = "rgba(255,255,255,0.15)";

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#4478e6" },
  scroll: { paddingHorizontal: 18, paddingBottom: 48 },

  empty: {
    flex: 1,
    backgroundColor: "#4478e6",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: "#fff", ...fontStyle },
  emptySub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    paddingHorizontal: 32,
    ...fontStyle,
  },

  header: { alignItems: "center", paddingTop: 28, paddingBottom: 22 },
  headerEmoji: { fontSize: 40, marginBottom: 6 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#fff", ...fontStyle },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#f4b183",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 2,
    ...fontStyle,
  },

  tileRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  tile: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  tileValue: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 6, ...fontStyle },
  bestValue: { color: "#fff", fontSize: 16, fontWeight: "700", marginTop: 6, ...fontStyle },
  tileLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
    ...fontStyle,
  },

  card: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },

  compareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  compareValue: { color: "#fff", fontSize: 28, fontWeight: "800", ...fontStyle },
  compareValueSmall: { color: "#fff", fontSize: 20, fontWeight: "800", textAlign: "right", ...fontStyle },
  compareLabel: { color: "rgba(255,255,255,0.55)", fontSize: 12, ...fontStyle },
  compareRight: { alignItems: "flex-end" },
  compareBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f4b183",
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  compareBadgeText: { color: "#7a531a", fontSize: 13, fontWeight: "800", ...fontStyle },

  barBlock: { marginBottom: 12 },
  barTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  barName: { color: "#fff", fontSize: 13, ...fontStyle },
  barCount: { color: "#f4b183", fontSize: 13, fontWeight: "700", ...fontStyle },
  barTrack: { height: 8, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 4 },
  barFill: { height: 8, backgroundColor: "#f4b183", borderRadius: 4 },

  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  chartCol: { flex: 1, alignItems: "center", gap: 5 },
  chartValue: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600", ...fontStyle },
  chartBar: { width: "70%", backgroundColor: "#f4b183", borderRadius: 4 },
  chartLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11, ...fontStyle },

  spotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
  },
  spotDivider: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" },
  spotName: { color: "#fff", fontSize: 14, flex: 1, ...fontStyle },
  spotRank: { color: "#f4b183", fontWeight: "700" },
  spotCount: { color: "rgba(255,255,255,0.55)", fontSize: 12, ...fontStyle },

  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  activityDot: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  activityDotActive: {
    backgroundColor: "rgba(244,177,131,0.75)",
  },
  activityDotBusy: {
    backgroundColor: "#f4b183",
  },
  activityLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  activityLegendText: { color: "rgba(255,255,255,0.45)", fontSize: 11, ...fontStyle },
});
