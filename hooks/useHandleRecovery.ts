import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';

export function useHandleRecovery() {
  const [handled, setHandled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url || handled) return;

      try {
        const parsed = new URL(url);

        const fragmentParams = new URLSearchParams(parsed.hash.slice(1));

        const access_token = fragmentParams.get('access_token');
        const refresh_token = fragmentParams.get('refresh_token');
        const type = fragmentParams.get('type');

        if (type === 'recovery' && access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });

          if (error) {
            console.error('setSession failed:', error.message, error);
            Alert.alert('Error', 'Failed to set session: ' + error.message);
          } else {
            setHandled(true);
            router.replace('/password');
          }
        } else if (type === 'recovery') {
          console.warn('Incomplete recovery params', { type, access_token, refresh_token });
        }
      } catch (err) {
        console.error('Error parsing URL:', err);
        Alert.alert('Error', 'Failed to parse recovery URL.');
      }
    };

    Linking.getInitialURL().then(handleUrl);

    const sub = Linking.addEventListener('url', (event: { url: string | null }) => {
      handleUrl(event.url);
    });

    return () => sub.remove();
  }, [handled]);
}