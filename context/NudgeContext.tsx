import React, { createContext, useContext, useState } from 'react';

export type Nudge = {
  sender: string;
  type: 'hug' | 'breathe';
  senderId?: string;
} | null;

type Context = {
  nudge: Nudge;
  setNudge: (n: Nudge) => void
};

const Context = createContext<Context | null>(null);

export const NudgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nudge, setNudge] = useState<Nudge>(null);
  return <Context.Provider value={{ nudge, setNudge }}>{children}</Context.Provider>;
};

export const useNudge = () => {
  const c = useContext(Context);
  if (!c) throw new Error('useNudge must be inside NudgeProvider');
  return c;
};
