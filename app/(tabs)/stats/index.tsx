import { useTrips } from "@/contexts/TripsContext";
import { formatTripDate } from "@/lib/date";
import {
  activityDays,
  baitRanking,
  bestDay,
  fishByMonth,
  monthComparison,
  mostSpecies,
  speciesRanking,
  topSpots,
  totalFish,
} from "@/lib/stats";
import { COLORS, fontStyle } from "@/lib/theme";
import { FontAwesome } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

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

      {/* Summary tiles */}
      <View style={styles.tileRow}>
        <View style={styles.tile}>
          <FontAwesome name="trophy" size={20} color={COLORS.accent} />
          <Text style={styles.tileValue}>{fishCount}</Text>
          <Text style={styles.tileLabel}>fish caught</Text>
        </View>
        <View style={styles.tile}>
          <FontAwesome name="map-marker" size={20} color={COLORS.accent} />
          <Text style={styles.tileValue}>{trips.length}</Text>
          <Text style={styles.tileLabel}>trips logged</Text>
        </View>
      </View>

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
              {comparison.diff >= 0 ? "+" : ""}{comparison.diff}
            </Text>
          </View>
          <View style={styles.compareRight}>
            <Text style={styles.compareValueSmall}>{comparison.lastMonth}</Text>
            <Text style={styles.compareLabel}>last month</Text>
          </View>
        </View>
      </View>

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
                  <View style={[styles.barFill, { width: `${Math.max(6, (s.count / maxSpecies) * 100)}%` }]} />
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {months.length > 0 && (
        <>
          <SectionLabel>CATCHES BY MONTH</SectionLabel>
          <View style={styles.card}>
            <View style={styles.chartRow}>
              {months.map((m, i) => (
                <View key={i} style={styles.chartCol}>
                  <Text style={styles.chartValue}>{m.count}</Text>
                  <View style={[styles.chartBar, { height: m.count > 0 ? Math.max(6, (m.count / maxMonth) * 72) : 2 }]} />
                  <Text style={styles.chartLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {spots.length > 0 && (
        <>
          <SectionLabel>TOP SPOTS</SectionLabel>
          <View style={styles.card}>
            {spots.map((s, i) => (
              <View key={s.location} style={[styles.spotRow, i < spots.length - 1 && styles.spotDivider]}>
                <Text style={styles.spotName}>
                  <Text style={styles.spotRank}>{i + 1}. </Text>{s.location}
                </Text>
                <Text style={styles.spotCount}>{s.count} trip{s.count !== 1 ? "s" : ""}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {baits.length > 0 && (
        <>
          <SectionLabel>BEST BAIT</SectionLabel>
          <View style={styles.card}>
            {baits.map((b, i) => (
              <View key={b.bait} style={[styles.spotRow, i < baits.length - 1 && styles.spotDivider]}>
                <Text style={styles.spotName}>
                  <Text style={styles.spotRank}>{i + 1}. </Text>{b.bait}
                </Text>
                <Text style={styles.spotCount}>{b.fish} fish · {b.trips} trip{b.trips !== 1 ? "s" : ""}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <SectionLabel>PERSONAL BESTS</SectionLabel>
      <View style={styles.tileRow}>
        <View style={styles.tile}>
          <FontAwesome name="trophy" size={16} color={COLORS.accent} />
          <Text style={styles.bestValue}>{best ? `${best.count} fish` : "—"}</Text>
          <Text style={styles.tileLabel}>
            {best?.date ? `best day · ${formatTripDate(best.date)}` : "best day"}
          </Text>
        </View>
        <View style={styles.tile}>
          <FontAwesome name="fire" size={16} color={COLORS.accent} />
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
              style={[styles.activityDot, d.active && styles.activityDotActive, d.count > 1 && styles.activityDotBusy]}
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

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 18, paddingBottom: 48 },

  empty: { flex: 1, backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center", gap: 8 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: "#fff", ...fontStyle },
  emptySub: { fontSize: 15, color: COLORS.textMuted, textAlign: "center", paddingHorizontal: 32, ...fontStyle },

  header: { alignItems: "center", paddingTop: 28, paddingBottom: 22 },
  headerEmoji: { fontSize: 40, marginBottom: 6 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#fff", ...fontStyle },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.accent,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 2,
    ...fontStyle,
  },

  tileRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  tile: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  tileValue: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 6, ...fontStyle },
  bestValue: { color: "#fff", fontSize: 16, fontWeight: "700", marginTop: 6, ...fontStyle },
  tileLabel: { color: COLORS.textMuted, fontSize: 12, marginTop: 2, textAlign: "center", ...fontStyle },

  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },

  compareRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  compareValue: { color: "#fff", fontSize: 28, fontWeight: "800", ...fontStyle },
  compareValueSmall: { color: "#fff", fontSize: 20, fontWeight: "800", textAlign: "right", ...fontStyle },
  compareLabel: { color: COLORS.textMuted, fontSize: 12, ...fontStyle },
  compareRight: { alignItems: "flex-end" },
  compareBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.accent,
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  compareBadgeText: { color: "#7a531a", fontSize: 13, fontWeight: "800", ...fontStyle },

  barBlock: { marginBottom: 12 },
  barTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  barName: { color: "#fff", fontSize: 13, ...fontStyle },
  barCount: { color: COLORS.accent, fontSize: 13, fontWeight: "700", ...fontStyle },
  barTrack: { height: 8, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 4 },
  barFill: { height: 8, backgroundColor: COLORS.accent, borderRadius: 4 },

  chartRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 8 },
  chartCol: { flex: 1, alignItems: "center", gap: 5 },
  chartValue: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600", ...fontStyle },
  chartBar: { width: "70%", backgroundColor: COLORS.accent, borderRadius: 4 },
  chartLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11, ...fontStyle },

  spotRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 9 },
  spotDivider: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" },
  spotName: { color: "#fff", fontSize: 14, flex: 1, ...fontStyle },
  spotRank: { color: COLORS.accent, fontWeight: "700" },
  spotCount: { color: COLORS.textMuted, fontSize: 12, ...fontStyle },

  activityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  activityDot: { width: 14, height: 14, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.12)" },
  activityDotActive: { backgroundColor: "rgba(244,177,131,0.75)" },
  activityDotBusy: { backgroundColor: COLORS.accent },
  activityLegend: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  activityLegendText: { color: "rgba(255,255,255,0.45)", fontSize: 11, ...fontStyle },
});
