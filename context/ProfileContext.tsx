import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserContext';

type ProfileType = {
  fish_color?: string;
  fish_name?: string;
};

type ProfileContextType = {
  profile: ProfileType | null;
  setProfile: (profile: ProfileType | null) => void;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfileType | null>(null);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('fish_color, fish_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Profile fetch error:', error);
    } else {
      setProfile(data ?? null);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [user]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
};