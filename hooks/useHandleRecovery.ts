import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';

export function useHandleRecovery() {
  const handledRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url || handledRef.current) return;

      try {
        const parsed = new URL(url);
        const fragment = new URLSearchParams(parsed.hash.slice(1));
        const access_token = fragment.get('access_token');
        const refresh_token = fragment.get('refresh_token');
        const type = fragment.get('type');

        if (type === 'recovery' && access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });

          if (error) {
            console.error('setSession failed:', error);
            Alert.alert('Error', 'Failed to set session: ' + error.message);
          } else {
            handledRef.current = true;
            router.replace('/password');
          }
        }
      } catch (err) {
        console.error('Error parsing URL:', err);
        Alert.alert('Error', 'Failed to process recovery link.');
      }
    };

    Linking.getInitialURL().then(handleUrl);

    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));

    return () => sub.remove();
  }, [router]);
}
