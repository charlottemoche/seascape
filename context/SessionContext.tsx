import React, { createContext, useState, useEffect, useMemo, ReactNode, useRef } from 'react';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';
import { syncGuestDataToProfile } from '@/lib/syncGuestData';
import type { User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Profile = {
  fish_color?: string;
  fish_name?: string;
  onboarding_completed?: boolean;
  has_played?: boolean;
  high_score?: number;
  total_minutes?: number;
  admin?: boolean;
  friend_code?: string;
  expo_push_token?: string | null;
};

type SessionContext = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  sessionChecked: boolean;
  refreshProfile(): Promise<void>;
  refreshProfileQuiet(): Promise<void>;
};

export const SessionContext = createContext<SessionContext | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setChecked] = useState(false);

  const hasSyncedRef = useRef(false);

  async function _fetchAndSetProfile() {
    if (!user) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'fish_color, fish_name, onboarding_completed, high_score, total_minutes, admin, has_played, friend_code, expo_push_token'
        )
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.warn('[SessionProvider] profile fetch failed', err);
      setProfile(null);
    }
  }

  async function refreshProfile() {
    setLoading(true);
    try {
      await _fetchAndSetProfile();
    } finally {
      setLoading(false);
    }
  }

  async function refreshProfileQuiet() {
    await _fetchAndSetProfile();
  }

  useEffect(() => {
    supabase.auth.startAutoRefresh();
    const appSub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
      supabase.auth.stopAutoRefresh();
      appSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    refreshProfileQuiet().finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user || hasSyncedRef.current) return;

    (async () => {
      try {
        await syncGuestDataToProfile(user.id);
        hasSyncedRef.current = true;
        await refreshProfileQuiet();
      } catch (err) {
        console.warn('[SessionProvider] guest->profile sync failed', err);
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    if (profile?.onboarding_completed) {
      AsyncStorage.setItem('onboarding_completed', 'true');
    }
  }, [profile?.onboarding_completed]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      sessionChecked,
      refreshProfile,
      refreshProfileQuiet,
    }),
    [user, profile, loading, sessionChecked]
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = React.useContext(SessionContext);
  if (!context) throw new Error('useSession must be inside <SessionProvider>');
  return context;
}