import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserContext';

type ProfileType = {
  fish_color?: string;
  fish_name?: string;
  onboarding_completed?: boolean;
};

type ProfileContextType = {
  profile: ProfileType | null;
  setProfile: (profile: ProfileType | null) => void;
  refreshProfile: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfileType | null>(null);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('profiles')
      .select('fish_color, fish_name, onboarding_completed')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Profile fetch error:', error);
      setError(error.message);
      setLoading(false);
      return;
    }

    setProfile(data ?? null);
    setLoading(false);
  };

  useEffect(() => {
    refreshProfile();
  }, [user]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, refreshProfile, loading, error }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
};