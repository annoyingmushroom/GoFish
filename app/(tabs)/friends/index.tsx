import Avatar from "@/components/Avatar";
import { useFriends } from "@/contexts/FriendsContext";
import type { Profile } from "@/contexts/ProfileContext";
import { COLORS, fontStyle } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// Best label for a profile: display name, else @username, else a placeholder.
export function profileName(p: Profile): string {
  if (p.displayName) return p.displayName;
  if (p.username) return `@${p.username}`;
  return "Angler";
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function Row({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <Avatar url={profile.avatarUrl} name={profileName(profile)} size={42} />
      <View style={styles.rowText}>
        <Text style={styles.rowName} numberOfLines={1}>
          {profileName(profile)}
        </Text>
        {!!profile.username && <Text style={styles.rowSub}>@{profile.username}</Text>}
      </View>
      {children}
    </View>
  );
}

export default function FriendsScreen() {
  const {
    friends,
    incoming,
    outgoing,
    loading,
    refresh,
    searchUsers,
    sendRequest,
    acceptRequest,
    removeFriendship,
  } = useFriends();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Debounced search-as-you-type.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      setResults(await searchUsers(q));
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query, searchUsers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Ids already connected, so search results show the right action.
  const friendIds = new Set(friends.map((f) => f.profile.id));
  const outgoingIds = new Set(outgoing.map((f) => f.profile.id));
  const incomingIds = new Set(incoming.map((f) => f.profile.id));

  const renderSearchAction = (p: Profile) => {
    if (friendIds.has(p.id)) return <Text style={styles.statusText}>Friends</Text>;
    if (outgoingIds.has(p.id)) return <Text style={styles.statusText}>Requested</Text>;
    if (incomingIds.has(p.id)) return <Text style={styles.statusText}>Wants to add you</Text>;
    return (
      <Pressable style={styles.addBtn} onPress={() => sendRequest(p.id)}>
        <Ionicons name="person-add" size={15} color="#7a531a" />
        <Text style={styles.addBtnText}>Add</Text>
      </Pressable>
    );
  };

  return (
    <ScrollView
      style={styles.bg}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
      }
    >
      <View style={styles.searchWell}>
        <Ionicons name="search" size={18} color={COLORS.accent} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Find friends by username"
          placeholderTextColor={COLORS.placeholder}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          selectionColor={COLORS.accent}
        />
        {searching && <ActivityIndicator color={COLORS.accent} />}
      </View>

      {query.trim().length > 0 && (
        <>
          <SectionLabel>SEARCH RESULTS</SectionLabel>
          <View style={styles.card}>
            {results.length === 0 && !searching ? (
              <Text style={styles.emptyInline}>No users found.</Text>
            ) : (
              results.map((p) => (
                <Row key={p.id} profile={p}>
                  {renderSearchAction(p)}
                </Row>
              ))
            )}
          </View>
        </>
      )}

      {incoming.length > 0 && (
        <>
          <SectionLabel>FRIEND REQUESTS</SectionLabel>
          <View style={styles.card}>
            {incoming.map((r) => (
              <Row key={r.friendshipId} profile={r.profile}>
                <View style={styles.reqActions}>
                  <Pressable style={styles.addBtn} onPress={() => acceptRequest(r.friendshipId)}>
                    <Text style={styles.addBtnText}>Accept</Text>
                  </Pressable>
                  <Pressable
                    style={styles.iconBtn}
                    onPress={() => removeFriendship(r.friendshipId)}
                  >
                    <Ionicons name="close" size={18} color={COLORS.textMuted} />
                  </Pressable>
                </View>
              </Row>
            ))}
          </View>
        </>
      )}

      <SectionLabel>{`FRIENDS${friends.length ? ` · ${friends.length}` : ""}`}</SectionLabel>
      <View style={styles.card}>
        {loading ? (
          <ActivityIndicator color={COLORS.accent} style={{ paddingVertical: 12 }} />
        ) : friends.length === 0 ? (
          <Text style={styles.emptyInline}>
            No friends yet. Search by username above to add some.
          </Text>
        ) : (
          friends.map((f) => (
            <Row key={f.friendshipId} profile={f.profile}>
              <Pressable style={styles.iconBtn} onPress={() => removeFriendship(f.friendshipId)}>
                <Ionicons name="person-remove-outline" size={18} color={COLORS.textMuted} />
              </Pressable>
            </Row>
          ))
        )}
      </View>

      {outgoing.length > 0 && (
        <>
          <SectionLabel>PENDING (SENT)</SectionLabel>
          <View style={styles.card}>
            {outgoing.map((r) => (
              <Row key={r.friendshipId} profile={r.profile}>
                <Pressable style={styles.iconBtn} onPress={() => removeFriendship(r.friendshipId)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </Row>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 48 },

  searchWell: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputWell,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#fff", paddingVertical: 0, ...fontStyle },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.accent,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 2,
    ...fontStyle,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 20,
  },
  emptyInline: { color: COLORS.textMuted, fontSize: 14, paddingVertical: 12, ...fontStyle },

  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 12 },
  rowText: { flex: 1 },
  rowName: { color: "#fff", fontSize: 15, fontWeight: "600", ...fontStyle },
  rowSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 1, ...fontStyle },

  statusText: { color: COLORS.textMuted, fontSize: 13, ...fontStyle },
  reqActions: { flexDirection: "row", alignItems: "center", gap: 4 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.accent,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { color: "#7a531a", fontSize: 13, fontWeight: "800", ...fontStyle },
  iconBtn: { padding: 8 },
  cancelText: { color: COLORS.textMuted, fontSize: 13, ...fontStyle },
});
