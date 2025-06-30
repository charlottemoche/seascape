import { useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useSession } from '@/context/SessionContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { useAuthReady } from '@/hooks/user/useAuthReady';

export function useAuthRedirect() {
  const { user, profile } = useSession();
  const { done } = useOnboarding();
  const ready = useAuthReady();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('[useAuthRedirect]', {
      ready,
      pathname,
      user: user?.id || null,
      done,
      profileFlag: profile?.onboarding_completed,
    });

    if (!ready || done === null) return;

    if (!user) {
      const onAuthPage =
        pathname.startsWith('/login') ||
        pathname.startsWith('/reset') ||
        pathname.startsWith('/password') ||
        pathname.startsWith('/verify');

      if (onAuthPage) return;

      if (!done && !pathname.startsWith('/welcome')) {
        router.replace('/welcome');
        return;
      }

      if (done && pathname.startsWith('/welcome')) {
        router.replace('/');
        return;
      }

      return;
    }

    if (profile?.onboarding_completed === false && !pathname.startsWith('/welcome')) {
      router.replace('/welcome');
    }
  }, [ready, user, done, profile?.onboarding_completed, pathname, router]);
}