import { loadTrips, saveTrips } from "@/storage/trips";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Trip = {
  id: string;
  time: string;
  date: string;
  location: string;
  fishGot: string;
  imageUri: string | null;
};

const TripsContext = createContext<{
  trips: Trip[];

  addTrip: (
    date: string,
    time: string,
    location: string,
    fishGot: string,
    imageUri: string | null,
  ) => void;

  removeTrip: (id: string) => void;
} | null>(null);

export default function Index() {
  return;
}

export function TripsProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // load trips when app starts
  useEffect(() => {
    (async () => {
      const stored = await loadTrips();
      setTrips(stored);
      setHydrated(true);
    })();
  }, []);

  // save when trips changes (after load finished)
  useEffect(() => {
    if (!hydrated) return;
    saveTrips(trips);
  }, [trips, hydrated]);

  // add trip
  const addTrip = (
    date: string,
    time: string,
    location: string,
    fishGot: string,
    imageUri: string | null,
  ) => {
    setTrips((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        date,
        time,
        location,
        fishGot,
        imageUri,
      },
    ]);
  };

  // remove trip
  const removeTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TripsContext.Provider
      value={{
        trips,
        addTrip,
        removeTrip,
      }}
    >
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error("useTrips must be used inside TripsProvider");
  return ctx;
}
