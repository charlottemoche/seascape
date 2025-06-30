import { useSession } from '@/context/SessionContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { useHasMounted } from '@/hooks/user/useHasMounted';

export function useAuthReady() {
  const { user, loading, sessionChecked } = useSession();
  const { done } = useOnboarding();
  const hasMounted = useHasMounted();

  return (
    hasMounted &&
    !loading &&
    done !== null &&
    user ? sessionChecked : true
  );
}