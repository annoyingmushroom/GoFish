import { useAuth } from "@/contexts/AuthContext";
import type { Profile } from "@/contexts/ProfileContext";
import { notify } from "@/lib/notify";
import { supabase } from "@/lib/supabase";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// A pending request pairs the friendship row id (needed to accept/decline)
// with the other person's profile.
export type PendingRequest = { friendshipId: string; profile: Profile };
export type Friend = { friendshipId: string; profile: Profile };

type FriendsContextType = {
  friends: Friend[];
  incoming: PendingRequest[]; // requests sent TO me, awaiting my response
  outgoing: PendingRequest[]; // requests I sent, awaiting theirs
  loading: boolean;
  refresh: () => Promise<void>;
  searchUsers: (query: string) => Promise<Profile[]>;
  sendRequest: (userId: string) => Promise<void>;
  acceptRequest: (friendshipId: string) => Promise<void>;
  removeFriendship: (friendshipId: string) => Promise<void>; // decline / cancel / unfriend
};

const FriendsContext = createContext<FriendsContextType | null>(null);

type FriendshipRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
};

function rowToProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    username: (row.username as string) ?? "",
    displayName: (row.display_name as string) ?? "",
    avatarUrl: (row.avatar_url as string) ?? "",
  };
}

export function FriendsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<PendingRequest[]>([]);
  const [outgoing, setOutgoing] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setFriends([]);
      setIncoming([]);
      setOutgoing([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    // RLS already limits this to rows I'm part of, but be explicit.
    const { data: rows, error } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (error) {
      notify("Couldn't load friends", error.message);
      setLoading(false);
      return;
    }

    const friendships = (rows ?? []) as FriendshipRow[];
    // The "other" user for each relationship — that's whose profile we display.
    const otherId = (f: FriendshipRow) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id;

    const ids = friendships.map(otherId);
    const profileById = new Map<string, Profile>();
    if (ids.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", ids);
      for (const p of profiles ?? []) profileById.set(p.id as string, rowToProfile(p));
    }

    const fallbackProfile = (id: string): Profile =>
      profileById.get(id) ?? { id, username: "", displayName: "", avatarUrl: "" };

    const nextFriends: Friend[] = [];
    const nextIncoming: PendingRequest[] = [];
    const nextOutgoing: PendingRequest[] = [];
    for (const f of friendships) {
      const entry = { friendshipId: f.id, profile: fallbackProfile(otherId(f)) };
      if (f.status === "accepted") nextFriends.push(entry);
      else if (f.addressee_id === user.id) nextIncoming.push(entry);
      else nextOutgoing.push(entry);
    }

    setFriends(nextFriends);
    setIncoming(nextIncoming);
    setOutgoing(nextOutgoing);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const searchUsers = useCallback(
    async (query: string): Promise<Profile[]> => {
      const q = query.trim().toLowerCase();
      if (!q || !user) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${q}%`)
        .neq("id", user.id)
        .limit(20);
      if (error) {
        notify("Search failed", error.message);
        return [];
      }
      return (data ?? []).map(rowToProfile);
    },
    [user],
  );

  const sendRequest = useCallback(
    async (userId: string) => {
      if (!user) return;
      const { error } = await supabase
        .from("friendships")
        .insert({ requester_id: user.id, addressee_id: userId, status: "pending" });
      if (error) {
        const msg =
          error.code === "23505"
            ? "You already have a request or friendship with this person."
            : error.message;
        notify("Couldn't send request", msg);
        return;
      }
      await refresh();
    },
    [user, refresh],
  );

  const acceptRequest = useCallback(
    async (friendshipId: string) => {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId);
      if (error) {
        notify("Couldn't accept request", error.message);
        return;
      }
      await refresh();
    },
    [refresh],
  );

  const removeFriendship = useCallback(
    async (friendshipId: string) => {
      const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
      if (error) {
        notify("Something went wrong", error.message);
        return;
      }
      await refresh();
    },
    [refresh],
  );

  return (
    <FriendsContext.Provider
      value={{
        friends,
        incoming,
        outgoing,
        loading,
        refresh,
        searchUsers,
        sendRequest,
        acceptRequest,
        removeFriendship,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error("useFriends must be used inside FriendsProvider");
  return ctx;
}
