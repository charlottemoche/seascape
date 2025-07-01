import { supabase } from '@/lib/supabase';

type PageKey = `${number}-${number}`;

export type IncomingRequest = {
  id: string;
  requesterId: string;
  fish_name?: string | null;
  friend_code: string;
  fish_color?: string | null;
};

export type FriendRow = {
  id: string;
  friendId: string;
  fish_name?: string | null;
  friend_code: string;
  fish_color?: string | null;
  high_score?: number | null;
};

type FriendsCacheEntry = {
  rows: FriendRow[];
  hasMore: boolean;
  fetchedAt: number;
};

type FriendsPage = {
  rows: FriendRow[];
  hasMore: boolean;
};

let cachedFriends: FriendRow[] | null = null;
let fetchedAt = 0;
let pageCache: Record<PageKey, FriendsCacheEntry> = {};
const TTL = 5 * 60 * 1_000;

export async function sendFriendRequest(addresseeId: string) {
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const currentUser = data.user;
  if (!currentUser) throw new Error('Not signed in');
  if (addresseeId === currentUser.id) {
    throw new Error("You can't add yourself as a friend.");
  }

  const { count, error: existsError } = await supabase
    .from('friendships')
    .select('*', { count: 'exact', head: true })
    .or(
      `and(requester.eq.${currentUser.id},addressee.eq.${addresseeId}),` +
      `and(requester.eq.${addresseeId},addressee.eq.${currentUser.id})`
    );
  if (existsError) throw existsError;
  if ((count ?? 0) > 0) {
    throw new Error('Friend request sent or already friends.');
  }

  const { error } = await supabase
    .from('friendships')
    .insert({ requester: currentUser.id, addressee: addresseeId });

  if (error) throw error;
}

export async function acceptFriendRequest(requesterId: string) {
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const currentUser = data.user;
  if (!currentUser) throw new Error('Not signed in');

  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('requester', requesterId)
    .eq('addressee', currentUser.id);

  if (error) throw error;
}

export async function listIncomingRequests(): Promise<IncomingRequest[]> {
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const me = authData.user;
  if (!me) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id,
      requester,
      sender:profiles!requester (
        fish_name,
        friend_code,
        fish_color
      )
    `)
    .eq('addressee', me.id)
    .eq('status', 'pending');

  if (error) throw error;

  return (data ?? []).map((row) => {
    const sender = Array.isArray(row.sender) ? row.sender[0] : row.sender;
    return {
      id: row.id,
      requesterId: row.requester,
      fish_name: sender?.fish_name ?? null,
      friend_code: sender?.friend_code ?? '',
      fish_color: sender?.fish_color ?? null,
    };
  });
}

export async function listFriends(
  opts: { page?: number; limit?: number; force?: boolean } = {},
): Promise<FriendsPage> {
  const page = opts.page ?? 0;
  const limit = opts.limit ?? 10;
  const offset = page * limit;
  const key: PageKey = `${offset}-${limit}`;
  const now = Date.now();

  if (!opts.force && pageCache[key] && now - pageCache[key].fetchedAt < TTL) {
    const { rows, hasMore } = pageCache[key];
    return { rows, hasMore };
  }

  if (
    !opts.force &&
    cachedFriends &&
    now - fetchedAt < TTL &&
    cachedFriends.length >= offset + 1
  ) {
    const slice = cachedFriends.slice(offset, offset + limit);
    const hasMore = cachedFriends.length > offset + limit;
    return { rows: slice, hasMore };
  }

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const me = authData.user;
  if (!me) throw new Error('Not signed in');

  const upper = offset + limit;
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id, requester, addressee,
      requester_profile:profiles!requester ( fish_name, friend_code, fish_color, high_score ),
      addressee_profile:profiles!addressee ( fish_name, friend_code, fish_color, high_score )
    `)
    .eq('status', 'accepted')
    .or(`requester.eq.${me.id},addressee.eq.${me.id}`)
    .range(offset, upper);

  if (error) throw error;

  const mapped: FriendRow[] = (data ?? []).map((row: any) => {
    const iAmRequester = row.requester === me.id;
    const profileArr = iAmRequester ? row.addressee_profile : row.requester_profile;
    const profile = Array.isArray(profileArr) ? profileArr[0] : profileArr;
    return {
      id: row.id,
      friendId: iAmRequester ? row.addressee : row.requester,
      fish_name: profile?.fish_name ?? null,
      friend_code: profile?.friend_code ?? '',
      fish_color: profile?.fish_color ?? null,
      high_score: profile?.high_score ?? null,
    };
  });

  const hasMore = mapped.length > limit;
  const rows = hasMore ? mapped.slice(0, limit) : mapped;

  if (page === 0) {
    cachedFriends = rows;
    fetchedAt = now;
  } else if (cachedFriends) {
    cachedFriends = [...cachedFriends, ...rows];
  }

  pageCache[key] = { rows, hasMore, fetchedAt: now };
  return { rows, hasMore };
}

export function clearFriendCache() {
  cachedFriends = null;
  fetchedAt = 0;
  pageCache = {};
}

export function listenForIncomingRequests(userId: string,
  cb: (hasAny: boolean) => void) {

  const channel = supabase
    .channel(`incoming-friends-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'friendships',
        filter: `addressee=eq.${userId},status=eq.pending`,
      },
      () => cb(true),
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}
