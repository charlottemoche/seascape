import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { useHasMounted } from '@/hooks/user/useHasMounted';
import { supabase } from '@/lib/supabase';
import { usePathname } from 'expo-router';

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, sessionChecked } = useUser();
  const hasMounted = useHasMounted();

  useEffect(() => {
    if (
      hasMounted &&
      sessionChecked &&
      !user &&
      !pathname.startsWith('/login')
    ) {
      supabase.auth.signOut();
      router.replace('/login');
    }
  }, [user, sessionChecked, hasMounted, pathname, router]);

  return { user, loading };
}