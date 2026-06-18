import { useAuth } from "@/contexts/AuthContext";
import { parseTripDate, toISODate } from "@/lib/date";
import { parseFish, serializeFish } from "@/lib/fish";
import { resolveImageUris } from "@/lib/images";
import { notify } from "@/lib/notify";
import { supabase } from "@/lib/supabase";
import { titleCase } from "@/lib/text";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Trip = {
  id: string;
  date: string;
  time: string;
  location: string;
  fishGot: string;
  bait: string;
  notes: string;
  imageUris: string[];
  createdAt: string;
  visibility: string; // 'friends' (in feed/leaderboard) | 'private'
  fishCount: number; // denormalized total, kept in sync with fishGot
};

// Total fish in a "kingfish x1, tilapia x2" string. Kept local (not imported
// from lib/stats) to avoid a circular import; lib/stats imports the Trip type.
function countFish(fishGot: string): number {
  return parseFish(fishGot).reduce((sum, f) => sum + f.count, 0);
}

type TripsContextType = {
  trips: Trip[];
  loading: boolean;
  addTrip: (
    date: string,
    time: string,
    location: string,
    fishGot: string,
    bait: string,
    notes: string,
    imageUris: string[],
  ) => Promise<void>;
  updateTrip: (id: string, fields: Partial<Omit<Trip, "id">>) => Promise<void>;
  removeTrip: (id: string) => Promise<void>;
};

const TripsContext = createContext<TripsContextType | null>(null);

// Title-case each fish species in a stored "kingfish x1, tilapia x2" string.
function normalizeFish(fishGot: string): string {
  return serializeFish(
    parseFish(fishGot).map((e) => ({ ...e, species: titleCase(e.species) })),
  );
}

function normalizeStoredDate(date: string): string {
  const parsed = parseTripDate(date);
  return parsed ? toISODate(parsed) : "";
}

function normalizeTripForStorage(trip: Trip): Trip {
  const fishGot = normalizeFish(trip.fishGot);
  return {
    ...trip,
    date: normalizeStoredDate(trip.date),
    location: titleCase(trip.location),
    fishGot,
    fishCount: countFish(fishGot),
  };
}

function needsStorageCleanup(before: Trip, after: Trip): boolean {
  return (
    before.date !== after.date ||
    before.location !== after.location ||
    before.fishGot !== after.fishGot ||
    before.fishCount !== after.fishCount
  );
}

function rowToTrip(row: Record<string, unknown>): Trip {
  return {
    id: row.id as string,
    date: (row.date as string) ?? "",
    time: (row.time as string) ?? "",
    location: (row.location as string) ?? "",
    fishGot: (row.fish_got as string) ?? "",
    bait: (row.bait as string) ?? "",
    notes: (row.notes as string) ?? "",
    imageUris: (row.image_urls as string[]) ?? [],
    createdAt: (row.created_at as string) ?? "",
    visibility: (row.visibility as string) ?? "friends",
    fishCount: (row.fish_count as number) ?? 0,
  };
}

export function TripsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("trips")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) notify("Couldn't load trips", error.message);
        else if (data) {
          const loaded = data.map(rowToTrip);
          const normalized = loaded.map(normalizeTripForStorage);
          setTrips(normalized);
          void Promise.all(
            loaded.map((trip, index) => {
              const clean = normalized[index];
              if (!needsStorageCleanup(trip, clean)) return Promise.resolve();
              return supabase
                .from("trips")
                .update({
                  date: clean.date,
                  location: clean.location,
                  fish_got: clean.fishGot,
                  fish_count: clean.fishCount,
                })
                .eq("id", clean.id);
            }),
          );
        }
        setLoading(false);
      });
  }, [user]);

  const addTrip = async (
    date: string,
    time: string,
    location: string,
    fishGot: string,
    bait: string,
    notes: string,
    imageUris: string[],
  ) => {
    if (!user) return;
    let uploadedUrls: string[];
    try {
      uploadedUrls = await resolveImageUris(imageUris, user.id);
    } catch (e) {
      notify("Photo upload failed", e instanceof Error ? e.message : String(e));
      throw e;
    }
    const cleanFish = normalizeFish(fishGot);
    const { data, error } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        date,
        time,
        location: titleCase(location),
        fish_got: cleanFish,
        fish_count: countFish(cleanFish),
        bait,
        notes,
        image_urls: uploadedUrls,
      })
      .select()
      .single();
    if (error) {
      notify("Couldn't save trip", error.message);
      throw error;
    }
    if (data) setTrips((prev) => [rowToTrip(data), ...prev]);
  };

  const updateTrip = async (id: string, fields: Partial<Omit<Trip, "id">>) => {
    if (!user) return;
    const imageUris = fields.imageUris
      ? await resolveImageUris(fields.imageUris, user.id)
      : undefined;
    const update: Record<string, unknown> = {};
    if (fields.date !== undefined) update.date = fields.date;
    if (fields.time !== undefined) update.time = fields.time;
    if (fields.location !== undefined) update.location = titleCase(fields.location);
    if (fields.fishGot !== undefined) {
      const cleanFish = normalizeFish(fields.fishGot);
      update.fish_got = cleanFish;
      update.fish_count = countFish(cleanFish);
    }
    if (fields.bait !== undefined) update.bait = fields.bait;
    if (fields.notes !== undefined) update.notes = fields.notes;
    if (fields.visibility !== undefined) update.visibility = fields.visibility;
    if (imageUris !== undefined) update.image_urls = imageUris;

    const { data, error } = await supabase
      .from("trips")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      notify("Couldn't update trip", error.message);
      throw error;
    }
    if (data) setTrips((prev) => prev.map((t) => (t.id === id ? rowToTrip(data) : t)));
  };

  const removeTrip = async (id: string) => {
    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (error) {
      notify("Couldn't delete trip", error.message);
      return;
    }
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TripsContext.Provider value={{ trips, loading, addTrip, updateTrip, removeTrip }}>
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error("useTrips must be used inside TripsProvider");
  return ctx;
}
