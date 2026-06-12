import { useAuth } from "@/contexts/AuthContext";
import { parseTripDate, toISODate } from "@/lib/date";
import { parseFish, serializeFish } from "@/lib/fish";
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
};

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
  return {
    ...trip,
    date: normalizeStoredDate(trip.date),
    location: titleCase(trip.location),
    fishGot: normalizeFish(trip.fishGot),
  };
}

function needsStorageCleanup(before: Trip, after: Trip): boolean {
  return (
    before.date !== after.date ||
    before.location !== after.location ||
    before.fishGot !== after.fishGot
  );
}

// Upload a local URI to Supabase Storage, return the public URL
async function uploadImage(uri: string, userId: string): Promise<string> {
  const filename = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

  let blob: Blob;
  if (uri.startsWith("data:")) {
    const base64 = uri.split(",")[1];
    const bytes = atob(base64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    blob = new Blob([arr], { type: "image/jpeg" });
  } else {
    const res = await fetch(uri);
    blob = await res.blob();
  }

  const { error } = await supabase.storage.from("trip-photos").upload(filename, blob, {
    contentType: "image/jpeg",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("trip-photos").getPublicUrl(filename);
  return data.publicUrl;
}

async function resolveImageUris(uris: string[], userId: string): Promise<string[]> {
  return Promise.all(
    uris.map((uri) =>
      uri.startsWith("https://") ? Promise.resolve(uri) : uploadImage(uri, userId),
    ),
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
    const { data, error } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        date,
        time,
        location: titleCase(location),
        fish_got: normalizeFish(fishGot),
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
    if (fields.fishGot !== undefined) update.fish_got = normalizeFish(fields.fishGot);
    if (fields.bait !== undefined) update.bait = fields.bait;
    if (fields.notes !== undefined) update.notes = fields.notes;
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
