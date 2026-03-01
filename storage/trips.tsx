import AsyncStorage from "@react-native-async-storage/async-storage";

const TRIPS_KEY = "gofish:trips";

export type Trip = {
  id: string; 
  time: string; 
  date: string; 
  location: string; 
  fishGot: string;
  imageUri: string | null;
}

// save trips function
export async function saveTrips(trips: Trip[]) {
  try {
    await AsyncStorage.setItem(
      TRIPS_KEY,
      JSON.stringify(trips)
    );
  } catch (error) {
    console.error('Error saving trips:', error);
  }
}

// load trips
export async function loadTrips(): Promise<Trip[]> {
  try {
    const raw = await AsyncStorage.getItem(TRIPS_KEY);

    // if nth exists, return empty array
    if (!raw) { return []; }

    return JSON.parse(raw);
  } catch (error) {
    console.error('Error loading trips:', error);
    return [];
  }
}

