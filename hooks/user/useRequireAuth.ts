import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { useHasMounted } from '@/hooks/user/useHasMounted';

export function useRequireAuth() {  
  const router = useRouter();
  const { user, loading } = useUser();
  const hasMounted = useHasMounted();

  useEffect(() => {
    if (hasMounted && !user && !loading) {
      router.replace('/login');
    }
  }, [user, loading, hasMounted, router]);

  return { user, loading };
}