import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useUser } from '@/context/UserContext';
import { listenForIncomingRequests, listIncomingRequests } from '@/lib/friendService';
import * as Notifications from 'expo-notifications';

type Context = {
  hasPending: boolean;
  setPending: (b: boolean) => void;
};

const PendingContext = createContext<Context>({ hasPending: false, setPending: () => { } });

export function PendingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [hasPending, setPending] = useState(false);

  useEffect(() => {
    if (!user) return;

    const stop = listenForIncomingRequests(user.id, async () => {
      const reqs = await listIncomingRequests();
      setPending(reqs.length > 0);
    });

    const receivedSub = Notifications.addNotificationReceivedListener(async (n) => {
      if (n.request.content.data?.type === 'friend_request') {
        setPending(true);
      }
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(async (resp) => {
      if (resp.notification.request.content.data?.type === 'friend_request') {
        setPending(true);
      }
    });

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        listIncomingRequests().then(r => {
          if (r.length === 0) setPending(false);
        });
      }
    });

    listIncomingRequests().then(r => setPending(r.length > 0));

    return () => {
      stop();
      sub.remove();
      receivedSub.remove();
      responseSub.remove();
    };
  }, [user?.id]);

  return (
    <PendingContext.Provider value={{ hasPending, setPending }}>
      {children}
    </PendingContext.Provider>
  );
}

export function usePendingRequests() {
  return useContext(PendingContext).hasPending;
}

export function useSetPendingRequests() {
  return useContext(PendingContext).setPending;
}