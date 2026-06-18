import TripCard, { type FeedTrip } from "@/components/TripCard";
import { useAuth } from "@/contexts/AuthContext";
import type { Profile } from "@/contexts/ProfileContext";
import { notify } from "@/lib/notify";
import { supabase } from "@/lib/supabase";
import { fontStyle } from "@/lib/theme";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Most recent shared trips to load. RLS limits these to accepted friends'
// trips already, so no per-friend filtering is needed. A flat cap keeps the
// feed cheap without pagination machinery (see Phase 4 discussion).
const FEED_LIMIT = 50;

type FeedItem = { trip: FeedTrip; author: Profile };

function rowToFeedTrip(row: Record<string, unknown>): FeedTrip {
  return {
    id: row.id as string,
    date: (row.date as string) ?? "",
    time: (row.time as string) ?? "",
    location: (row.location as string) ?? "",
    fishGot: (row.fish_got as string) ?? "",
    bait: (row.bait as string) ?? "",
    notes: (row.notes as string) ?? "",
    imageUris: (row.image_urls as string[]) ?? [],
    fishCount: (row.fish_count as number) ?? 0,
  };
}

function rowToProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    username: (row.username as string) ?? "",
    displayName: (row.display_name as string) ?? "",
    avatarUrl: (row.avatar_url as string) ?? "",
  };
}

export default function FeedScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;

    // 1) Friends' shared trips (RLS scopes this to accepted friends). Exclude
    //    my own posts — those live in the My Trips tab.
    const { data: tripRows, error } = await supabase
      .from("trips")
      .select("*")
      .eq("visibility", "friends")
      .neq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(FEED_LIMIT);

    if (error) {
      notify("Couldn't load feed", error.message);
      return;
    }

    const rows = tripRows ?? [];

    // 2) Fetch the authors' profiles in one query (trips.user_id references
    //    auth.users, not profiles, so PostgREST can't auto-embed them).
    const authorIds = [...new Set(rows.map((r) => r.user_id as string))];
    const profileById = new Map<string, Profile>();
    if (authorIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", authorIds);
      for (const p of profiles ?? []) profileById.set(p.id as string, rowToProfile(p));
    }

    const fallback = (id: string): Profile => ({
      id,
      username: "",
      displayName: "",
      avatarUrl: "",
    });

    setItems(
      rows.map((r) => ({
        trip: rowToFeedTrip(r),
        author: profileById.get(r.user_id as string) ?? fallback(r.user_id as string),
      })),
    );
  }, [user]);

  // Reload whenever the tab regains focus so newly-added friends/trips appear.
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
        <ActivityIndicator color="#f4b183" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.trip.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TripCard trip={item.trip} author={item.author} onOpenPhoto={setPhoto} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f4b183" />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎣</Text>
            <Text style={styles.emptyTitle}>Your feed is quiet</Text>
            <Text style={styles.emptySub}>
              Add friends and their shared trips will show up here.
            </Text>
          </View>
        }
      />

      <Modal
        visible={photo !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPhoto(null)}
      >
        <Pressable style={styles.modalBg} onPress={() => setPhoto(null)}>
          {photo && <Image source={{ uri: photo }} style={styles.fullImg} resizeMode="contain" />}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#4478e6" },
  center: { flex: 1, backgroundColor: "#4478e6", justifyContent: "center", alignItems: "center" },
  list: { padding: 16, paddingBottom: 32, flexGrow: 1 },

  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8, paddingTop: 80 },
  emptyEmoji: { fontSize: 60 },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: "#fff", ...fontStyle },
  emptySub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    paddingHorizontal: 40,
    ...fontStyle,
  },

  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
  fullImg: { width: "100%", height: "80%" },
});
