import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

export type NudgeType = 'hug' | 'breathe';

export async function sendNudge(friendId: string, type: NudgeType) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.rpc('send_notification', {
    _receiver: friendId,
    _sender: user.id,
    _type: type,
  });

  if (error) {
    console.warn('[notif] rpc failed:', error);
    Alert.alert('Error', 'Failed to send nudge.');
  } else {
    const verb = type === 'hug' ? 'starfish hug' : 'breathe reminder';
    Alert.alert('Success', `Your ${verb} was sent.`);
  }
}