import { supabase } from '@/lib/supabase';

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

let cachedFriends: FriendRow[] | null = null;
let fetchedAt = 0;
const TTL = 5 * 60 * 1000;

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
      `and(requester.eq.${currentUser.id},addressee.eq.${addresseeId}),and(requester.eq.${addresseeId},addressee.eq.${currentUser.id})`
    );

  if (existsError) throw existsError;
  if ((count ?? 0) > 0) {
    throw new Error('Friend request sent or already friends.');
  }

  const { error } = await supabase
    .from('friendships')
    .insert({ addressee: addresseeId, requester: currentUser.id });

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

export async function listFriends(opts: { force?: boolean } = {}): Promise<FriendRow[]> {
  const now = Date.now();

  if (!opts.force && cachedFriends && now - fetchedAt < TTL) {
    return cachedFriends;
  }

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const me = authData.user;
  if (!me) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id, requester, addressee,
      requester_profile:profiles!requester ( fish_name, friend_code, fish_color, high_score ),
      addressee_profile:profiles!addressee ( fish_name, friend_code, fish_color, high_score )
    `)
    .eq('status', 'accepted')
    .or(`requester.eq.${me.id},addressee.eq.${me.id}`);

  if (error) throw error;

  const friends: FriendRow[] = (data ?? []).map((row: any) => {
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

  cachedFriends = friends;
  fetchedAt = now;
  return friends;
}