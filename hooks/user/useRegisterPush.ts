import { useEffect } from 'react';
import { registerForPushAsync } from '@/lib/pushService';
import { useSession } from '@/context/SessionContext';

export function useRegisterPush() {
  const { user, sessionChecked } = useSession();

  useEffect(() => {
    if (!sessionChecked) return;
    if (!user) return;

    registerForPushAsync(user.id).catch(err =>
      console.warn('[push] failed to register:', err)
    );
  }, [sessionChecked, user?.id]);
}