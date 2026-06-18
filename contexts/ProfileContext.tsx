import { useAuth } from "@/contexts/AuthContext";
import { uploadAvatar } from "@/lib/images";
import { notify } from "@/lib/notify";
import { supabase } from "@/lib/supabase";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Profile = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

type ProfileContextType = {
  profile: Profile | null;
  loading: boolean;
  // Saves username / display name / avatar. avatarUri may be a local picker URI,
  // which gets uploaded first. Returns true on success.
  updateProfile: (fields: {
    username?: string;
    displayName?: string;
    avatarUri?: string;
  }) => Promise<boolean>;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

function rowToProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    username: (row.username as string) ?? "",
    displayName: (row.display_name as string) ?? "",
    avatarUrl: (row.avatar_url as string) ?? "",
  };
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) notify("Couldn't load profile", error.message);
        else if (data) setProfile(rowToProfile(data));
        setLoading(false);
      });
  }, [user]);

  const updateProfile = async (fields: {
    username?: string;
    displayName?: string;
    avatarUri?: string;
  }): Promise<boolean> => {
    if (!user) return false;

    const update: Record<string, unknown> = {};
    if (fields.username !== undefined) {
      update.username = fields.username.trim().toLowerCase() || null;
    }
    if (fields.displayName !== undefined) {
      update.display_name = fields.displayName.trim();
    }
    if (fields.avatarUri !== undefined) {
      try {
        update.avatar_url = await uploadAvatar(fields.avatarUri, user.id);
      } catch (e) {
        notify("Avatar upload failed", e instanceof Error ? e.message : String(e));
        return false;
      }
    }

    // upsert so a missing profile row (e.g. trigger never ran) is created.
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...update })
      .select()
      .single();

    if (error) {
      const msg = error.code === "23505"
        ? "That username is already taken."
        : error.message;
      notify("Couldn't save profile", msg);
      return false;
    }
    if (data) setProfile(rowToProfile(data));
    return true;
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
