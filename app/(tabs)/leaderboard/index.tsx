import Avatar from "@/components/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { notify } from "@/lib/notify";
import { supabase } from "@/lib/supabase";
import { COLORS, fontStyle } from "@/lib/theme";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Entry = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  fishCount: number;
  tripCount: number;
};

function entryName(e: Entry): string {
  if (e.displayName) return e.displayName;
  if (e.username) return `@${e.username}`;
  return "Angler";
}

// Gold / silver / bronze for the top three, otherwise the plain rank number.
function rankBadge(rank: number): string {
  return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}`;
}

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_leaderboard");
    if (error) {
      notify("Couldn't load leaderboard", error.message);
      return;
    }
    setEntries(
      (data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        username: (r.username as string) ?? "",
        displayName: (r.display_name as string) ?? "",
        avatarUrl: (r.avatar_url as string) ?? "",
        fishCount: Number(r.fish_count ?? 0),
        tripCount: Number(r.trip_count ?? 0),
      })),
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.bg}
      data={entries}
      keyExtractor={(e) => e.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
      }
      renderItem={({ item, index }) => {
        const isMe = item.id === user?.id;
        return (
          <View style={[styles.row, isMe && styles.rowMe]}>
            <Text style={styles.rank}>{rankBadge(index + 1)}</Text>
            <Avatar url={item.avatarUrl} name={entryName(item)} size={40} />
            <View style={styles.rowText}>
              <Text style={styles.name} numberOfLines={1}>
                {entryName(item)}
                {isMe ? " (you)" : ""}
              </Text>
              <Text style={styles.sub}>
                {item.tripCount} trip{item.tripCount !== 1 ? "s" : ""}
              </Text>
            </View>
            <View style={styles.fishWrap}>
              <Text style={styles.fishCount}>{item.fishCount}</Text>
              <Text style={styles.fishLabel}>fish</Text>
            </View>
          </View>
        );
      }}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🏆</Text>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={styles.headerSub}>You and your friends, by total fish caught</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🏆</Text>
          <Text style={styles.emptyTitle}>Nothing to rank yet</Text>
          <Text style={styles.emptySub}>
            Add friends and log some catches to climb the board.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" },
  list: { paddingHorizontal: 18, paddingBottom: 40, flexGrow: 1 },

  header: { alignItems: "center", paddingTop: 24, paddingBottom: 20 },
  headerEmoji: { fontSize: 40, marginBottom: 6 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#fff", ...fontStyle },
  headerSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, textAlign: "center", ...fontStyle },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  rowMe: { borderColor: COLORS.accent, backgroundColor: "rgba(244,177,131,0.16)" },
  rank: { width: 28, textAlign: "center", fontSize: 16, fontWeight: "800", color: "#fff", ...fontStyle },
  rowText: { flex: 1 },
  name: { color: "#fff", fontSize: 15, fontWeight: "700", ...fontStyle },
  sub: { color: COLORS.textMuted, fontSize: 12, marginTop: 1, ...fontStyle },
  fishWrap: { alignItems: "flex-end" },
  fishCount: { color: COLORS.accent, fontSize: 20, fontWeight: "800", ...fontStyle },
  fishLabel: { color: COLORS.textMuted, fontSize: 11, ...fontStyle },

  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8, paddingTop: 60 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: "#fff", ...fontStyle },
  emptySub: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: 40,
    ...fontStyle,
  },
});
