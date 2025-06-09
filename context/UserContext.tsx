import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  ReactNode,
} from 'react';
import { supabase } from '@/utils/supabase';
import UserContextType from '@/types/User';

const UserContext = createContext<UserContextType | null>(null);

type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<any | null>(null);
  const [hasJournaledToday, setHasJournaledToday] = useState(false);
  const [hasMeditatedToday, setHasMeditatedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
      return;
    }

    const loadUserData = async () => {
      const today = new Date().toISOString().split('T')[0];

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setLoading(false);
        return;
      }

      setUser(user);

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

    loadUserData();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, setUser, hasJournaledToday, hasMeditatedToday, loading }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};