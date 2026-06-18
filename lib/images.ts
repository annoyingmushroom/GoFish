import { supabase } from "@/lib/supabase";

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

// Uploads any local URIs to Supabase Storage; passes already-hosted https:// URLs through.
export async function resolveImageUris(uris: string[], userId: string): Promise<string[]> {
  return Promise.all(
    uris.map((uri) =>
      uri.startsWith("https://") ? Promise.resolve(uri) : uploadImage(uri, userId),
    ),
  );
}
