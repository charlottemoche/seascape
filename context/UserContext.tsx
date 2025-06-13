import React, { createContext, useEffect, useState, useContext, ReactNode, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  hasJournaledToday: boolean;
  hasMeditatedToday: boolean;
  loading: boolean;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasJournaledToday, setHasJournaledToday] = useState(false);
  const [hasMeditatedToday, setHasMeditatedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndStreaks = async (currentUser: User | null) => {
      if (!currentUser) {
        setUser(null);
        setHasJournaledToday(false);
        setHasMeditatedToday(false);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      setLoading(true);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const { data: journal } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('user_id', currentUser.id)
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());

      const { data: breaths } = await supabase
        .from('breaths')
        .select('id')
        .eq('user_id', currentUser.id)
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString());

      setHasJournaledToday((journal?.length ?? 0) > 0);
      setHasMeditatedToday((breaths?.length ?? 0) > 0);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserAndStreaks(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserAndStreaks(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    user,
    setUser,
    hasJournaledToday,
    hasMeditatedToday,
    loading,
  }), [user, hasJournaledToday, hasMeditatedToday, loading]);

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