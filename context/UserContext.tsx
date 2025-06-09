// context/UserContext.tsx
import React, { createContext, useEffect, useState, useContext, ReactNode } from 'react';
import { supabase } from '@/utils/supabase';

type UserContextType = {
  user: any | null;
  setUser: (user: any | null) => void;
  hasJournaledToday: boolean;
  hasMeditatedToday: boolean;
  loading: boolean;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [hasJournaledToday, setHasJournaledToday] = useState(false);
  const [hasMeditatedToday, setHasMeditatedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndStreaks = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setLoading(false);
        return;
      }

      setUser(user);
      const today = new Date().toISOString().split('T')[0];

      const { data: journal } = await supabase
        .from('journal')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today);

      const { data: breaths } = await supabase
        .from('breaths')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today);

      setHasJournaledToday((journal?.length ?? 0) > 0);
      setHasMeditatedToday((breaths?.length ?? 0) > 0);
      setLoading(false);
    };

    fetchUserAndStreaks();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, hasJournaledToday, hasMeditatedToday, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};