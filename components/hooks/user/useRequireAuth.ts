import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUser } from '@/context/UserContext';

export function useRequireAuth() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!user && !loading) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  return { user, loading };
}