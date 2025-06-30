import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { useSetPendingRequests } from '@/context/PendingContext';
import { useNudge } from '@/context/NudgeContext';

export function useNotificationNavigation() {
  const router = useRouter();
  const setPending = useSetPendingRequests();
  const { setNudge } = useNudge();

  useEffect(() => {
    const handle = (data: any) => {
      if (!data) return;

      switch (data.type) {
        case 'friend_request':
          setPending(true);
          router.push({ pathname: '/profile', params: { tab: 'requests' } });
          break;

        case 'hug':
        case 'breathe':
          setNudge({
            sender: data.sender_name?.trim() || 'Someone',
            senderId: data.sender_id,
            type: data.type,
          });
          break;

        default:
          // silently ignore other notification types
      }
    };

    (async () => {
      const initial = await Notifications.getLastNotificationResponseAsync();
      handle(initial?.notification.request.content.data);
    })();

    const sub = Notifications.addNotificationResponseReceivedListener(
      resp => handle(resp.notification.request.content.data)
    );

    return () => sub.remove();
  }, [router, setPending, setNudge]);
}