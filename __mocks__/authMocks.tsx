import React, { ReactNode, useMemo } from 'react';
import { SessionContext } from '@/context/SessionContext';

export const mockUser = {
  id: 'test-user',
  email: 'test@example.com',
} as any;

export const mockProfile = {
  total_minutes: 120,
  journal_streak: 0,
  breath_streak: 0,
  last_active: '2025-06-16',
};

export const MockUserProvider = ({ children }: { children: ReactNode }) => {
  const contextValue = useMemo(() => ({
    user: mockUser,
    profile: mockProfile,
    loading: false,
    sessionChecked: true,
    refreshProfile: jest.fn(),
    refreshProfileQuiet: jest.fn(),
  }), []);

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
};