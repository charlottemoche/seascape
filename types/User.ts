type UserContextType = {
  user: any | null;
  profile: { fish_color?: string; fish_name?: string } | null;
  setUser: (user: any | null) => void;
  loading: boolean;
};

export default UserContextType;