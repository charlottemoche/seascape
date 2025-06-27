import { useEffect } from 'react';
import { registerForPushAsync } from '@/lib/pushService';
import { useUser } from '@/context/UserContext';

export function useRegisterPush() {
  const { user, sessionChecked } = useUser();

  useEffect(() => {
    if (!sessionChecked) return;
    if (!user) return;

    registerForPushAsync(user.id).catch(err =>
      console.warn('[push] failed to register:', err)
    );
  }, [sessionChecked, user?.id]);
}