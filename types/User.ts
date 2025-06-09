type UserContextType = {
  user: any | null;
  setUser: (user: any | null) => void;
  hasJournaledToday: boolean;
  hasMeditatedToday: boolean;
  loading: boolean;
};

export default UserContextType;