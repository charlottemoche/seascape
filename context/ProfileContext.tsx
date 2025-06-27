import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserContext';
import { useSyncAndRefresh } from '@/hooks/useHighScore';

type ProfileType = {
  fish_color?: string;
  fish_name?: string;
  onboarding_completed?: boolean;
  has_played?: boolean;
  high_score?: number;
  total_minutes?: number;
  admin?: boolean;
  friend_code?: string;
};

type ProfileContextType = {
  profile: ProfileType | null;
  setProfile: (profile: ProfileType | null) => void;
  refreshProfile: (options?: { silent?: boolean }) => Promise<void>;
  loading: boolean;
  error: string | null;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfileType | null>(null);

  const refreshProfile = useCallback(async ({ silent = false } = {}) => {
    if (!user?.id) {
      if (!silent) setLoading(false);
      return;
    }

    if (!silent) setLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('fish_color, fish_name, onboarding_completed, high_score, total_minutes, admin, has_played, friend_code')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        setError(error.message);
      }

      setProfile(data ?? null);
    } catch (err) {
      console.error('Supabase unreachable:', err);
      setError('Supabase is currently unreachable.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user?.id]);

  useSyncAndRefresh(user?.id, () => refreshProfile({ silent: true }));

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      refreshProfile,
      loading,
      error,
    }),
    [profile, loading, error, refreshProfile]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
};