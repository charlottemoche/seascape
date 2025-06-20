import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { useHasMounted } from '@/hooks/user/useHasMounted';
import { supabase } from '@/lib/supabase';

export function useRequireAuth() {
  const router = useRouter();
  const { user, loading, sessionChecked } = useUser();
  const hasMounted = useHasMounted();

  useEffect(() => {
    if (hasMounted && sessionChecked && !user) {
      supabase.auth.signOut();
      router.replace('/login');
    }
  }, [user, sessionChecked, hasMounted, router]);

  return { user, loading };
}