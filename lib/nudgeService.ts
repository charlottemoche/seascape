import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

export type NudgeType = 'hug' | 'breathe';

export async function sendNudge(receiverId: string, type: NudgeType) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.rpc('send_notification', {
    _receiver: receiverId,
    _sender: user.id,
    _type: type,
  });

  if (error) {
    console.warn('[notif] rpc failed:', error);
    Alert.alert('Error', 'Failed to send nudge.');
  } else {
    const verb = type === 'hug' ? 'starfish hug' : 'breathe reminder';
    Alert.alert('Sent!', `Your ${verb} was sent.`);
  }
}