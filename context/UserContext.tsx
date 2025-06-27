import React, { createContext, useEffect, useState, useContext, ReactNode, useMemo } from 'react';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  sessionChecked: boolean;
  pushEnabled: boolean | null;
  setPushEnabled: (b: boolean) => void;
};

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [pushEnabled, setPushEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setPushEnabled(null);
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('expo_push_token')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.warn('[UserProvider] expo_push_token fetch failed:', error);
        setPushEnabled(false);
      } else {
        setPushEnabled(!!data?.expo_push_token);
      }
    })();
  }, [user?.id]);

  useEffect(() => {
    // Start token auto-refresh
    supabase.auth.startAutoRefresh();

    // Listen for app state changes to start/stop token refresh
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('[UserProvider] Failed to get session:', error.message);
      }

      setUser(session?.user ?? null);
      setLoading(false);
      setSessionChecked(true);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
      supabase.auth.stopAutoRefresh();
      appStateSubscription.remove();
    };
  }, []);

  const value = useMemo(() => ({
    user,
    setUser,
    loading,
    sessionChecked,
    pushEnabled,
    setPushEnabled,
  }), [user, loading, sessionChecked, pushEnabled]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
