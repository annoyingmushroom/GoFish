import FishBadges from "@/components/FishBadges";
import { useTrips } from "@/contexts/TripsContext";
import { formatTripDate, monthLabel, tripDateSortKey } from "@/lib/date";
import { confirm } from "@/lib/notify";
import { fontStyle } from "@/lib/theme";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// A single row of square thumbnails that scrolls left-to-right; tap to fullscreen.
function PhotoRow({ uris, onOpen }: { uris: string[]; onOpen: (uri: string) => void }) {
  if (uris.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.photoRowContent}
    >
      {uris.map((uri, i) => (
        <Pressable key={i} onPress={(e) => { e.stopPropagation(); onOpen(uri); }}>
          <Image source={{ uri }} style={styles.gridThumb} resizeMode="cover" />
        </Pressable>
      ))}
    </ScrollView>
  );
}

export default function TripsScreen() {
  const { trips, removeTrip } = useTrips();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  const confirmDelete = async (id: string) => {
    const ok = await confirm("Delete Trip", "Are you sure?", "Delete", true);
    if (ok) removeTrip(id);
  };

  // Newest trip-date first; same-date trips fall back to creation order.
  const sorted = [...trips].sort((a, b) => {
    const diff = tripDateSortKey(b.date) - tripDateSortKey(a.date);
    return diff !== 0 ? diff : Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });

  if (sorted.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🐟</Text>
        <Text style={styles.emptyTitle}>No trips yet</Text>
        <Text style={styles.emptySub}>Head to New Trip and log your first catch!</Text>
      </View>
    );
  }

  let lastMonth = "";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {sorted.map((trip) => {
          const dateLine = [formatTripDate(trip.date), trip.time].filter(Boolean).join("  ·  ");
          const photos = trip.imageUris ?? [];
          const month = monthLabel(trip.date);
          const showHeader = month !== lastMonth;
          lastMonth = month;

          return (
            <View key={trip.id}>
              {showHeader && <Text style={styles.monthHeader}>{month}</Text>}

              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => router.push({ pathname: "/(tabs)/trips/[id]", params: { id: trip.id } })}
              >
                <View style={styles.tanStrip}>
                  <FontAwesome name="calendar" size={13} color="#7a531a" />
                  <Text style={styles.tanStripText}>{dateLine || "Undated"}</Text>
                </View>

                <Pressable style={styles.deleteBtn} onPress={() => confirmDelete(trip.id)} hitSlop={10}>
                  <FontAwesome name="trash" size={14} color="#fff" />
                </Pressable>

                <View style={styles.content}>
                  <View style={styles.locationRow}>
                    <FontAwesome name="map-marker" size={16} color="#4478e6" />
                    <Text style={styles.location} numberOfLines={1}>
                      {trip.location || "Unknown spot"}
                    </Text>
                    <FontAwesome name="chevron-right" size={12} color="#ccc" />
                  </View>

                  <FishBadges fishGot={trip.fishGot} style={styles.fishRow} />

                  {trip.bait ? <Text style={styles.detail}>🪱 {trip.bait}</Text> : null}
                  {trip.notes ? <Text style={styles.notes}>{trip.notes}</Text> : null}

                  {photos.length > 0 && (
                    <View style={styles.photoSection}>
                      <PhotoRow uris={photos} onOpen={setSelectedImage} />
                    </View>
                  )}
                </View>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={selectedImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <Pressable style={styles.modalBg} onPress={() => setSelectedImage(null)}>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullImg} resizeMode="contain" />
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const GRID_THUMB = 96;
const GRID_GAP = 8;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#4478e6" },
  scroll: { padding: 16, paddingBottom: 32 },

  empty: { flex: 1, backgroundColor: "#4478e6", justifyContent: "center", alignItems: "center", gap: 8 },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: "#fff", ...fontStyle },
  emptySub: { fontSize: 15, color: "rgba(255,255,255,0.55)", textAlign: "center", paddingHorizontal: 40, ...fontStyle },

  monthHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 0.4,
    marginBottom: 10,
    marginTop: 6,
    marginLeft: 2,
    ...fontStyle,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  cardPressed: { opacity: 0.92 },

  tanStrip: { flexDirection: "row", alignItems: "center", gap: 6, height: 38, paddingHorizontal: 16, backgroundColor: "#f4b183" },
  tanStripText: { color: "#7a531a", fontSize: 12, fontWeight: "600", ...fontStyle },

  deleteBtn: {
    position: "absolute",
    top: 6,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  location: { flex: 1, fontSize: 17, fontWeight: "700", color: "#1a1a1a", ...fontStyle },
  fishRow: { marginTop: 8 },
  detail: { fontSize: 14, color: "#666", marginTop: 6, ...fontStyle },
  notes: { fontSize: 14, color: "#555", fontStyle: "italic", marginTop: 8, lineHeight: 20, ...fontStyle },

  photoSection: { marginTop: 12 },
  photoRowContent: { gap: GRID_GAP },
  gridThumb: { width: GRID_THUMB, height: GRID_THUMB, borderRadius: 10, backgroundColor: "#e3e8f0" },

  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
  fullImg: { width: "100%", height: "80%" },
});
