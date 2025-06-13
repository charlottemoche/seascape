import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserContext';

type ProfileType = {
  fish_color?: string;
  fish_name?: string;
  onboarding_completed?: boolean;
  high_score?: number;
  journal_streak?: number;
  breath_streak?: number;
  total_minutes?: number;
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

  const refreshProfile = async ({ silent = false } = {}) => {
    if (!user?.id) {
      if (!silent) setLoading(false);
      return;
    }

    if (!silent) setLoading(true);

    await supabase.rpc('refresh_journal_streak', { uid: user.id });
    await supabase.rpc('refresh_breath_streak', { uid: user.id });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('fish_color, fish_name, onboarding_completed, high_score, journal_streak, breath_streak, total_minutes')
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
  };

  useEffect(() => {
    refreshProfile();
  }, [user]);

  const value = useMemo(() => ({
    profile,
    setProfile,
    refreshProfile,
    loading,
    error,
  }), [profile, loading, error, refreshProfile]);

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