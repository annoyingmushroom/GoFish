import Avatar from "@/components/Avatar";
import FishBadges from "@/components/FishBadges";
import type { Profile } from "@/contexts/ProfileContext";
import { formatTripDate } from "@/lib/date";
import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export type FeedTrip = {
  id: string;
  date: string;
  time: string;
  location: string;
  fishGot: string;
  bait: string;
  notes: string;
  imageUris: string[];
  fishCount: number;
};

function authorName(p: Profile): string {
  if (p.displayName) return p.displayName;
  if (p.username) return `@${p.username}`;
  return "Angler";
}

// A read-only feed card for a friend's trip: author header, catch, photos.
export default function TripCard({
  trip,
  author,
  onOpenPhoto,
}: {
  trip: FeedTrip;
  author: Profile;
  onOpenPhoto: (uri: string) => void;
}) {
  const dateLine = [formatTripDate(trip.date), trip.time].filter(Boolean).join("  ·  ");
  const photos = trip.imageUris ?? [];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar url={author.avatarUrl} name={authorName(author)} size={40} />
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {authorName(author)}
          </Text>
          <Text style={styles.subtle}>{dateLine || "Undated"}</Text>
        </View>
        {trip.fishCount > 0 && (
          <View style={styles.countPill}>
            <FontAwesome name="trophy" size={11} color="#7a531a" />
            <Text style={styles.countText}>{trip.fishCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.locationRow}>
          <FontAwesome name="map-marker" size={15} color="#4478e6" />
          <Text style={styles.location} numberOfLines={1}>
            {trip.location || "Unknown spot"}
          </Text>
        </View>

        <FishBadges fishGot={trip.fishGot} style={styles.fishRow} />

        {trip.bait ? <Text style={styles.detail}>🪱 {trip.bait}</Text> : null}
        {trip.notes ? <Text style={styles.notes}>{trip.notes}</Text> : null}

        {photos.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoRow}
            style={styles.photoSection}
          >
            {photos.map((uri, i) => (
              <Pressable key={i} onPress={() => onOpenPhoto(uri)}>
                <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerText: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  subtle: { fontSize: 12, color: "#888", marginTop: 1 },
  countPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fbe6d4",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  countText: { fontSize: 13, fontWeight: "800", color: "#7a531a" },

  body: { paddingHorizontal: 14, paddingBottom: 14 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  location: { flex: 1, fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  fishRow: { marginTop: 8 },
  detail: { fontSize: 14, color: "#666", marginTop: 6 },
  notes: { fontSize: 14, color: "#555", fontStyle: "italic", marginTop: 8, lineHeight: 20 },

  photoSection: { marginTop: 12 },
  photoRow: { gap: 8 },
  thumb: { width: 120, height: 120, borderRadius: 10, backgroundColor: "#e3e8f0" },
});
